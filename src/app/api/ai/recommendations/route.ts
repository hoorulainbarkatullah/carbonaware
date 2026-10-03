import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/db-utils";

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
    impact: (e: number) => `Save ~${(e * 0.1).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.1).toFixed(2)} tons`,
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
    impact: (e: number) => `Save ~${(e * 0.25).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.25).toFixed(2)} tons`,
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
    impact: (e: number) => `Save ~${(e * 0.15).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.15).toFixed(2)} tons`,
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
    impact: (e: number) => `Save ~${(e * 0.1).toFixed(2)} tons CO₂/mo`,
    co2Savings: (e: number) => `-${(e * 0.1).toFixed(2)} tons`,
    difficulty: "Easy",
    iconType: "food",
    desc: () => "Choose whole, minimally packaged staple ingredients. Ultra-processed foods carry massive industrial processing and plastic packaging overhead.",
    aiTip: "Cooking from scratch using whole grains and legumes dramatically lowers embodied carbon.",
  },
];


type RecCategory = "Transport" | "Food";

// Shapes of the calculator inputs saved on a CarbonCalculation (see src/lib/calculator.ts)
type TransportData = {
  transportType?: string;
  fuelType?: string;
  distanceKm?: number;
  tripsPerWeek?: number;
  fromLocation?: string;
  toLocation?: string;
};
type FoodData = {
  dietType?: string;
  mealsPerDay?: number;
  localFoodPct?: number;
  foodWasteLevel?: string;
  wasteMgmt?: string;
};
type Recommendation = { id?: string; title?: string; category?: string; [key: string]: unknown };
type Calc = { id: string; transportEmission: number | null; foodEmission: number | null; transportData: unknown; foodData: unknown };
const ALL_CATEGORIES: RecCategory[] = ["Transport", "Food"];
const TOTAL_RECOMMENDATIONS = 3;

// Map any category label (from the client or the AI) onto the calculator's categories
function normalizeCategory(value: unknown): RecCategory | null {
  const v = String(value || "").toLowerCase();
  if (v.includes("transport") || v.includes("travel") || v.includes("commute")) return "Transport";
  if (v.includes("food") || v.includes("diet")) return "Food";
  return null;
}

// Describe only the values that were actually calculated – no invented defaults
function transportContext(t: TransportData, emission: number) {
  const parts = [`${emission.toFixed(2)} tons CO2/month`];
  if (t.transportType) parts.push(`mode: ${t.transportType}`);
  if (t.fuelType && (t.transportType === "car" || t.transportType === "motorbike")) parts.push(`fuel: ${t.fuelType}`);
  if (typeof t.distanceKm === "number") parts.push(`one-way road distance: ${t.distanceKm} km`);
  if (typeof t.tripsPerWeek === "number") parts.push(`${t.tripsPerWeek} trips/week`);
  if (t.fromLocation && t.toLocation) parts.push(`route: ${t.fromLocation} → ${t.toLocation}`);
  return parts.join(", ");
}

function foodContext(f: FoodData, emission: number) {
  const parts = [`${emission.toFixed(2)} tons CO2/month`];
  if (f.dietType) parts.push(`diet: ${f.dietType}`);
  if (typeof f.mealsPerDay === "number") parts.push(`${f.mealsPerDay} meals/day`);
  if (typeof f.localFoodPct === "number") parts.push(`${f.localFoodPct}% locally sourced`);
  if (f.foodWasteLevel) parts.push(`food waste: ${f.foodWasteLevel}`);
  if (f.wasteMgmt) parts.push(`waste management: ${f.wasteMgmt}`);
  return parts.join(", ");
}

function adaptiveContextSentence(category: RecCategory, t: TransportData, f: FoodData) {
  if (category === "Transport" && typeof t.distanceKm === "number" && typeof t.tripsPerWeek === "number") {
    return ` Based on your ${t.distanceKm} km trip × ${t.tripsPerWeek} trips/week${t.transportType ? ` by ${t.transportType}` : ""}.`;
  }
  if (category === "Food" && f.dietType) {
    return ` Based on your ${f.dietType} diet${typeof f.mealsPerDay === "number" ? ` with ${f.mealsPerDay} meals/day` : ""}.`;
  }
  return "";
}

