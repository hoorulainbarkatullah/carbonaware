import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    const latest = await prisma.carbonCalculation.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      calculation: latest || null,
    });
  } catch (error: any) {
    console.error("Fetch latest calculation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
