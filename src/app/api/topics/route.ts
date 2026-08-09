import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let whereClause: any = {};
    if (search.trim()) {
      whereClause = {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    let topics = await (prisma as any).learningTopic.findMany({
      where: whereClause,
      orderBy: { discussionsCount: "desc" },
    });

    if (topics.length === 0 && !search) {
      // Seed default topics matching the exact UI design
      const defaultTopics = [
        {
          title: "Climate Change 101",
          slug: "climate-change-101",
          description: "Basics of climate change, its causes and impacts.",
          lessonsCount: 15,
          category: "Basics",
          icon: "climate",
          discussionsCount: 2400,
        },
        {
          title: "Carbon Footprint",
          slug: "carbon-footprint",
          description: "Understand what a carbon footprint is and why it matters.",
          lessonsCount: 12,
          category: "Footprint",
          icon: "footprint",
          discussionsCount: 1800,
        },
        {
          title: "Carbon Footprint Calculations",
          slug: "carbon-footprint-calculations",
          description: "Learn how to calculate and track your emissions.",
          lessonsCount: 10,
          category: "Calculations",
          icon: "calculator",
          discussionsCount: 1200,
        },
        {
          title: "Solutions & Actions",
          slug: "solutions-and-actions",
          description: "Explore practical solutions and sustainable actions.",
          lessonsCount: 14,
          category: "Solutions",
          icon: "solutions",
          discussionsCount: 980,
        },
        {
          title: "Sustainability 101",
          slug: "sustainability-101",
          description: "Build a sustainable lifestyle and reduce your impact.",
          lessonsCount: 11,
          category: "Lifestyle",
          icon: "sustainability",
          discussionsCount: 750,
        },
      ];

      for (const t of defaultTopics) {
        await (prisma as any).learningTopic.create({ data: t });
      }

      topics = await (prisma as any).learningTopic.findMany({
        orderBy: { discussionsCount: "desc" },
      });
    }

    return NextResponse.json({ success: true, topics });
  } catch (error: any) {
    console.error("GET /api/topics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, lessonsCount, category, icon } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const newTopic = await (prisma as any).learningTopic.create({
      data: {
        title,
        slug,
        description,
        lessonsCount: lessonsCount ? Number(lessonsCount) : 10,
        category: category || "General",
        icon: icon || "climate",
        discussionsCount: 0,
      },
    });

    return NextResponse.json({ success: true, topic: newTopic });
  } catch (error: any) {
    console.error("POST /api/topics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
