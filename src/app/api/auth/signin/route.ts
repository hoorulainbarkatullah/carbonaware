import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carbon_aware");
    const usersCollection = db.collection("users");

    // Check if user exists
    const user = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Hash and compare
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        location: user.location || "Peshawar, KP",
        carbonGoal: user.carbonGoal || 2.5,
      },
    });
  } catch (error: any) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
