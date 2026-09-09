import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Rich Adaptive Climate AI Pools for each category
const TRANSPORT_RECOMMENDATIONS = [
  {
    title: "Switch to Electric / Hybrid or Carpool 2x Week",
    impact: (e: number) => `Save ~${(e * 0.35).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.35).toFixed(2)} tons`,
    difficulty: "Easy",
    iconType: "car",
    desc: (e: number, t: any) => `Carpooling or choosing hybrid/EV transit 2 days a week significantly reduces fuel emissions from your ${t?.fuelType || "personal"} vehicle.`,
    aiTip: "Using shared transit 2 days out of 5 cuts commute carbon by up to 35% monthly.",
  },
  {
    title: "Use Metro, Bus, or Light Rail for Weekly Commutes",
    impact: (e: number) => `Save ~${(e * 0.45).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.45).toFixed(2)} tons`,
    difficulty: "Medium",
    iconType: "car",
    desc: (e: number, t: any) => `Switching high-frequency commutes to public transit eliminates single-occupancy vehicle emissions and bypasses traffic idling.`,
    aiTip: "Public buses and trains emit 70-80% less CO₂ per passenger-kilometer compared to private cars.",
  },
  {
    title: "Maintain Optimal Tire Pressure & Eco-Driving",
    impact: () => "Save ~0.14 tons CO₂/mo",
    co2Savings: () => "-0.14 tons",
    difficulty: "Easy",
    iconType: "car",
    desc: () => "Maintaining recommended tire PSI and avoiding sudden acceleration or excessive idling boosts vehicle fuel economy by 8-12%.",
    aiTip: "Every 5 km/h driven over 100 km/h is like paying an additional 7% carbon tax on fuel.",
  },
  {
    title: "Combine Errands & Implement Trip Chaining",
    impact: (e: number) => `Save ~${(e * 0.20).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.20).toFixed(2)} tons`,
    difficulty: "Easy",
    iconType: "car",
    desc: () => "Cold engine starts consume nearly twice the fuel. Combining multiple errands into a single chained warm route saves fuel and reduces emissions.",
    aiTip: "Trip-chaining avoids multiple cold engine warmups that emit heavy initial emissions.",
  },
  {
    title: "Adopt E-Bike or Cycling for Short Trips Under 5 km",
    impact: () => "Save ~0.18 tons CO₂/mo",
    co2Savings: () => "-0.18 tons",
    difficulty: "Easy",
    iconType: "car",
    desc: () => "Over 40% of urban car trips are under 5 kilometers. Swapping short trips to an e-bike or traditional bicycle produces zero direct tailpipe emissions.",
    aiTip: "E-bikes emit up to 95% less CO₂ per kilometer than fossil fuel motor vehicles.",
  },
  {
    title: "Request 1-2 Remote or Flexible Workdays Weekly",
    impact: (e: number) => `Save ~${(e * 0.30).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.30).toFixed(2)} tons`,
    difficulty: "Medium",
    iconType: "car",
    desc: () => "Working from home just 1 or 2 days each week eliminates roundtrip travel emissions and reduces wear-and-tear on vehicles.",
    aiTip: "Telecommuting 2 days per week saves an average of ~0.5 tons of CO₂ per year per commuter.",
  },
];

