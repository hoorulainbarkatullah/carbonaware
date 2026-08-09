import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause, isValidObjectId } from "@/lib/db-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";
    const challengeId = searchParams.get("challengeId");
    const leaderboardFilter = searchParams.get("timeframe") || "all";

    const userWhere = buildUserWhereClause(userId);

    // 1. Fetch User details safely from MongoDB
    const user = userWhere
      ? await (prisma as any).user.findFirst({ where: userWhere })
      : null;

    const points = user?.points ?? 1280;
    const streak = user?.streak ?? 3;
    const xp = user?.xp ?? 450;
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

    // 4. Badges
    const allBadges = await (prisma as any).badge.findMany({
      orderBy: { scoreReq: "asc" },
    });

    const userBadges = user
      ? await (prisma as any).userBadge.findMany({ where: { userId: user.id } })
      : [];
    const unlockedBadgeIds = new Set(userBadges.map((ub: any) => ub.badgeId));

    const formattedBadges = allBadges.map((b: any) => {
      const isUnlocked = unlockedBadgeIds.has(b.id) || unlockedBadgeIds.has(b.name);
      return {
        id: b.id,
        name: b.name,
        req: b.description || `Score ${b.scoreReq}% or more`,
        scoreReq: b.scoreReq,
        icon: b.icon,
        color: b.color,
        unlocked: isUnlocked,
        earnedDate: userBadges.find((ub: any) => ub.badgeId === b.id || ub.badgeId === b.name)?.earnedDate,
      };
    });

    // 5. Leaderboard
    let dateFilter: Date | undefined;
    const now = new Date();
    if (leaderboardFilter === "weekly") {
      dateFilter = new Date(now.setDate(now.getDate() - 7));
    } else if (leaderboardFilter === "monthly") {
      dateFilter = new Date(now.setMonth(now.getMonth() - 1));
    }

    const dbLeaderboard = await (prisma as any).user.findMany({
      where: dateFilter ? { updatedAt: { gte: dateFilter } } : {},
      orderBy: { points: "desc" },
      take: 20,
      select: { id: true, name: true, email: true, points: true, location: true, level: true },
    });

    const leaderboard = dbLeaderboard.map((u: any, idx: number) => ({
      rank: idx + 1,
      name: u.name,
      points: u.points,
      level: u.level || 1,
      location: u.location || "Peshawar, KP",
      isUser: u.id === user?.id || u.email === user?.email,
    }));

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

    const userWhere = buildUserWhereClause(userId);
    const user = userWhere ? await (prisma as any).user.findFirst({ where: userWhere }) : null;
    const targetUserId = user?.id || userId;

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

    if (user) {
      const newXp = (user.xp || 0) + (passed ? earnedXp : 0);
      const newLevel = Math.floor(newXp / 500) + 1;

      await (prisma as any).user.update({
        where: { id: user.id },
        data: {
          points: { increment: earnedPoints },
          xp: newXp,
          level: newLevel,
        },
      });

      if (passed && targetChallenge.badgeReward) {
        const badgeObj = await (prisma as any).badge.findFirst({
          where: { name: targetChallenge.badgeReward },
        });
        if (badgeObj) {
          const existingUserBadge = await (prisma as any).userBadge.findFirst({
            where: { userId: user.id, badgeId: badgeObj.id },
          });
          if (!existingUserBadge) {
            await (prisma as any).userBadge.create({
              data: { userId: user.id, badgeId: badgeObj.id },
            });
          }
        }
      }

      await (prisma as any).notification.create({
        data: {
          userId: user.id,
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

