import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";

    // Optimized Prisma query fetching calculations ordered by date
    const calculations = await prisma.carbonCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const totalCalculations = calculations.length;

    if (totalCalculations === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        latest: {
          totalEmission: 0,
          transportEmission: 0,
          foodEmission: 0,
        },
        monthlyAverage: 0,
        percentageChange: 0,
        totalCalculations: 0,
        lineChartData: [],
        breakdownData: [
          { name: "Transport", pct: 0, val: 0, color: "#16a34a" },
          { name: "Food", pct: 0, val: 0, color: "#f59e0b" },
        ],
      });
    }

    const latest = calculations[totalCalculations - 1];
    const previous = totalCalculations > 1 ? calculations[totalCalculations - 2] : null;

    // Total & category emissions
    const totalEmission = latest.totalEmission ?? ((latest.transportEmission ?? 0) + (latest.foodEmission ?? 0));
    const transportEmission = latest.transportEmission ?? 0;
    const foodEmission = latest.foodEmission ?? 0;

    // Compute monthly average
    const validTotals = calculations.map((c) => c.totalEmission ?? ((c.transportEmission ?? 0) + (c.foodEmission ?? 0)));
    const sumTotal = validTotals.reduce((acc, curr) => acc + curr, 0);
    const monthlyAverage = parseFloat((sumTotal / (validTotals.length || 1)).toFixed(2));

    // Percentage change vs previous
    let percentageChange = 0;
    if (previous) {
      const prevTotal = previous.totalEmission ?? ((previous.transportEmission ?? 0) + (previous.foodEmission ?? 0));
      if (prevTotal > 0) {
        percentageChange = parseFloat((((totalEmission - prevTotal) / prevTotal) * 100).toFixed(1));
      }
    }

    // Prepare line chart data (recent entries mapped to month labels)
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
    const lineChartData = calculations.slice(-6).map((c) => {
      const val = c.totalEmission ?? ((c.transportEmission ?? 0) + (c.foodEmission ?? 0));
      return {
        month: monthFormatter.format(new Date(c.createdAt)),
        val: parseFloat(val.toFixed(2)),
      };
    });

    // Compute breakdown percentages
    const calculatedTotal = transportEmission + foodEmission;
    const tPct = calculatedTotal > 0 ? Math.round((transportEmission / calculatedTotal) * 100) : 0;
    const fPct = calculatedTotal > 0 ? 100 - tPct : 0;

    const breakdownData = [
      { name: "Transport", pct: tPct, val: parseFloat(transportEmission.toFixed(2)), color: "#16a34a" },
      { name: "Food", pct: fPct, val: parseFloat(foodEmission.toFixed(2)), color: "#f59e0b" },
    ];

    return NextResponse.json({
      success: true,
      hasData: true,
      latest: {
        totalEmission: parseFloat(totalEmission.toFixed(2)),
        transportEmission: parseFloat(transportEmission.toFixed(2)),
        foodEmission: parseFloat(foodEmission.toFixed(2)),
      },
      monthlyAverage,
      percentageChange,
      totalCalculations,
      lineChartData,
      breakdownData,
    });
  } catch (error: any) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
