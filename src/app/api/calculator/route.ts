import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validateTransportInput,
  validateFoodInput,
  calculateTransportEmission,
  calculateFoodEmission,
} from "@/lib/calculator";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId: reqUserId, transportData, foodData, calculationId } = body;
    const userId = reqUserId || "demo-user";

    if (action === "transport") {
      const val = validateTransportInput(transportData);
      if (!val.valid || !val.data) {
        return NextResponse.json({ error: val.error || "Invalid transport data" }, { status: 400 });
      }

      const transportEmission = calculateTransportEmission(val.data);

      // Check for duplicate recent calculation with identical transport data
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

      // If calculationId exists and record is incomplete, update it
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

      // Otherwise create new calculation entry
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

      // Find active or recent calculation to update
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

      // If no calculation exists yet, create one with food data
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

      // If updating an existing calculation record
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

      return NextResponse.json({ success: true, calculation: created });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Calculator API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
