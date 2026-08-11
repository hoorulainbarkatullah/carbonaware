import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const question = await (prisma as any).question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const answers = await (prisma as any).answer.findMany({
      where: { questionId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, question, answers });
  } catch (error: any) {
    console.error("GET /api/questions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { action, userId, author, content } = body;

    // Fetch existing question
    const question = await (prisma as any).question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    if (action === "toggle_like") {
      if (!userId) {
        return NextResponse.json({ error: "User ID is required to like" }, { status: 400 });
      }

      const likedBy: string[] = question.likedBy || [];
      const hasLiked = likedBy.includes(userId);

      let updatedLikedBy: string[];
      let updatedLikes: number;

      if (hasLiked) {
        // Unlike: remove userId and decrease likes
        updatedLikedBy = likedBy.filter((u) => u !== userId);
        updatedLikes = Math.max(0, (question.likes || 1) - 1);
      } else {
        // Like: add userId and increase likes
        updatedLikedBy = [...likedBy, userId];
        updatedLikes = (question.likes || 0) + 1;
      }

      const updated = await (prisma as any).question.update({
        where: { id },
        data: {
          likes: updatedLikes,
          likedBy: updatedLikedBy,
        },
      });

      return NextResponse.json({
        success: true,
        question: updated,
        liked: !hasLiked,
      });
    }

    if (action === "add_comment") {
      if (!content || !content.trim()) {
        return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
      }

      const newAnswer = await (prisma as any).answer.create({
        data: {
          questionId: id,
          author: author || "Anonymous User",
          userId: userId || null,
          content: content.trim(),
        },
      });

      const updated = await (prisma as any).question.update({
        where: { id },
        data: {
          replies: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        answer: newAnswer,
        question: updated,
      });
    }

    if (action === "edit_question") {
      const { title, description, topic, difficultyTag, requestUserId } = body;

      if (!title || !description) {
        return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
      }

      // Check ownership
      const isOwner =
        question.userId === requestUserId ||
        (requestUserId && question.userId && question.userId.toString() === requestUserId.toString());

      if (!isOwner && question.userId) {
        return NextResponse.json({ error: "Unauthorized: You can only edit your own questions" }, { status: 403 });
      }

      const updated = await (prisma as any).question.update({
        where: { id },
        data: {
          title: title.trim(),
          description: description.trim(),
          topic: topic || question.topic,
          difficultyTag: difficultyTag || question.difficultyTag,
        },
      });

      return NextResponse.json({ success: true, question: updated });
    }

    const updated = await (prisma as any).question.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error("PUT /api/questions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const requestUserId = searchParams.get("userId");

    const question = await (prisma as any).question.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check ownership if question has userId
    if (question.userId && requestUserId) {
      const isOwner =
        question.userId === requestUserId ||
        question.userId.toString() === requestUserId.toString();
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized: You can only delete your own questions" }, { status: 403 });
      }
    }

    // Delete question and associated answers
    await (prisma as any).answer.deleteMany({
      where: { questionId: id },
    });

    await (prisma as any).question.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error: any) {
    console.error("DELETE /api/questions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

