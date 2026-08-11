import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Delete pre-seeded mock questions
    await (prisma as any).question.deleteMany({
      where: {
        author: { in: ["Ali Raza", "Sara Ahmed", "Noor Fatima", "Hamza Ali"] },
      },
    });

    return NextResponse.json({ success: true, message: "Cleared pre-seeded dummy questions" });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Failed to delete dummy questions" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete pre-seeded mock questions
    await (prisma as any).question.deleteMany({
      where: {
        author: { in: ["Ali Raza", "Sara Ahmed", "Noor Fatima", "Hamza Ali"] },
      },
    });

    return NextResponse.json({ success: true, message: "Cleared pre-seeded dummy questions" });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Failed to delete dummy questions" }, { status: 500 });
  }
}
