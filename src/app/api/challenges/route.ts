import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause, isValidObjectId } from "@/lib/db-utils";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";
    const challengeId = searchParams.get("challengeId");
    const leaderboardFilter = searchParams.get("timeframe") || "all";

    const userWhere = buildUserWhereClause(userId);

    // 1. Fetch User details safely from MongoDB users collection directly
    const client = await clientPromise;
    const mongoDb = client.db("carbon_aware");

    const queryConditions: any[] = [{ email: userId.toLowerCase().trim() }];
    if (isValidObjectId(userId)) {
      queryConditions.push({ _id: new ObjectId(userId) });
    }

    const mongoUser = await mongoDb.collection("users").findOne({
      $or: queryConditions,
    });

    const user = mongoUser
      ? { ...mongoUser, id: mongoUser._id.toString() }
      : (userWhere ? await (prisma as any).user.findFirst({ where: userWhere }) : null);

    const points = user?.points ?? 0;
    const streak = user?.streak ?? 0;
    const xp = user?.xp ?? 0;
    const level = user?.level ?? 1;

    // 2. Fetch all challenges or selected challenge
    let dbChallenges = await (prisma as any).challenge.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (challengeId) {
      if (!isValidObjectId(challengeId)) {
        return NextResponse.json(
          { success: false, message: "Invalid challengeId format." },
          { status: 400 }
        );
      }

      const challenge = await (prisma as any).challenge.findUnique({
        where: { id: challengeId },
      });
      const questions = await (prisma as any).challengeQuestion.findMany({
        where: { challengeId },
      });
      return NextResponse.json({
        success: true,
        challenge,
        questions,
      });
    }

    // 3. User Progress
    const allUserProgress = await (prisma as any).userChallengeProgress.findMany({
      where: { userId: user?.id || userId },
    });

    const featuredChallenge = dbChallenges.find((c: any) => c.isFeatured) || dbChallenges[0];
    const currentProgress = featuredChallenge
      ? allUserProgress.find((p: any) => p.challengeId === featuredChallenge.id)
      : null;

    const standardBadges = [
      { id: "b1", name: "Eco Beginner", description: "30% Challenge Completion", scoreReq: 30, icon: "CheckCircle", color: "emerald" },
      { id: "b2", name: "Eco Explorer", description: "60% Challenge Completion", scoreReq: 60, icon: "Globe", color: "blue" },
      { id: "b3", name: "Eco Expert", description: "80% Challenge Completion", scoreReq: 80, icon: "Shield", color: "purple" },
      { id: "b4", name: "Eco Champion", description: "90%+ Challenge Completion", scoreReq: 90, icon: "Trophy", color: "amber" },
    ];

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
    const unlockedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));

    const allChallengesCount = dbChallenges.length || 9;
    const completedChallengesCount = allUserProgress.filter((p: any) => p.isCompleted).length;
    const completionPercentage = Math.round((completedChallengesCount / allChallengesCount) * 100);
    const maxAttemptScore = allUserProgress.reduce((max: number, curr: any) => Math.max(max, curr.score || 0), 0);

    const formattedBadges = standardBadges.map((b: any) => {
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
        req: b.description,
        scoreReq: b.scoreReq,
        icon: b.icon,
        color: b.color,
        unlocked: isUnlocked,
        earnedDate: userBadges.find((ub: any) => ub.badgeId === b.id || ub.badgeId === b.name)?.earnedDate,
      };
    });

    // 5. Fetch Real Leaderboard from MongoDB (excluding admin accounts & emails)
    const mongoUsers = await mongoDb.collection("users").find({}).sort({ points: -1 }).toArray();

    const realUsers = mongoUsers
      .map((u: any) => ({
        id: u._id.toString(),
        name: u.name || "User",
        email: u.email || "",
        role: u.role || (u.email && u.email.toLowerCase().includes("admin") ? "admin" : "user"),
        points: u.points ?? 0,
        level: u.level || 1,
        location: u.location || "Peshawar, KP",
      }))
      .filter((u) => u.role !== "admin" && !u.email.toLowerCase().includes("admin"));

    const leaderboard = realUsers.slice(0, 20).map((u: any, idx: number) => {
      const isCurrentLoggedInUser =
        (user?.id && u.id === user.id) ||
        (user?.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
        (userId && (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()));

      return {
        rank: idx + 1,
        name: isCurrentLoggedInUser ? `${u.name} (You)` : u.name,
        points: u.points,
        level: u.level || 1,
        location: u.location || "Peshawar, KP",
        isUser: isCurrentLoggedInUser,
      };
    });

    // 6. Completed Challenges
    const completedProgressList = allUserProgress.filter((p: any) => p.isCompleted);
    const completedList = completedProgressList.map((p: any) => {
      const matchChallenge = dbChallenges.find((c: any) => c.id === p.challengeId);
      return {
        id: p.id,
        challengeId: p.challengeId,
        title: matchChallenge?.title || "Eco Quiz Challenge",
        category: matchChallenge?.category || "Quiz",
        points: matchChallenge?.rewardPoints || matchChallenge?.points || 100,
        completedDate: new Date(p.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });

    const totalScoreSum = allUserProgress.reduce((acc: number, curr: any) => acc + curr.score, 0);
    const avgScore = allUserProgress.length > 0 ? Math.round(totalScoreSum / allUserProgress.length) : 85;

    return NextResponse.json({
      success: true,
      data: {
        points,
        xp,
        level,
        streak,
        challenges: dbChallenges,
        featuredChallenge,
        progress: {
          completedQuestions: currentProgress?.completedQuestions ?? 3,
          totalQuestions: featuredChallenge?.totalQuestions ?? 10,
          score: currentProgress?.score ?? 85,
          isCompleted: currentProgress?.isCompleted ?? false,
        },
        badges: formattedBadges,
        leaderboard,
        stats: {
          challengesCompleted: completedList.length,
          averageScore: avgScore,
          currentStreak: streak,
        },
        completedChallenges: completedList,
      },
    });
  } catch (error: any) {
    console.error("GET challenges data error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, challengeId, score, userAnswers } = body;

    if (!userId || !challengeId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const mongoDb = client.db("carbon_aware");

    const queryConditions: any[] = [{ email: userId.toLowerCase().trim() }];
    if (isValidObjectId(userId)) {
      queryConditions.push({ _id: new ObjectId(userId) });
    }

    const mongoUser = await mongoDb.collection("users").findOne({
      $or: queryConditions,
    });

    const userWhere = buildUserWhereClause(userId);
    const user = mongoUser
      ? { ...mongoUser, id: mongoUser._id.toString() }
      : (userWhere ? await (prisma as any).user.findFirst({ where: userWhere }) : null);

    const targetUserId = user?.id || user?._id?.toString() || userId;

    const targetChallenge = await (prisma as any).challenge.findUnique({
      where: { id: challengeId },
    });

    if (!targetChallenge) {
      return NextResponse.json(
        { success: false, message: "Challenge not found." },
        { status: 404 }
      );
    }

    const calculatedScore = Number(score ?? 0);
    const passed = calculatedScore >= (targetChallenge.passingScore || 70);
    const earnedPoints = passed ? (targetChallenge.rewardPoints || targetChallenge.points || 100) : 10;
    const earnedXp = passed ? (targetChallenge.xpReward || 150) : 0;

    await (prisma as any).challengeAttempt.create({
      data: {
        userId: targetUserId,
        challengeId,
        score: calculatedScore,
        passed,
        answers: userAnswers || [],
        earnedPoints,
        earnedXp,
      },
    });

    let existingProgress = await (prisma as any).userChallengeProgress.findFirst({
      where: { userId: targetUserId, challengeId },
    });

    if (existingProgress) {
      await (prisma as any).userChallengeProgress.update({
        where: { id: existingProgress.id },
        data: {
          completedQuestions: targetChallenge.totalQuestions || 10,
          score: Math.max(existingProgress.score, calculatedScore),
          isCompleted: existingProgress.isCompleted || passed,
          attempts: (existingProgress.attempts || 0) + 1,
        },
      });
    } else {
      await (prisma as any).userChallengeProgress.create({
        data: {
          userId: targetUserId,
          challengeId,
          completedQuestions: targetChallenge.totalQuestions || 10,
          totalQuestions: targetChallenge.totalQuestions || 10,
          score: calculatedScore,
          isCompleted: passed,
          attempts: 1,
        },
      });
    }

    // Update User points, XP, Level & Badges in MongoDB users collection directly
    const postQueryConditions: any[] = [{ email: (user?.email || userId).toLowerCase().trim() }];
    if (user?._id) {
      postQueryConditions.push({ _id: user._id });
    } else if (isValidObjectId(userId)) {
      postQueryConditions.push({ _id: new ObjectId(userId) });
    }

    const currentUserDoc = await mongoDb.collection("users").findOne({
      $or: postQueryConditions,
    });

    if (currentUserDoc) {
      const currentPts = currentUserDoc.points ?? 0;
      const currentXp = currentUserDoc.xp ?? 0;
      const newPts = currentPts + earnedPoints;
      const newXp = currentXp + (passed ? earnedXp : 0);
      const newLevel = Math.floor(newXp / 500) + 1;

      await mongoDb.collection("users").updateOne(
        { _id: currentUserDoc._id },
        {
          $set: {
            points: newPts,
            xp: newXp,
            level: newLevel,
            updatedAt: new Date(),
          },
        }
      );

      // Also update Prisma user table to keep schemas strictly in sync
      try {
        await (prisma as any).user.update({
          where: { id: currentUserDoc._id.toString() },
          data: {
            points: newPts,
            xp: newXp,
            level: newLevel,
          },
        });
      } catch (e) {
        // Fallback search by email if id mismatch
        try {
          if (currentUserDoc.email) {
            await (prisma as any).user.updateMany({
              where: { email: currentUserDoc.email.toLowerCase().trim() },
              data: {
                points: newPts,
                xp: newXp,
                level: newLevel,
              },
            });
          }
        } catch (err) {}
      }

      if (passed && targetChallenge.badgeReward) {
        const badgeObj = await (prisma as any).badge.findFirst({
          where: { name: targetChallenge.badgeReward },
        });
        if (badgeObj) {
          const existingUserBadge = await (prisma as any).userBadge.findFirst({
            where: { userId: currentUserDoc._id.toString(), badgeId: badgeObj.id },
          });
          if (!existingUserBadge) {
            await (prisma as any).userBadge.create({
              data: { userId: currentUserDoc._id.toString(), badgeId: badgeObj.id },
            });
          }
        }
      }

      await (prisma as any).notification.create({
        data: {
          userId: currentUserDoc._id.toString(),
          title: passed ? "Challenge Passed! 🏆" : "Quiz Attempt Saved",
          message: passed
            ? `Congratulations! You passed ${targetChallenge.title} and earned +${earnedPoints} Eco Points.`
            : `You scored ${calculatedScore}% on ${targetChallenge.title}. Keep practicing to unlock rewards!`,
          read: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      score: calculatedScore,
      passed,
      earnedPoints,
      earnedXp,
    });
  } catch (error: any) {
    console.error("POST challenges error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}

