import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    const dbNotifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (dbNotifications.length === 0) {
      const defaultNotifications = [
        {
          id: "notif-1",
          userId,
          title: "Calculation Recorded 🌿",
          message: "Your monthly carbon calculation has been updated successfully.",
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "notif-2",
          userId,
          title: "Eco Target On Track 🎯",
          message: "You are currently 15% below your target threshold of 2.5 tons CO₂.",
          read: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "notif-3",
          userId,
          title: "Weekly Summary Available 📊",
          message: "View your new footprint breakdown and regional rankings.",
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      return NextResponse.json({
        success: true,
        notifications: defaultNotifications,
        unreadCount: 2,
      });
    }

    const unreadCount = dbNotifications.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: dbNotifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: "Marked all as read" });
  } catch (error: any) {
    console.error("PUT notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

