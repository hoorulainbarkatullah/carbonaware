import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause } from "@/lib/db-utils";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    // Fetch user progress from MongoDB
    let progress = await (prisma as any).userLearningProgress.findFirst({
      where: { userId },
    });

    if (!progress) {
      // Create clean progress record for user if non-existent
      progress = await (prisma as any).userLearningProgress.create({
        data: {
          userId,
          topicsCompleted: 0,
          lessonsCompleted: 0,
          certificatesEarned: 0,
          progressPercentage: 0,
          completedTopicIds: [],
          completedLessonIds: [],
        },
      });
    }

    // Community Highlights / Real MongoDB Users Leaderboard
    const client = await clientPromise;
    const mongoDb = client.db("carbon_aware");
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

    const highlights = realUsers.slice(0, 5).map((u, idx) => {
      let badge = "Active Learner";
      if (idx === 0) badge = "Eco Champion";
      else if (idx === 1) badge = "Active Contributor";
      else if (idx === 2) badge = "Rising Star";

      return {
        id: u.id,
        rank: idx + 1,
        name: u.name,
        badge,
        subTitle: `Rank #${idx + 1} • ${u.points} Eco Points`,
        points: u.points,
      };
    });

    return NextResponse.json({
      success: true,
      progress,
      highlights,
    });
  } catch (error: any) {
    console.error("GET /api/learning-progress error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, action, topicId, lessonId } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Missing required userId" }, { status: 400 });
    }

    let progress = await (prisma as any).userLearningProgress.findFirst({
      where: { userId },
    });

    if (!progress) {
      progress = await (prisma as any).userLearningProgress.create({
        data: {
          userId,
          topicsCompleted: 0,
          lessonsCompleted: 0,
          certificatesEarned: 0,
          progressPercentage: 0,
          completedTopicIds: [],
          completedLessonIds: [],
        },
      });
    }

    let completedLessonIds: string[] = progress.completedLessonIds || [];
    let completedTopicIds: string[] = progress.completedTopicIds || [];

    if (action === "complete_lesson") {
      if (lessonId && !completedLessonIds.includes(lessonId)) {
        completedLessonIds.push(lessonId);
      }

      const lessonsCount = completedLessonIds.length;
      // Calculate progress percentage (total 15 lessons across topics)
      const pct = Math.min(100, Math.round((lessonsCount / 15) * 100));

      const updatedProgress = await (prisma as any).userLearningProgress.update({
        where: { id: progress.id },
        data: {
          lessonsCompleted: lessonsCount,
          completedLessonIds,
          progressPercentage: pct,
        },
      });

      // Award 20 Eco Points in MongoDB User document
      const userWhere = buildUserWhereClause(userId);
      if (userWhere) {
        await prisma.user.updateMany({
          where: userWhere,
          data: { points: { increment: 20 } },
        });
      }

      // Generate System Notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Lesson Completed! 📚",
          message: "You completed a lesson in Learning Hub and earned +20 Eco Points.",
          read: false,
        },
      });

      return NextResponse.json({ success: true, progress: updatedProgress });
    }

    if (action === "complete_topic") {
      if (topicId && !completedTopicIds.includes(topicId)) {
        completedTopicIds.push(topicId);
      }

      const topicsCount = completedTopicIds.length;
      const certsCount = topicsCount; // 1 cert per completed topic
      const pct = Math.min(100, Math.round((completedLessonIds.length / 15) * 100));

      const updatedProgress = await (prisma as any).userLearningProgress.update({
        where: { id: progress.id },
        data: {
          topicsCompleted: topicsCount,
          completedTopicIds,
          certificatesEarned: certsCount,
          progressPercentage: pct,
        },
      });

      // Award 50 Eco Points in MongoDB User document
      const userWhere = buildUserWhereClause(userId);
      if (userWhere) {
        await prisma.user.updateMany({
          where: userWhere,
          data: { points: { increment: 50 } },
        });
      }

      // Issue Certificate in MongoDB Certificate model
      await (prisma as any).certificate.create({
        data: {
          userId,
          title: `Sustainability Mastery Certificate - Topic ${topicsCount}`,
          topicId,
        },
      });

      // Generate System Notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Topic Completed & Certificate Issued! 🎓",
          message: `Congratulations! You finished the topic and earned a Certificate + 50 Eco Points.`,
          read: false,
        },
      });

      return NextResponse.json({ success: true, progress: updatedProgress });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/learning-progress error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