// Helper to get an alternative recommendation from the adaptive pool of one category
function getAdaptiveAlternative(
  category: RecCategory,
  transportE: number,
  foodE: number,
  tData: TransportData,
  fData: FoodData,
  excludeTitles: string[] = []
) {
  const pool = category === "Food" ? FOOD_RECOMMENDATIONS : TRANSPORT_RECOMMENDATIONS;
  const emissionRef = category === "Food" ? foodE : transportE;

  // Find items not in excludeTitles
  const available = pool.filter(
    (item) => !excludeTitles.some((ex) => ex.toLowerCase().trim() === item.title.toLowerCase().trim())
  );

  const selected = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `rec-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    category,
    title: selected.title,
    impact: selected.impact(emissionRef),
    difficulty: selected.difficulty,
    co2Savings: selected.co2Savings(emissionRef),
    iconType: selected.iconType,
    desc: selected.desc(emissionRef, tData) + adaptiveContextSentence(category, tData, fData),
    aiTip: selected.aiTip,
  };
}

// How many of the 3 cards each selected category gets (the larger emitter gets more)
function allocateCounts(categories: RecCategory[], transportE: number, foodE: number) {
  const counts: Record<RecCategory, number> = { Transport: 0, Food: 0 };
  if (categories.length === 1) {
    counts[categories[0]] = TOTAL_RECOMMENDATIONS;
  } else if (categories.length === 2) {
    const major: RecCategory = foodE > transportE ? "Food" : "Transport";
    counts[major] = TOTAL_RECOMMENDATIONS - 1;
    counts[major === "Food" ? "Transport" : "Food"] = 1;
  }
  return counts;
}

// Keep only recommendations in the selected categories (respecting counts) and fill any gaps from the adaptive pool
function enforceCategories(
  recs: Recommendation[],
  counts: Record<RecCategory, number>,
  transportE: number,
  foodE: number,
  tData: TransportData,
  fData: FoodData,
  excludeTitles: string[]
) {
  const result: Recommendation[] = [];
  for (const category of ALL_CATEGORIES) {
    const matching = (Array.isArray(recs) ? recs : [])
      .filter((r) => r && typeof r.title === "string" && normalizeCategory(r.category) === category)
      .slice(0, counts[category])
      .map((r, i) => ({ ...r, category, id: `${r.id || "rec"}-${category}-${i}-${Date.now()}` }));
    result.push(...matching);
    const used = [...excludeTitles, ...result.map((r) => r.title || "")];
    for (let i = matching.length; i < counts[category]; i++) {
      const alt = getAdaptiveAlternative(category, transportE, foodE, tData, fData, used);
      used.push(alt.title);
      result.push(alt);
    }
  }
  return result;
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
      calculationId,
      categories: requestedCategories,
    } = body;

    const userId = reqUserId || "demo-user";

    // 1. Use the calculation the user just made (calculationId); fall back to their latest calculations
    const calculations = await prisma.carbonCalculation.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    const targetCalc =
      calculationId && isValidObjectId(calculationId)
        ? calculations.find((c) => c.id === calculationId) || null
        : null;

    const hasTransport = (c: Calc | null | undefined): c is Calc => !!c && c.transportEmission !== null && c.transportEmission !== undefined;
    const hasFood = (c: Calc | null | undefined): c is Calc => !!c && c.foodEmission !== null && c.foodEmission !== undefined;

    const latestTransportCalc = hasTransport(targetCalc) ? targetCalc : calculations.slice().reverse().find(hasTransport);
    const latestFoodCalc = hasFood(targetCalc) ? targetCalc : calculations.slice().reverse().find(hasFood);

    // 2. Selected categories: what the client asked for, limited to categories that have calculated data
    const availableCategories = ALL_CATEGORIES.filter((c) => (c === "Transport" ? !!latestTransportCalc : !!latestFoodCalc));
    const requested: RecCategory[] = Array.isArray(requestedCategories)
      ? Array.from(new Set(requestedCategories.map(normalizeCategory).filter((c): c is RecCategory => !!c)))
      : [];
    // An explicit selection is never widened: unknown categories (e.g. Energy, which has no calculator data) yield nothing
    const categoriesWereRequested = Array.isArray(requestedCategories) && requestedCategories.length > 0;
    const selectedCategories = (categoriesWereRequested ? requested : availableCategories).filter((c) =>
      availableCategories.includes(c)
    );

    // If user has not performed any calculations yet, return empty list without static fake defaults
    if (selectedCategories.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        aiModel: "CarbonAware AI",
        totalEmission: 0,
        transportEmission: 0,
        foodEmission: 0,
        categories: [],
        recommendations: [],
        summary: "No carbon footprint calculated yet. Please calculate your Transport or Food emissions in the Calculator to generate personalized AI recommendations.",
      });
    }

    const includeTransport = selectedCategories.includes("Transport");
    const includeFood = selectedCategories.includes("Food");

    const transportEmission = includeTransport ? latestTransportCalc?.transportEmission ?? 0 : 0;
    const foodEmission = includeFood ? latestFoodCalc?.foodEmission ?? 0 : 0;
    const totalEmission = parseFloat((transportEmission + foodEmission).toFixed(2));

    const transportData = ((includeTransport && latestTransportCalc?.transportData) || {}) as TransportData;
    const foodData = ((includeFood && latestFoodCalc?.foodData) || {}) as FoodData;

    const profileLines = [
      includeTransport ? `- Transport: ${transportContext(transportData, transportEmission)}` : null,
      includeFood ? `- Food: ${foodContext(foodData, foodEmission)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const groqKey = process.env.GROQ_API_KEY || (process.env.GEMINI_API_KEY?.startsWith("gsk_") ? process.env.GEMINI_API_KEY : undefined);
    const geminiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("gsk_") ? process.env.GEMINI_API_KEY : undefined;

    // COMBINED EXCLUSIONS
    const allExcluded = Array.from(new Set([...existingTitles, ...excludeTitles, ...(dismissedTitle ? [dismissedTitle] : [])]));

    // =========================================================================
    // CASE A: REPLACE ONE RECOMMENDATION (when user closes/deletes one card)
    // =========================================================================
    if (action === "replaceOne") {
      let newRec: Recommendation | null = null;
      let aiModelUsed = "CarbonAware Adaptive AI";

      // The replacement must stay inside the selected categories
      const normalized = normalizeCategory(category);
      const replaceCategory: RecCategory =
        normalized && selectedCategories.includes(normalized) ? normalized : selectedCategories[0];

      const replacePrompt = `
You are CarbonAware AI, an expert climate scientist and personal carbon advisor.
The user's calculated monthly carbon footprint for the selected categories:
${profileLines}

The user just closed/dismissed: "${dismissedTitle || "Current Recommendation"}".
They are currently seeing or have dismissed:
${allExcluded.map((t) => `- "${t}"`).join("\n")}

Generate 1 BRAND NEW, distinct, highly actionable carbon reduction recommendation ONLY in the "${replaceCategory}" category, specifically tailored to the values above.
Do NOT suggest anything outside the "${replaceCategory}" category. Base any savings estimate only on the emission values given above.
Do NOT repeat or closely rephrase any of the excluded recommendations listed above.

Return strictly a valid JSON object without markdown or code fences:
{
  "id": "rec-${Date.now()}-${Math.floor(Math.random() * 1000)}",
  "category": "${replaceCategory}",
  "title": "Short practical title (under 8 words)",
  "impact": "Save ~X tons CO2/mo",
  "difficulty": "Easy",
  "co2Savings": "-X tons",
  "iconType": "${replaceCategory === "Food" ? "food" : "car"}",
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

      // Reject AI output that drifted into another category; fall back to Adaptive Engine
      if (!newRec || typeof newRec.title !== "string" || normalizeCategory(newRec.category) !== replaceCategory) {
        newRec = getAdaptiveAlternative(replaceCategory, transportEmission, foodEmission, transportData, foodData, allExcluded);
        aiModelUsed = "CarbonAware Adaptive AI";
      } else {
        newRec = { ...newRec, category: replaceCategory, id: newRec.id || `rec-${Date.now()}` };
      }

      return NextResponse.json({
        success: true,
        aiModel: aiModelUsed,
        categories: selectedCategories,
        newRecommendation: newRec,
      });
    }

    // =========================================================================
    // CASE B: GENERATE 3 RECOMMENDATIONS for the selected categories only
    // =========================================================================
    const counts = allocateCounts(selectedCategories, transportEmission, foodEmission);
    let aiRecommendations: Recommendation[] | null = null;
    let aiModelUsed = "Smart Adaptive Climate AI";

    const countLines = selectedCategories.map((c) => `- ${counts[c]} recommendation(s) with "category": "${c}"`).join("\n");

    const promptText = `
You are CarbonAware AI, an expert climate scientist and carbon footprint reduction advisor.
Analyze the user's calculated carbon emission data for the selected categories (${selectedCategories.join(", ")}):
${profileLines}

${allExcluded.length > 0 ? `Do NOT repeat any of these previously shown recommendations:\n${allExcluded.map((t) => `- "${t}"`).join("\n")}` : ""}

Provide exactly ${TOTAL_RECOMMENDATIONS} highly practical, personalized carbon reduction recommendations:
${countLines}
Only use these categories: ${selectedCategories.map((c) => `"${c}"`).join(", ")}. Do NOT include Energy, Waste, Lifestyle or any other category.
Each recommendation must refer to the user's values above, and any savings estimate must be based only on those emission values.
Return strictly a JSON array without markdown formatting or code blocks:
[
  {
    "id": "rec-1",
    "category": "${selectedCategories[0]}",
    "title": "Short title",
    "impact": "Save ~X tons CO2/mo",
    "difficulty": "Easy",
    "co2Savings": "-X tons",
    "iconType": "${selectedCategories[0] === "Food" ? "food" : "car"}",
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
                  content: `You are CarbonAware AI, a climate scientist. You must return strictly a valid JSON array of ${TOTAL_RECOMMENDATIONS} carbon reduction recommendations, only in the requested categories, without extra commentary.`,
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

    // 2C. Enforce categories (drops off-category AI output) and fill gaps from the Adaptive Climate AI Pool
    if (!aiRecommendations || aiRecommendations.length === 0) aiModelUsed = "Smart Adaptive Climate AI";
    const finalRecommendations = enforceCategories(
      aiRecommendations || [],
      counts,
      transportEmission,
      foodEmission,
      transportData,
      foodData,
      allExcluded
    );

    const breakdown = [
      includeTransport ? `${transportEmission.toFixed(2)}t transport` : null,
      includeFood ? `${foodEmission.toFixed(2)}t food` : null,
    ].filter(Boolean).join(", ");

    return NextResponse.json({
      success: true,
      aiModel: aiModelUsed,
      totalEmission,
      transportEmission,
      foodEmission,
      categories: selectedCategories,
      recommendations: finalRecommendations,
      summary: `AI analyzed your ${selectedCategories.join(" & ")} footprint (${breakdown}) and generated customized ${selectedCategories.join(" & ")} reduction steps.`,
    });
  } catch (error: any) {
    console.error("Error in AI recommendations endpoint:", error);
    return NextResponse.json(
      { error: "Failed to generate AI recommendations" },
      { status: 500 }
    );
  }
}
