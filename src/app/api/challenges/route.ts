import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    // 1. Fetch user data (points, streak, etc)
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });

    const points = user?.points ?? 1280;
    const streak = user?.streak ?? 3;

    // 2. User Progress for default quiz challenge
    let progress = await prisma.userChallengeProgress.findFirst({
      where: { userId },
    });

    if (!progress) {
      progress = {
        id: "p1",
        userId,
        challengeId: "c1",
        completedQuestions: 3,
        totalQuestions: 10,
        score: 85,
        isCompleted: false,
        updatedAt: new Date(),
      };
    }

    // 3. User Badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
    });
    const unlockedBadgeIds = userBadges.map((b) => b.badgeId);

    // 4. Badges Definition matching design
    const badges = [
      { id: "b1", name: "Eco Beginner", req: "Score 70% or more", icon: "shield-check", color: "emerald", unlocked: true },
      { id: "b2", name: "Eco Explorer", req: "Score 80% or more", icon: "globe-shield", color: "blue", unlocked: true },
      { id: "b3", name: "Eco Expert", req: "Score 90% or more", icon: "tree-shield", color: "purple", unlocked: unlockedBadgeIds.includes("b3") },
      { id: "b4", name: "Eco Champion", req: "Score 100%", icon: "trophy", color: "amber", unlocked: unlockedBadgeIds.includes("b4") },
    ];

    // 5. Leaderboard (Top 5 users ordered by points)
    const dbLeaderboard = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        points: true,
        location: true,
      },
    });

    const leaderboard = dbLeaderboard.length > 0
      ? dbLeaderboard.map((u, idx) => ({
          rank: idx + 1,
          name: u.name,
          points: u.points ?? 1200 - idx * 100,
          location: u.location || "Peshawar, KP",
          isUser: u.id === user?.id,
        }))
      : [
          { rank: 1, name: "Sara Khan", points: 1450, location: "Peshawar, KP", isUser: false },
          { rank: 2, name: user ? `${user.name} (You)` : "You", points, location: "Peshawar, KP", isUser: true },
          { rank: 3, name: "Hamza Bilal", points: 1120, location: "Lahore, PB", isUser: false },
          { rank: 4, name: "Ayesha Noor", points: 980, location: "Islamabad, ICT", isUser: false },
          { rank: 5, name: "Bilal Ahmed", points: 850, location: "Karachi, SD", isUser: false },
        ];

    // 6. Completed Challenges
    const completedChallenges = [
      { id: "cc1", title: "No Car Day Challenge", category: "Transport", points: 150, completedDate: "12 May 2026" },
      { id: "cc2", title: "Zero Plastic Week", category: "Lifestyle", points: 200, completedDate: "04 June 2026" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        points,
        streak,
        progress: {
          completedQuestions: progress.completedQuestions,
          totalQuestions: progress.totalQuestions,
          score: progress.score,
          isCompleted: progress.isCompleted,
        },
        badges,
        leaderboard,
        stats: {
          challengesCompleted: 2 + (progress.isCompleted ? 1 : 0),
          averageScore: 85,
          currentStreak: streak,
        },
        completedChallenges,
      },
    });
  } catch (error: any) {
    console.error("GET challenges data error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (action === "progress") {
      // Simulate answering 1 question or continuing quiz
      const updatedProgress = await prisma.userChallengeProgress.findFirst({
        where: { userId },
      });

      const nextCompleted = Math.min(10, (updatedProgress?.completedQuestions ?? 3) + 1);
      const isCompleted = nextCompleted === 10;

      const progress = await prisma.userChallengeProgress.upsert({
        where: { id: updatedProgress?.id || "p1" },
        update: {
          completedQuestions: nextCompleted,
          isCompleted,
          score: 85,
        },
        create: {
          userId,
          challengeId: "c1",
          completedQuestions: nextCompleted,
          totalQuestions: 10,
          score: 85,
          isCompleted,
        },
      });

      if (isCompleted) {
        // Award points to user
        await prisma.user.updateMany({
          where: { OR: [{ id: userId }, { email: userId }] },
          data: { points: { increment: 100 } },
        });
      }

      return NextResponse.json({ success: true, progress });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST challenges error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
