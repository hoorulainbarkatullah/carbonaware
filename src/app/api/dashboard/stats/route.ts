import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause } from "@/lib/db-utils";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";
    const timeframe = searchParams.get("timeframe") || "all";

    const userWhere = buildUserWhereClause(userId);

    // 1. Fetch User details safely from MongoDB users collection directly
    const client = await clientPromise;
    const mongoDb = client.db("carbon_aware");
    const mongoUser = await mongoDb.collection("users").findOne({
      $or: [
        { email: userId.toLowerCase().trim() },
        ...(userId.length === 24 ? [{ _id: new (require("mongodb").ObjectId)(userId) }] : [])
      ],
    });

    const user: any = mongoUser
      ? { ...mongoUser, id: mongoUser._id.toString() }
      : (userWhere ? await prisma.user.findFirst({ where: userWhere }) : null);

    // 2. Fetch Carbon Calculations
    const calculations = await prisma.carbonCalculation.findMany({
      where: { userId: user?.id || userId },
      orderBy: { createdAt: "asc" },
    });

    const totalCalculations = calculations.length;
    const latest = totalCalculations > 0 ? calculations[totalCalculations - 1] : null;
    const previous = totalCalculations > 1 ? calculations[totalCalculations - 2] : null;

    const totalEmission = latest?.totalEmission ?? ((latest?.transportEmission ?? 0) + (latest?.foodEmission ?? 0));
    const transportEmission = latest?.transportEmission ?? 0;
    const foodEmission = latest?.foodEmission ?? 0;

    const validTotals = calculations.map((c) => c.totalEmission ?? ((c.transportEmission ?? 0) + (c.foodEmission ?? 0)));
    const sumTotal = validTotals.reduce((acc, curr) => acc + curr, 0);
    const monthlyAverage = parseFloat((sumTotal / (validTotals.length || 1)).toFixed(2));

    let percentageChange = 0;
    if (previous) {
      const prevTotal = previous.totalEmission ?? ((previous.transportEmission ?? 0) + (previous.foodEmission ?? 0));
      if (prevTotal > 0) {
        percentageChange = parseFloat((((totalEmission - prevTotal) / prevTotal) * 100).toFixed(1));
      }
    }

    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const lineChartData = calculations.slice(-6).map((c) => {
      const val = c.totalEmission ?? ((c.transportEmission ?? 0) + (c.foodEmission ?? 0));
      return {
        month: monthFormatter.format(new Date(c.createdAt)),
        val: parseFloat(val.toFixed(2)),
      };
    });

    const calculatedTotal = transportEmission + foodEmission;
    const tPct = calculatedTotal > 0 ? Math.round((transportEmission / calculatedTotal) * 100) : 0;
    const fPct = calculatedTotal > 0 ? 100 - tPct : 0;

    const breakdownData = [
      { name: "Transport", pct: tPct, val: parseFloat(transportEmission.toFixed(2)), color: "#16a34a" },
      { name: "Food", pct: fPct, val: parseFloat(foodEmission.toFixed(2)), color: "#f59e0b" },
    ];

    // 3. Fetch Real Badges from MongoDB
    let allBadges = await prisma.badge.findMany({ orderBy: { scoreReq: "asc" } });

    // Ensure Badges schema matches 30%, 60%, 80%, 90%+ requirements
    const standardBadges = [
      { id: "b1", name: "Eco Beginner", description: "30% Challenge Completion", scoreReq: 30, icon: "CheckCircle", color: "emerald" },
      { id: "b2", name: "Eco Explorer", description: "60% Challenge Completion", scoreReq: 60, icon: "Globe", color: "blue" },
      { id: "b3", name: "Eco Expert", description: "80% Challenge Completion", scoreReq: 80, icon: "Shield", color: "purple" },
      { id: "b4", name: "Eco Champion", description: "90%+ Challenge Completion", scoreReq: 90, icon: "Trophy", color: "amber" },
    ];

    if (allBadges.length < 4) {
      await prisma.badge.deleteMany({});
      for (const b of standardBadges) {
        await prisma.badge.create({ data: b });
      }
      allBadges = await prisma.badge.findMany({ orderBy: { scoreReq: "asc" } });
    }

    const targetUid = user?._id?.toString() || user?.id || userId;
    const userBadges = targetUid
      ? await (prisma as any).userBadge.findMany({
          where: {
            OR: [
              { userId: targetUid },
              { userId: user?.id },
              { userId: user?.email }
            ]
          }
        })
      : [];

    const userProgresses = targetUid
      ? await (prisma as any).userChallengeProgress.findMany({
          where: {
            OR: [
              { userId: targetUid },
              { userId: user?.id },
              { userId: user?.email }
            ]
          }
        })
      : [];

    const allChallengesCount = await prisma.challenge.count() || 9;
    const completedChallengesCount = userProgresses.filter((p: any) => p.isCompleted).length;
    const completionPercentage = Math.round((completedChallengesCount / allChallengesCount) * 100);

    const maxAttemptScore = userProgresses.reduce((max: number, curr: any) => Math.max(max, curr.score || 0), 0);

    const unlockedBadgeIds = new Set(userBadges.map((b: any) => b.badgeId));

    const badges = standardBadges.map((b) => {
      let isUnlocked = unlockedBadgeIds.has(b.id) || unlockedBadgeIds.has(b.name);

      if (b.scoreReq === 30 && completionPercentage >= 30) {
        isUnlocked = true;
      } else if (b.scoreReq === 60 && completionPercentage >= 60) {
        isUnlocked = true;
      } else if (b.scoreReq === 80 && completionPercentage >= 80) {
        isUnlocked = true;
      } else if (b.scoreReq === 90 && completionPercentage >= 90) {
        isUnlocked = true;
      }

      return {
        id: b.id,
        name: b.name,
        desc: b.description,
        scoreReq: b.scoreReq,
        active: isUnlocked,
        locked: !isUnlocked,
        color: isUnlocked
          ? "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0] shadow-sm opacity-100"
          : "bg-slate-100/70 text-slate-400 border-slate-200/80 grayscale opacity-40",
      };
    });

    const userPoints = user?.points ?? 0;

    // 4. Fetch Real Leaderboard from MongoDB (excluding admin accounts)
    const mongoUsers = await mongoDb.collection("users").find({}).sort({ points: -1 }).toArray();

    const realUsers = mongoUsers
      .map((u: any) => ({
        id: u._id.toString(),
        name: u.name || "User",
        email: u.email || "",
        role: u.role || (u.email && u.email.toLowerCase().includes("admin") ? "admin" : "user"),
        points: u.points ?? 0,
      }))
      .filter((u) => u.role !== "admin" && !u.email.toLowerCase().includes("admin"));

    const leaderboard = realUsers.slice(0, 5).map((u, idx) => ({
      rank: idx + 1,
      name: u.id === user?.id || u.email === user?.email ? `${u.name} (You)` : u.name,
      points: u.points,
      avatar: u.name.substring(0, 2).toUpperCase(),
      isUser: u.id === user?.id || u.email === user?.email,
    }));

    // 5. Fetch Real AI Recommendations
    const dbRecs = await prisma.recommendation.findMany({
      where: { userId: user?.id || userId, status: "Active" },
      take: 3,
    });

    const recommendations = dbRecs.map((r) => ({
      id: r.id,
      title: r.title,
      desc: `${r.description} (${r.co2Savings})`,
      category: r.category,
    }));

    // 6. Fetch Real Active Challenges & Progress
    let dbChallenges = await prisma.challenge.findMany({ take: 3 });
    const userProgress = (user?._id || user?.id)
      ? await (prisma as any).userChallengeProgress.findMany({
          where: {
            OR: [
              { userId: user?.id },
              { userId: user?._id?.toString() },
              { userId: userId }
            ]
          }
        })
      : [];

    const activeChallenges = dbChallenges.map((c, i) => {
      const prog = userProgress.find((p: any) => p.challengeId === c.id);
      const isDone = prog?.isCompleted || false;
      const totalQ = c.totalQuestions || 10;
      const completedQ = isDone ? totalQ : (prog?.completedQuestions || 0);
      const progressPct = Math.round((completedQ / totalQ) * 100);

      const colors = ["bg-[#22c55e]", "bg-amber-500", "bg-purple-500"];
      return {
        id: c.id,
        title: c.title,
        desc: c.description,
        progress: progressPct,
        daysLeft: c.deadline ? 5 : 7,
        color: colors[i % colors.length],
      };
    });

    // 7. Fetch Real Learning Hub Progress
    const learningProgress = (user?._id || user?.id)
      ? await (prisma as any).userLearningProgress.findFirst({
          where: {
            OR: [
              { userId: user?.id },
              { userId: user?._id?.toString() },
              { userId: userId }
            ]
          }
        })
      : null;

    const learningHubWidget = {
      title: "What is Carbon Footprint?",
      desc: "Learn the basics of carbon footprint and its impact on climate change.",
      progress: learningProgress?.progressPercentage || 0,
    };

    return NextResponse.json({
      success: true,
      userPoints,
      hasData: totalCalculations > 0,
      latest: {
        totalEmission: parseFloat(totalEmission.toFixed(2)),
        transportEmission: parseFloat(transportEmission.toFixed(2)),
        foodEmission: parseFloat(foodEmission.toFixed(2)),
      },
      monthlyAverage,
      percentageChange,
      totalCalculations,
      lineChartData,
      breakdownData,
      badges,
      leaderboard,
      recommendations,
      activeChallenges,
      learningHubWidget,
    });
  } catch (error: any) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