const FOOD_RECOMMENDATIONS = [
  {
    title: "Adopt 2 Plant-Rich Days per Week",
    impact: (e: number) => `Save ~${(e * 0.38).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.38).toFixed(2)} tons`,
    difficulty: "Medium",
    iconType: "food",
    desc: () => "Replacing red meat with lentils, beans, chickpeas, or tofu twice a week sharply curtails agricultural methane and supply chain emissions.",
    aiTip: "Plant-based proteins produce up to 85% fewer lifecycle greenhouse gases than livestock farming.",
  },
  {
    title: "Source 50%+ Locally Grown Seasonal Produce",
    impact: (e: number) => `Save ~${(e * 0.22).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.22).toFixed(2)} tons`,
    difficulty: "Easy",
    iconType: "food",
    desc: () => "Purchasing regional in-season produce eliminates heated greenhouse agriculture and long-distance refrigerated cargo transport.",
    aiTip: "Locally sourced in-season food cuts thousands of air and freight food miles.",
  },
  {
    title: "Zero Food-Waste Meal Prep & Smart Storage",
    impact: () => "Save ~0.20 tons CO₂/mo",
    co2Savings: () => "-0.20 tons",
    difficulty: "Easy",
    iconType: "food",
    desc: () => "Plan your meals, store produce properly in crisper drawers, and freeze leftovers to prevent edible food from rotting in landfills.",
    aiTip: "Wasted food accounts for nearly 8-10% of total global greenhouse gas emissions.",
  },
  {
    title: "Replace High-Impact Red Meat with Poultry or Fish",
    impact: (e: number) => `Save ~${(e * 0.28).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.28).toFixed(2)} tons`,
    difficulty: "Easy",
    iconType: "food",
    desc: () => "Beef produces nearly 6-8x more CO₂e per kilogram than poultry or sustainably caught fish. Transitioning helps slash dietary carbon.",
    aiTip: "Switching from beef to chicken can reduce your meat-related emissions by over 65%.",
  },
  {
    title: "Eliminate Over-Packaged & Ultra-Processed Foods",
    impact: () => "Save ~0.15 tons CO₂/mo",
    co2Savings: () => "-0.15 tons",
    difficulty: "Easy",
    iconType: "food",
    desc: () => "Choose whole, minimally packaged staple ingredients. Ultra-processed foods carry massive industrial processing and plastic packaging overhead.",
    aiTip: "Cooking from scratch using whole grains and legumes dramatically lowers embodied carbon.",
  },
];

const WASTE_ENERGY_RECOMMENDATIONS = [
  {
    title: "Compost Organic Kitchen Scraps",
    impact: () => "Save ~0.16 tons CO₂/mo",
    co2Savings: () => "-0.16 tons",
    difficulty: "Easy",
    iconType: "waste",
    desc: () => "Divert fruit peels, vegetable scraps, and coffee grounds into home or community compost instead of methane-producing landfills.",
    aiTip: "Aerobic composting prevents anaerobic decomposition which releases potent methane gas into the atmosphere.",
  },
  {
    title: "Smart Thermostat & 1°C Temperature Adjustment",
    impact: () => "Save ~0.19 tons CO₂/mo",
    co2Savings: () => "-0.19 tons",
    difficulty: "Easy",
    iconType: "energy",
    desc: () => "Adjust your heating down by 1°C in winter and air conditioning up by 1°C in summer to instantly lower energy consumption.",
    aiTip: "Each degree Celsius adjustment reduces your HVAC utility bill and related grid emissions by 5-8%.",
  },
  {
    title: "Switch to High-Efficiency LED Bulbs & Strip Sockets",
    impact: () => "Save ~0.14 tons CO₂/mo",
    co2Savings: () => "-0.14 tons",
    difficulty: "Easy",
    iconType: "energy",
    desc: () => "Replace legacy incandescent or CFL bulbs with LEDs and plug entertainment devices into smart power strips to eliminate phantom standby draw.",
    aiTip: "LEDs use 75-80% less electricity and last 25 times longer than traditional incandescent bulbs.",
  },
  {
    title: "Cold Water Laundry & Natural Air-Drying",
    impact: () => "Save ~0.15 tons CO₂/mo",
    co2Savings: () => "-0.15 tons",
    difficulty: "Easy",
    iconType: "energy",
    desc: () => "About 75-90% of washing machine energy goes into heating water. Washing in cold water and rack-drying clothes preserves fabric and saves carbon.",
    aiTip: "Switching from hot to cold cycles plus air-drying can save up to 0.3 tons of CO₂ per household annually.",
  },
  {
    title: "Eliminate Single-Use Plastics & Repurpose Containers",
    impact: () => "Save ~0.12 tons CO₂/mo",
    co2Savings: () => "-0.12 tons",
    difficulty: "Easy",
    iconType: "waste",
    desc: () => "Bring reusable totes, silicone bags, and glass containers. Plastic production and incineration are major drivers of petrochemical carbon emissions.",
    aiTip: "Reusing durable containers 50+ times offsets their production emissions completely.",
  },
];

// Helper to get an alternative recommendation from adaptive pool
function getAdaptiveAlternative(
  category: string,
  transportE: number,
  foodE: number,
  tData: any,
  excludeTitles: string[] = []
) {
  let pool = TRANSPORT_RECOMMENDATIONS;
  let categoryName = "Transport";
  let emissionRef = transportE;

  if (category.toLowerCase().includes("food")) {
    pool = FOOD_RECOMMENDATIONS;
    categoryName = "Food & Diet";
    emissionRef = foodE;
  } else if (category.toLowerCase().includes("waste") || category.toLowerCase().includes("energy")) {
    pool = WASTE_ENERGY_RECOMMENDATIONS;
    categoryName = "Energy & Lifestyle";
    emissionRef = (transportE + foodE) * 0.2;
  }

  // Find items not in excludeTitles
  const available = pool.filter(
    (item) => !excludeTitles.some((ex) => ex.toLowerCase().trim() === item.title.toLowerCase().trim())
  );

  const selected = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    category: categoryName,
    title: selected.title,
    impact: selected.impact(emissionRef),
    difficulty: selected.difficulty,
    co2Savings: selected.co2Savings(emissionRef),
    iconType: selected.iconType,
    desc: selected.desc(emissionRef, tData),
    aiTip: selected.aiTip,
  };
}

