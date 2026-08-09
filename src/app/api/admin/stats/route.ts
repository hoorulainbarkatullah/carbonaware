import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildUserWhereClause } from "@/lib/db-utils";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("carbon_aware");
    const usersCollection = db.collection("users");

    // Fetch all users directly from MongoDB "users" collection
    const mongoUsers = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const allUsers = mongoUsers.map((u: any) => ({
      id: u._id.toString(),
      name: u.name || u.email?.split("@")[0] || "User",
      email: u.email || "",
      role: u.role || (u.email && u.email.toLowerCase().includes("admin") ? "admin" : "user"),
      status: u.status || "approved",
      points: u.points ?? 1280,
      location: u.location || "Peshawar, KP",
      createdAt: u.createdAt || new Date(),
    }));

    // Exclude admin users from regular user management list
    const nonAdminUsers = allUsers.filter(
      (u) => u.role !== "admin" && !u.email.toLowerCase().includes("admin")
    );

    // Overview Stats (Exclude admins from users count)
    const usersCount = nonAdminUsers.length;
    const calculationsCount = await prisma.carbonCalculation.count();
    const topicsCount = await (prisma as any).learningTopic.count();
    const lessonsCount = await (prisma as any).lesson.count();
    const challengesCount = await prisma.challenge.count();
    const badgesCount = await prisma.badge.count();

    const recentCalculations = await prisma.carbonCalculation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      stats: {
        usersCount,
        calculationsCount,
        topicsCount,
        lessonsCount,
        challengesCount,
        badgesCount,
      },
      recentUsers: nonAdminUsers,
      users: nonAdminUsers,
      recentCalculations,
    });
  } catch (error: any) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { targetUserId, action, newRole } = await request.json();

    if (!targetUserId || !action) {
      return NextResponse.json({ success: false, message: "Missing targetUserId or action" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("carbon_aware");
    const usersCollection = db.collection("users");

    let query: any = { email: targetUserId.toLowerCase().trim() };
    if (/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
      const { ObjectId } = await import("mongodb");
      query = { _id: new ObjectId(targetUserId) };
    }

    if (action === "changeRole" && newRole) {
      await usersCollection.updateOne(query, {
        $set: { role: newRole, updatedAt: new Date() },
      });
      return NextResponse.json({ success: true, role: newRole });
    }

    const nextStatus = action === "suspend" ? "suspended" : "approved";

    await usersCollection.updateOne(query, {
      $set: { status: nextStatus, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error: any) {
    console.error("POST /api/admin/stats error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
