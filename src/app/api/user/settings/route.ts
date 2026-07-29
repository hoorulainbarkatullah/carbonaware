import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location || "Peshawar, KP",
        carbonGoal: user.carbonGoal ?? 2.5,
      },
    });
  } catch (error: any) {
    console.error("GET user settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, name, location, carbonGoal } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user document exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let updatedUser;
    if (existingUser) {
      updatedUser = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          name: name.trim(),
          ...(location ? { location: location.trim() } : {}),
          ...(carbonGoal !== undefined ? { carbonGoal: Number(carbonGoal) } : {}),
        },
      });
    } else {
      updatedUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash: "",
          location: location ? location.trim() : "Peshawar, KP",
          carbonGoal: carbonGoal !== undefined ? Number(carbonGoal) : 2.5,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        location: updatedUser.location || "Peshawar, KP",
        carbonGoal: updatedUser.carbonGoal ?? 2.5,
      },
    });
  } catch (error: any) {
    console.error("PUT user settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

