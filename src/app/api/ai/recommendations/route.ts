import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Intelligent Fallback Climate AI Engine
function generateAdaptiveAIRecommendations(
  transportE: number,
  foodE: number,
  totalE: number,
  tData: any,
  fData: any
) {
  const recommendations = [];

  // 1. Transport AI Recommendation
  if (tData?.transportType === "car") {
    if (tData?.fuelType === "Diesel" || tData?.fuelType === "Petrol") {
      recommendations.push({
        id: "ai-rec-1",
        category: "Transport",
        title: `Switch to Electric / Hybrid or Carpool 2x Week`,
        impact: `Save ~${(transportE * 0.35).toFixed(2)} tons CO₂/mo`,
        difficulty: "Easy",
        co2Savings: `-${(transportE * 0.35).toFixed(2)} tons`,
        iconType: "car",
        desc: `Your ${tData.fuelType} car produces ~${transportE.toFixed(2)} tons CO₂ monthly. Carpooling or choosing hybrid/EV transport twice a week cuts fuel emissions significantly.`,
        aiTip: "Using public transit or carpooling for 2 out of 5 workdays reduces monthly transit carbon by 35%.",
      });
    } else if (tData?.fuelType === "Electric") {
      recommendations.push({
        id: "ai-rec-1",
        category: "Transport",
        title: "Optimize EV Charging with Off-Peak Clean Energy",
        impact: `Save ~${(transportE * 0.20).toFixed(2)} tons CO₂/mo`,
        difficulty: "Easy",
        co2Savings: `-${(transportE * 0.20).toFixed(2)} tons`,
        iconType: "car",
        desc: "Charge your EV during off-peak hours when grid energy relies more on renewable solar & hydro sources.",
        aiTip: "Off-peak charging lowers grid demand and optimizes clean energy usage.",
      });
    } else {
      recommendations.push({
        id: "ai-rec-1",
        category: "Transport",
        title: "Maintain Optimal Tire Pressure & Efficient Driving",
        impact: "Save ~0.12 tons CO₂/mo",
        difficulty: "Easy",
        co2Savings: "-0.12 tons",
        iconType: "car",
        desc: "Keeping tires inflated and avoiding sudden acceleration improves fuel efficiency by 7-10%.",
        aiTip: "Regular maintenance keeps vehicle efficiency at peak performance.",
      });
    }
  } else if (tData?.transportType === "motorbike") {
    recommendations.push({
      id: "ai-rec-1",
      category: "Transport",
      title: "Combine Weekly Commute Trips & Switch to E-Bike",
      impact: `Save ~${(transportE * 0.40).toFixed(2)} tons CO₂/mo`,
      difficulty: "Easy",
      co2Savings: `-${(transportE * 0.40).toFixed(2)} tons`,
      iconType: "car",
      desc: "Group short errands into single trips or use electric bikes for short distances to minimize engine idling.",
      aiTip: "E-bikes emit up to 90% less CO₂ per kilometer than conventional motorbikes.",
    });
  } else {
    recommendations.push({
      id: "ai-rec-1",
      category: "Transport",
      title: "Promote Clean Commuting in Community",
      impact: "Save ~0.25 tons CO₂/mo",
      difficulty: "Easy",
      co2Savings: "-0.25 tons",
      iconType: "car",
      desc: "You are already using low-carbon transit! Inspire others in your network to adopt public transport.",
      aiTip: "Public transit users eliminate ~1.5 tons of carbon per year.",
    });
  }

  // 2. Food & Diet AI Recommendation
  if (fData?.dietType === "meat-heavy" || fData?.dietType === "mixed") {
    recommendations.push({
      id: "ai-rec-2",
      category: "Food & Diet",
      title: "Adopt 2 Plant-Rich Days per Week",
      impact: `Save ~${(foodE * 0.40).toFixed(2)} tons CO₂/mo`,
      difficulty: "Medium",
      co2Savings: `-${(foodE * 0.40).toFixed(2)} tons`,
      iconType: "food",
      desc: `Replacing red meat with lentils, beans, or plant-rich meals twice a week reduces food footprint by 40%.`,
      aiTip: "Plant-based proteins produce up to 80% fewer emissions than livestock farming.",
    });
  } else {
    recommendations.push({
      id: "ai-rec-2",
      category: "Food & Diet",
      title: "Source 50%+ Locally Grown Seasonal Produce",
      impact: `Save ~${(foodE * 0.25).toFixed(2)} tons CO₂/mo`,
      difficulty: "Easy",
      co2Savings: `-${(foodE * 0.25).toFixed(2)} tons`,
      iconType: "food",
      desc: "Buying local seasonal vegetables reduces freight transportation & refrigeration carbon cost.",
      aiTip: "Locally sourced food eliminates long-distance supply chain emissions.",
    });
  }

  // 3. Waste & Lifestyle AI Recommendation
  if (fData?.foodWasteLevel === "high" || fData?.foodWasteLevel === "medium") {
    recommendations.push({
      id: "ai-rec-3",
      category: "Food & Waste",
      title: "Compost Kitchen Food Scraps & Meal Prep",
      impact: "Save ~0.15 tons CO₂/mo",
      difficulty: "Easy",
      co2Savings: "-0.15 tons",
      iconType: "waste",
      desc: "Prevent organic kitchen waste from entering landfills, where decomposing food generates potent methane gas.",
      aiTip: "Composting diverts organic waste into nutrient-rich soil.",
    });
  } else {
    recommendations.push({
      id: "ai-rec-3",
      category: "Energy & Lifestyle",
      title: "Switch to Energy Efficient LED & Smart Thermostat",
      impact: "Save ~0.18 tons CO₂/mo",
      difficulty: "Easy",
      co2Savings: "-0.18 tons",
      iconType: "energy",
      desc: "Replace traditional lighting with LEDs and adjust home temperature settings by 2°C to conserve energy.",
      aiTip: "Smart climate control saves up to 15% on monthly household power consumption.",
    });
  }

  return recommendations;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId: reqUserId } = body;
    const userId = reqUserId || "demo-user";

    // 1. Fetch User's latest carbon calculations from MongoDB
    const calculations = await prisma.carbonCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const latestTransportCalc = calculations.slice().reverse().find(c => c.transportEmission !== null && c.transportEmission !== undefined);
    const latestFoodCalc = calculations.slice().reverse().find(c => c.foodEmission !== null && c.foodEmission !== undefined);

    // If user has not performed any calculations yet, return empty list without static fake defaults
    if (!latestTransportCalc && !latestFoodCalc) {
      return NextResponse.json({
        success: true,
        hasData: false,
        aiModel: "CarbonAware AI",
        totalEmission: 0,
        transportEmission: 0,
        foodEmission: 0,
        recommendations: [],
        summary: "No carbon footprint calculated yet. Please calculate your Transport or Food emissions in the Calculator to generate personalized AI recommendations.",
      });
    }

    const transportEmission = latestTransportCalc?.transportEmission ?? 0;
    const foodEmission = latestFoodCalc?.foodEmission ?? 0;
    const totalEmission = parseFloat((transportEmission + foodEmission).toFixed(2));

    const transportData: any = latestTransportCalc?.transportData || {};
    const foodData: any = latestFoodCalc?.foodData || {};

    const apiKey = process.env.GEMINI_API_KEY;

    let aiRecommendations = null;
    let aiModelUsed = "Smart Adaptive Climate AI";

    // 2. If Gemini API key is available, call Google Gemini AI API
    if (apiKey) {
      const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash"
      ];

      for (const modelName of modelsToTry) {
        if (aiRecommendations && aiRecommendations.length > 0) break;

        try {
          const promptText = `
You are CarbonAware AI, an expert climate scientist and carbon footprint reduction advisor.
Analyze the following user's carbon emission data:
- Total Carbon Emission: ${totalEmission} metric tons CO2/month
- Transport Emission: ${transportEmission} metric tons CO2/month (Mode: ${transportData.transportType || "Car"}, Fuel: ${transportData.fuelType || "Petrol"}, Distance: ${transportData.distanceKm || 20} km)
- Food Emission: ${foodEmission} metric tons CO2/month (Diet: ${foodData.dietType || "Mixed"}, Waste Level: ${foodData.foodWasteLevel || "Low"})

Provide 3 highly practical, personalized carbon reduction recommendations in valid JSON format.
Return strictly a JSON array without markdown formatting or code blocks:
[
  {
    "id": "gemini-1",
    "category": "Transport",
    "title": "Short title",
    "impact": "Save ~X tons CO2/mo",
    "difficulty": "Easy",
    "co2Savings": "-X tons",
    "iconType": "car",
    "desc": "Detailed explanation...",
    "aiTip": "Actionable eco tip..."
  }
]
`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const jsonMatch = rawText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              aiRecommendations = JSON.parse(jsonMatch[0]);
              aiModelUsed = `Google ${modelName} AI`;
              break;
            }
          }
        } catch (geminiErr) {
          console.error(`Gemini model ${modelName} call failed:`, geminiErr);
        }
      }
    }

    // 3. Fallback to Climate AI Engine if Gemini was not configured or returned invalid format
    if (!aiRecommendations || aiRecommendations.length === 0) {
      aiRecommendations = generateAdaptiveAIRecommendations(
        transportEmission,
        foodEmission,
        totalEmission,
        transportData,
        foodData
      );
    }

    return NextResponse.json({
      success: true,
      aiModel: aiModelUsed,
      totalEmission,
      transportEmission,
      foodEmission,
      recommendations: aiRecommendations,
      summary: `AI analyzed your ${totalEmission.toFixed(2)} tons CO₂ monthly footprint (${transportEmission.toFixed(2)}t transport, ${foodEmission.toFixed(2)}t food) and generated customized reduction steps.`,
    });
  } catch (error: any) {
    console.error("Error in AI recommendations endpoint:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendations" },
      { status: 500 }
    );
  }
}
