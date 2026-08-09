import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause, isValidObjectId } from "@/lib/db-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return NextResponse.json({ success: false, message: "Missing topicId parameter" }, { status: 400 });
    }

    let lessons = [];
    if (isValidObjectId(topicId)) {
      lessons = await (prisma as any).lesson.findMany({
        where: { topicId },
        orderBy: { order: "asc" },
      });
    }

    if (lessons.length === 0) {
      // Find topic to generate relevant default lessons if not seeded in DB
      const topic = isValidObjectId(topicId)
        ? await (prisma as any).learningTopic.findUnique({ where: { id: topicId } })
        : await (prisma as any).learningTopic.findFirst({ where: { slug: topicId } });

      const topicTitle = topic?.title || "Sustainability Lesson";

      const defaultLessons = [
        {
          title: `Introduction to ${topicTitle}`,
          content: `Welcome to ${topicTitle}. In this lesson, we explore core principles of reducing greenhouse gas emissions and adopting eco-friendly daily habits. Understanding your baseline consumption is the first step toward impactful carbon reduction.`,
          order: 1,
        },
        {
          title: "Understanding Measurement & CO₂ Impact",
          content: "Greenhouse gases are measured in CO₂ equivalents (CO₂e). Every activity—from driving a gasoline car to heating water—has a measurable carbon intensity. By tracking these numbers, we can make informed choices.",
          order: 2,
        },
        {
          title: "Practical Steps for Immediate Carbon Reduction",
          content: "Small shifts create compounding positive changes. Switching to energy-efficient LED lighting, minimizing single-use plastics, choosing plant-rich meals 3 days a week, and utilizing public transit drastically reduce your footprint.",
          order: 3,
        },
      ];

      if (topic) {
        for (const l of defaultLessons) {
          await (prisma as any).lesson.create({
            data: {
              topicId: topic.id,
              ...l,
            },
          });
        }

        lessons = await (prisma as any).lesson.findMany({
          where: { topicId: topic.id },
          orderBy: { order: "asc" },
        });
      } else {
        lessons = defaultLessons.map((l, idx) => ({ id: `default-l-${idx}`, ...l }));
      }
    }

    return NextResponse.json({ success: true, lessons });
  } catch (error: any) {
    console.error("GET /api/topics/lessons error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
