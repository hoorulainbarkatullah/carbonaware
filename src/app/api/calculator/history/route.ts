import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "demo-user";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Fetch all user calculations ordered by latest first
    const allUserCalculations = await prisma.carbonCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

    // Format & map records
    const formattedRecords = allUserCalculations.map((calc, idx) => {
      const dateStr = monthFormatter.format(new Date(calc.createdAt));
      const transport = calc.transportEmission ?? 0;
      const food = calc.foodEmission ?? 0;
      const total = calc.totalEmission ?? (transport + food);

      // Compute status & change relative to previous (older) calculation
      let change = "Baseline";
      const olderCalc = allUserCalculations[idx + 1];
      if (olderCalc) {
        const olderTotal = olderCalc.totalEmission ?? ((olderCalc.transportEmission ?? 0) + (olderCalc.foodEmission ?? 0));
        if (olderTotal > 0) {
          const diffPct = Math.round(((total - olderTotal) / olderTotal) * 100);
          change = diffPct <= 0 ? `${diffPct}%` : `+${diffPct}%`;
        }
      }

      let status = "Average";
      if (total < 2.0) status = "Excellent";
      else if (total < 2.7) status = "Good";
      else if (total > 3.0) status = "High";

      return {
        id: calc.id,
        date: dateStr,
        createdAt: calc.createdAt,
        transport: parseFloat(transport.toFixed(2)),
        energy: 0.0, // preserved for UI column alignment
        diet: parseFloat(food.toFixed(2)),
        waste: 0.0,
        total: parseFloat(total.toFixed(2)),
        status,
        reduction: change,
        transportData: calc.transportData,
        foodData: calc.foodData,
      };
    });

    // Apply search filtering
    let filtered = formattedRecords;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = formattedRecords.filter(
        (r) =>
          r.date.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.reduction.toLowerCase().includes(q)
      );
    }

    const totalCount = filtered.length;
    const paginatedRecords = filtered.slice(skip, skip + limit);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // Compute stats from real calculations
    const lowestCalc = formattedRecords.length > 0
      ? formattedRecords.reduce((min, c) => (c.total < min.total ? c : min), formattedRecords[0])
      : null;

    const highestCalc = formattedRecords.length > 0
      ? formattedRecords.reduce((max, c) => (c.total > max.total ? c : max), formattedRecords[0])
      : null;

    // Trend line data (oldest to newest, max 6 months)
    const trendRecords = [...formattedRecords].reverse().slice(-6);
    const footprintTrend = trendRecords.map((r) => {
      const d = new Date(r.createdAt);
      const shortMonth = d.toLocaleDateString("en-US", { month: "short" });
      return {
        month: shortMonth,
        fullDate: r.date,
        total: r.total,
      };
    });

    // Breakdown metrics from latest calculation or overall average
    const latestRec = formattedRecords[0] || null;
    const latestTransport = latestRec ? latestRec.transport : 0;
    const latestFood = latestRec ? latestRec.diet : 0;
    const latestTotal = latestRec ? latestRec.total : 0;

    const transportPct = latestTotal > 0 ? parseFloat(((latestTransport / latestTotal) * 100).toFixed(1)) : 0;
    const foodPct = latestTotal > 0 ? parseFloat(((latestFood / latestTotal) * 100).toFixed(1)) : 0;
    const othersVal = latestTotal > 0 ? parseFloat(Math.max(0, latestTotal - latestTransport - latestFood).toFixed(2)) : 0;
    const othersPct = latestTotal > 0 ? parseFloat(((othersVal / latestTotal) * 100).toFixed(1)) : 0;

    const breakdownData = {
      dateLabel: latestRec ? latestRec.date : "Latest",
      total: latestTotal,
      items: [
        { name: "Transport", val: latestTransport, pct: transportPct, color: "#16a34a" },
        { name: "Food & Waste", val: latestFood, pct: foodPct, color: "#3b82f6" },
        { name: "Others", val: othersVal, pct: othersPct, color: "#eab308" },
      ],
    };

    // Summary stats calculation
    const totalLogs = formattedRecords.length;
    const avgFootprint =
      totalLogs > 0
        ? parseFloat((formattedRecords.reduce((acc, curr) => acc + curr.total, 0) / totalLogs).toFixed(2))
        : 0;

    return NextResponse.json({
      success: true,
      records: paginatedRecords,
      totalCount,
      totalPages,
      page,
      summary: {
        averageMonthlyFootprint: avgFootprint,
        totalLogsRecorded: totalLogs,
        totalCarbonSavedKg: Math.round(totalLogs * 170),
      },
      analytics: {
        lowestFootprint: lowestCalc ? lowestCalc.total : 0,
        lowestDate: lowestCalc ? lowestCalc.date : "-",
        highestFootprint: highestCalc ? highestCalc.total : 0,
        highestDate: highestCalc ? highestCalc.date : "-",
        longestStreakVal: lowestCalc ? lowestCalc.total : 0,
        longestStreakDate: lowestCalc ? lowestCalc.date : "-",
        footprintTrend,
        breakdownData,
      },
    });
  } catch (error: any) {
    console.error("Fetch calculation history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
