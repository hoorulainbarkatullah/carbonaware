import { NextResponse } from "next/server";
import crypto from "crypto";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("carbon_aware");
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password using built-in sha256
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      location: "Peshawar, KP",
      carbonGoal: 2.5,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        location: newUser.location,
        carbonGoal: newUser.carbonGoal,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
