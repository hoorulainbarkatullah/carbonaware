import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateTransportInput,
  validateFoodInput,
  calculateTransportEmission,
  calculateFoodEmission,
} from "@/lib/calculator";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId: reqUserId, transportData, foodData, calculationId } = body;
    const userId = reqUserId || "demo-user";

    // Helper to award points and notification upon calculation completion
    const onCalculationComplete = async (totalEmission: number, transportE: number, foodE: number) => {
      try {
        // Award 50 points to user
        await prisma.user.updateMany({
          where: { OR: [{ id: userId }, { email: userId }] },
          data: { points: { increment: 50 } },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            title: "New Calculation Saved 🌿",
            message: `Calculated total footprint: ${totalEmission} tons CO₂e (+50 Eco Points earned).`,
            read: false,
          },
        });

        // Auto-generate AI recommendations in MongoDB based on emissions
        if (transportE > foodE) {
          await (prisma as any).recommendation.create({
            data: {
              userId,
              title: "Switch to Electric or Public Transit",
              category: "Transport",
              description: `Your transport emissions account for ${((transportE / totalEmission) * 100).toFixed(0)}% of your footprint. Using public transit 2 days/week saves ~0.6 tons CO₂/yr.`,
              co2Savings: "-0.6 tons",
              status: "Active",
            },
          });
        } else {
          await (prisma as any).recommendation.create({
            data: {
              userId,
              title: "Adopt Plant-Rich Meals",
              category: "Food",
              description: `Food makes up ${((foodE / totalEmission) * 100).toFixed(0)}% of your footprint. Replacing red meat with plant-based options 3x/week lowers emissions significantly.`,
              co2Savings: "-0.45 tons",
              status: "Active",
            },
          });
        }
      } catch (e) {
        console.error("Auto trigger error after calculation:", e);
      }
    };

    if (action === "transport") {
      const val = validateTransportInput(transportData);
      if (!val.valid || !val.data) {
        return NextResponse.json({ error: val.error || "Invalid transport data" }, { status: 400 });
      }

      const transportEmission = calculateTransportEmission(val.data);

      const recent = await prisma.carbonCalculation.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (
        recent &&
        !recent.totalEmission &&
        JSON.stringify(recent.transportData) === JSON.stringify(val.data) &&
        recent.transportEmission === transportEmission
      ) {
        return NextResponse.json({
          success: true,
          calculation: recent,
          message: "Duplicate transport calculation skipped",
        });
      }

      if (calculationId) {
        const existing = await prisma.carbonCalculation.findUnique({
          where: { id: calculationId },
        });
        if (existing) {
          const updated = await prisma.carbonCalculation.update({
            where: { id: calculationId },
            data: {
              transportEmission,
              transportData: val.data as any,
            },
          });
          return NextResponse.json({ success: true, calculation: updated });
        }
      }

      const created = await prisma.carbonCalculation.create({
        data: {
          userId,
          transportEmission,
          transportData: val.data as any,
        },
      });

      return NextResponse.json({ success: true, calculation: created });
    }

    if (action === "food") {
      const val = validateFoodInput(foodData);
      if (!val.valid || !val.data) {
        return NextResponse.json({ error: val.error || "Invalid food data" }, { status: 400 });
      }

      const foodEmission = calculateFoodEmission(val.data);

      let calculationToUpdate = null;
      if (calculationId) {
        calculationToUpdate = await prisma.carbonCalculation.findUnique({
          where: { id: calculationId },
        });
      }

      if (!calculationToUpdate) {
        calculationToUpdate = await prisma.carbonCalculation.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
      }

      if (calculationToUpdate) {
        const updated = await prisma.carbonCalculation.update({
          where: { id: calculationToUpdate.id },
          data: {
            foodEmission,
            foodData: val.data as any,
          },
        });
        return NextResponse.json({ success: true, calculation: updated });
      }

      const created = await prisma.carbonCalculation.create({
        data: {
          userId,
          foodEmission,
          foodData: val.data as any,
        },
      });

      return NextResponse.json({ success: true, calculation: created });
    }

    if (action === "complete" || (!action && (transportData || foodData))) {
      let tEmission: number | null = null;
      let fEmission: number | null = null;
      let validatedTransport = null;
      let validatedFood = null;

      if (transportData) {
        const valT = validateTransportInput(transportData);
        if (valT.valid && valT.data) {
          validatedTransport = valT.data;
          tEmission = calculateTransportEmission(valT.data);
        }
      }

      if (foodData) {
        const valF = validateFoodInput(foodData);
        if (valF.valid && valF.data) {
          validatedFood = valF.data;
          fEmission = calculateFoodEmission(valF.data);
        }
      }

      let targetId = calculationId;
      if (!targetId) {
        const recent = await prisma.carbonCalculation.findFirst({
          where: { userId },
          orderBy: { createdAt: "desc" },
        });
        if (recent) targetId = recent.id;
      }

      if (targetId) {
        const current = await prisma.carbonCalculation.findUnique({ where: { id: targetId } });
        if (current) {
          const finalTEmission = tEmission ?? current.transportEmission ?? 0;
          const finalFEmission = fEmission ?? current.foodEmission ?? 0;
          const totalEmission = parseFloat((finalTEmission + finalFEmission).toFixed(2));

          const updated = await prisma.carbonCalculation.update({
            where: { id: targetId },
            data: {
              ...(validatedTransport ? { transportData: validatedTransport as any, transportEmission: finalTEmission } : {}),
              ...(validatedFood ? { foodData: validatedFood as any, foodEmission: finalFEmission } : {}),
              totalEmission,
            },
          });

          await onCalculationComplete(totalEmission, finalTEmission, finalFEmission);
          return NextResponse.json({ success: true, calculation: updated });
        }
      }

      const finalTEmission = tEmission ?? 0;
      const finalFEmission = fEmission ?? 0;
      const totalEmission = parseFloat((finalTEmission + finalFEmission).toFixed(2));

      const created = await prisma.carbonCalculation.create({
        data: {
          userId,
          transportEmission: finalTEmission,
          foodEmission: finalFEmission,
          totalEmission,
          transportData: validatedTransport as any,
          foodData: validatedFood as any,
        },
      });

      await onCalculationComplete(totalEmission, finalTEmission, finalFEmission);
      return NextResponse.json({ success: true, calculation: created });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Calculator API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