// Helper to generate full 3 adaptive recommendations
function generateAdaptiveAIRecommendations(
  transportE: number,
  foodE: number,
  totalE: number,
  tData: any,
  fData: any,
  excludeTitles: string[] = []
) {
  const r1 = getAdaptiveAlternative("Transport", transportE, foodE, tData, excludeTitles);
  const r2 = getAdaptiveAlternative("Food", transportE, foodE, tData, [...excludeTitles, r1.title]);
  const r3 = getAdaptiveAlternative("Waste", transportE, foodE, tData, [...excludeTitles, r1.title, r2.title]);
  return [r1, r2, r3];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = "generate",
      userId: reqUserId,
      dismissedTitle,
      category = "Transport",
      existingTitles = [],
      excludeTitles = [],
    } = body;

    const userId = reqUserId || "demo-user";

    // 1. Fetch User's latest carbon calculations from database
    const calculations = await prisma.carbonCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const latestTransportCalc = calculations.slice().reverse().find((c) => c.transportEmission !== null && c.transportEmission !== undefined);
    const latestFoodCalc = calculations.slice().reverse().find((c) => c.foodEmission !== null && c.foodEmission !== undefined);

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

    const groqKey = process.env.GROQ_API_KEY || (process.env.GEMINI_API_KEY?.startsWith("gsk_") ? process.env.GEMINI_API_KEY : undefined);
    const geminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("gsk_") ? process.env.GEMINI_API_KEY : undefined;

    // COMBINED EXCLUSIONS
    const allExcluded = Array.from(new Set([...existingTitles, ...excludeTitles, ...(dismissedTitle ? [dismissedTitle] : [])]));

    // =========================================================================
    // CASE A: REPLACE ONE RECOMMENDATION (when user closes/deletes one card)
    // =========================================================================
    if (action === "replaceOne") {
      let newRec = null;
      let aiModelUsed = "CarbonAware Adaptive AI";

      const replacePrompt = `
You are CarbonAware AI, an expert climate scientist and personal carbon advisor.
User Profile:
- Total Monthly Carbon Footprint: ${totalEmission} tons CO2/mo
- Transport Emission: ${transportEmission} tons CO2/mo (Mode: ${transportData.transportType || "Car"}, Fuel: ${transportData.fuelType || "Petrol"}, Distance: ${transportData.distanceKm || 20} km)
- Food Emission: ${foodEmission} tons CO2/mo (Diet: ${foodData.dietType || "Mixed"}, Waste Level: ${foodData.foodWasteLevel || "Low"})

The user just closed/dismissed: "${dismissedTitle || "Current Recommendation"}".
They are currently seeing or have dismissed:
${allExcluded.map((t) => `- "${t}"`).join("\n")}

Generate 1 BRAND NEW, distinct, highly actionable carbon reduction recommendation in the "${category}" category (or a related high-impact category like Transport, Food, Energy, Waste) specifically tailored to this user.
Do NOT repeat or closely rephrase any of the excluded recommendations listed above.

Return strictly a valid JSON object without markdown or code fences:
{
  "id": "rec-${Date.now()}-${Math.floor(Math.random() * 1000)}",
  "category": "${category}",
  "title": "Short practical title (under 8 words)",
  "impact": "Save ~X tons CO2/mo",
  "difficulty": "Easy",
  "co2Savings": "-X tons",
  "iconType": "${category.toLowerCase().includes("food") ? "food" : category.toLowerCase().includes("waste") ? "waste" : "car"}",
  "desc": "2-3 practical sentences explaining how to execute this step and cut footprint...",
  "aiTip": "Actionable eco tip..."
}
`;

      // Try Groq first
      if (groqKey) {
        const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
        for (const model of groqModels) {
          if (newRec) break;
          try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${groqKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  {
                    role: "system",
                    content: "You are CarbonAware AI, a climate scientist. Return strictly a single valid JSON object representing one new carbon reduction recommendation. No commentary, no code blocks.",
                  },
                  { role: "user", content: replacePrompt },
                ],
                temperature: 0.7,
              }),
            });

            if (groqRes.ok) {
              const groqData = await groqRes.json();
              const rawText = groqData.choices?.[0]?.message?.content || "";
              const jsonMatch = rawText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                newRec = JSON.parse(jsonMatch[0]);
                aiModelUsed = `Groq ${model} AI`;
                break;
              }
            }
          } catch (err) {
            console.error(`Groq error on replaceOne (${model}):`, err);
          }
        }
      }

      // Try Gemini fallback
      if (!newRec && geminiKey) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: replacePrompt }] }],
              }),
            }
          );
          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const rawText = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              newRec = JSON.parse(jsonMatch[0]);
              aiModelUsed = "Google Gemini AI";
            }
          }
        } catch (geminiErr) {
          console.error("Gemini error on replaceOne:", geminiErr);
        }
      }

      // Fallback to Adaptive Engine
      if (!newRec) {
        newRec = getAdaptiveAlternative(category, transportEmission, foodEmission, transportData, allExcluded);
      }

      return NextResponse.json({
        success: true,
        aiModel: aiModelUsed,
        newRecommendation: newRec,
      });
    }

    // =========================================================================
    // CASE B: GENERATE 3 RECOMMENDATIONS (Initial load or full regeneration)
    // =========================================================================
    let aiRecommendations = null;
    let aiModelUsed = "Smart Adaptive Climate AI";

    const promptText = `
You are CarbonAware AI, an expert climate scientist and carbon footprint reduction advisor.
Analyze the following user's carbon emission data:
- Total Carbon Emission: ${totalEmission} metric tons CO2/month
- Transport Emission: ${transportEmission} metric tons CO2/month (Mode: ${transportData.transportType || "Car"}, Fuel: ${transportData.fuelType || "Petrol"}, Distance: ${transportData.distanceKm || 20} km)
- Food Emission: ${foodEmission} metric tons CO2/month (Diet: ${foodData.dietType || "Mixed"}, Waste Level: ${foodData.foodWasteLevel || "Low"})

${allExcluded.length > 0 ? `Do NOT repeat any of these previously shown recommendations:\n${allExcluded.map((t) => `- "${t}"`).join("\n")}` : ""}

Provide 3 highly practical, personalized carbon reduction recommendations in valid JSON format.
Ensure 1 recommendation is for Transport, 1 for Food, and 1 for Waste/Energy/Lifestyle.
Return strictly a JSON array without markdown formatting or code blocks:
[
  {
    "id": "rec-1",
    "category": "Transport",
    "title": "Short title",
    "impact": "Save ~X tons CO2/mo",
    "difficulty": "Easy",
    "co2Savings": "-X tons",
    "iconType": "car",
    "desc": "Detailed practical explanation...",
    "aiTip": "Actionable eco tip..."
  }
]
`;

    // 2A. Primary: Groq AI (Llama 3.3 70B)
    if (groqKey) {
      const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

      for (const model of groqModels) {
        if (aiRecommendations && aiRecommendations.length > 0) break;

        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: "You are CarbonAware AI, a climate scientist. You must return strictly a valid JSON array of 3 carbon reduction recommendations without extra commentary.",
                },
                {
                  role: "user",
                  content: promptText,
                },
              ],
              temperature: 0.65,
            }),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const rawText = groqData.choices?.[0]?.message?.content || "";
            const jsonMatch = rawText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              aiRecommendations = JSON.parse(jsonMatch[0]);
              aiModelUsed = `Groq ${model} AI`;
              break;
            }
          } else {
            const errBody = await groqRes.text();
            console.error(`Groq API error on ${model}:`, errBody);
          }
        } catch (groqErr) {
          console.error(`Groq API call failed on ${model}:`, groqErr);
        }
      }
    }

    // 2B. Secondary: Gemini Fallback
    if (!aiRecommendations && geminiKey) {
      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

      for (const modelName of modelsToTry) {
        if (aiRecommendations && aiRecommendations.length > 0) break;

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
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

    // 2C. Tertiary: Adaptive Climate AI Pool
    if (!aiRecommendations || aiRecommendations.length === 0) {
      aiRecommendations = generateAdaptiveAIRecommendations(
        transportEmission,
        foodEmission,
        totalEmission,
        transportData,
        foodData,
        allExcluded
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
