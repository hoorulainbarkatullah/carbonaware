import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "Recent";
    const search = searchParams.get("search") || "";
    const userId = searchParams.get("userId");

    let whereClause: any = {};

    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tab === "Unanswered") {
      whereClause.replies = 0;
    } else if (tab === "My Activity" && userId) {
      whereClause.userId = userId;
    }

    let orderBy: any = { createdAt: "desc" };
    if (tab === "Trending") {
      orderBy = { likes: "desc" };
    }

    let questions = await (prisma as any).question.findMany({
      where: whereClause,
      orderBy,
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, author, authorImage, userId, topic, difficultyTag } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const newQuestion = await (prisma as any).question.create({
      data: {
        title,
        description,
        author: author || "Anonymous Eco Warrior",
        authorImage: authorImage || null,
        userId: userId || null,
        topic: topic || "General",
        difficultyTag: difficultyTag || "Question",
        likes: 0,
        replies: 0,
        views: 0,
        solved: false,
        categoryTab: "Recent",
      },
    });

    if (userId) {
      // Award 25 points for posting a discussion
      await prisma.user.updateMany({
        where: { OR: [{ id: userId }, { email: userId }] },
        data: { points: { increment: 25 } },
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId,
          title: "Discussion Started 💬",
          message: `Your topic "${title}" was posted in Learning Hub (+25 Eco Points).`,
          read: false,
        },
      });
    }

    if (topic) {
      await (prisma as any).learningTopic.updateMany({
        where: { title: topic },
        data: { discussionsCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error: any) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
