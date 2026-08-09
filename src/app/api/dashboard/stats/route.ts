import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause } from "@/lib/db-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";
    const timeframe = searchParams.get("timeframe") || "all";

    const userWhere = buildUserWhereClause(userId);

    // 1. Fetch User details
    const user = userWhere ? await prisma.user.findFirst({ where: userWhere }) : null;

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

    if (allBadges.length === 0) {
      const defaultBadges = [
        { name: "Eco Beginner", description: "Score 70% or reach 100 Eco Points", scoreReq: 70, icon: "CheckCircle", color: "emerald" },
        { name: "Eco Explorer", description: "Reach 500 Eco Points", scoreReq: 500, icon: "Globe", color: "blue" },
        { name: "Eco Expert", description: "Reach 1000 Eco Points", scoreReq: 1000, icon: "Shield", color: "purple" },
        { name: "Eco Champion", description: "Reach 1500 Eco Points", scoreReq: 1500, icon: "Trophy", color: "amber" },
        { name: "Planet Guardian", description: "Reach 2000 Eco Points", scoreReq: 2000, icon: "Zap", color: "indigo" },
      ];

      for (const b of defaultBadges) {
        await prisma.badge.create({ data: b });
      }

      allBadges = await prisma.badge.findMany({ orderBy: { scoreReq: "asc" } });
    }

    const userBadges = user ? await prisma.userBadge.findMany({ where: { userId: user.id } }) : [];
    const unlockedBadgeIds = userBadges.map((b) => b.badgeId);

    const userPoints = user?.points ?? 1280;

    const badges = allBadges.map((b) => {
      const isUnlocked = unlockedBadgeIds.includes(b.id) || userPoints >= b.scoreReq;
      return {
        id: b.id,
        name: b.name,
        desc: b.description,
        active: isUnlocked,
        locked: !isUnlocked,
        // Active/Earned badges use vibrant emerald style, locked badges use distinct gray/amber pending lock style
        color: isUnlocked
          ? "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0] shadow-sm"
          : "bg-slate-100/80 text-slate-400 border-slate-200 opacity-60",
      };
    });

    // 4. Fetch Real Leaderboard
    const dbLeaderboard = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, points: true },
    });

    const leaderboard = dbLeaderboard.map((u, idx) => ({
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

    // 6. Fetch Real Active Challenges
    const dbChallenges = await prisma.challenge.findMany({
      where: { status: "Active" },
      take: 3,
    });

    const userProgress = user ? await prisma.userChallengeProgress.findMany({ where: { userId: user.id } }) : [];

    const activeChallenges = dbChallenges.map((c, i) => {
      const prog = userProgress.find((p) => p.challengeId === c.id);
      const completedQ = prog?.completedQuestions || 0;
      const totalQ = c.totalQuestions || 10;
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
    const learningProgress = user ? await (prisma as any).userLearningProgress.findFirst({ where: { userId: user.id } }) : null;

    const learningHubWidget = {
      title: "What is Carbon Footprint?",
      desc: "Learn the basics of carbon footprint and its impact on climate change.",
      progress: learningProgress?.progressPercentage || 0,
    };

    return NextResponse.json({
      success: true,
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
