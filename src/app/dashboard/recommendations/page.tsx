"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Car,
  UtensilsCrossed,
  Zap,
  TrendingDown,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

export default function RecommendationsPage() {
  const [latestCalc, setLatestCalc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLatestCalc() {
      try {
        setLoading(true);
        let uid: string | undefined = undefined;
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              uid = u.id || u.email;
            } catch (e) {}
          }
        }

        const url = uid ? `/api/calculator/latest?userId=${encodeURIComponent(uid)}` : "/api/calculator/latest";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.calculation) {
            setLatestCalc(data.calculation);
          }
        }
      } catch (err) {
        console.error("Failed to fetch calculation for recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestCalc();
  }, []);

  const toggleComplete = (id: string) => {
    setCompletedRecs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Derive dynamic recommendations based on calculated footprints
  const transportEmission = latestCalc?.transportEmission ?? 1.2;
  const foodEmission = latestCalc?.foodEmission ?? 0.4;
  const totalEmission = latestCalc?.totalEmission ?? (transportEmission + foodEmission);

  const isHighTransport = transportEmission > 0.8;
  const isHighFood = foodEmission > 0.3;

  const recommendationsList = [
    {
      id: "rec-1",
      category: "Transport",
      title: isHighTransport ? "Switch to Bus / BRT 3 Days a Week" : "Carpool with Co-workers",
      impact: isHighTransport ? "Save ~0.45 tons CO₂/mo" : "Save ~0.20 tons CO₂/mo",
      difficulty: "Easy",
      icon: <Car className="w-5 h-5 text-emerald-600" />,
      iconBg: "bg-emerald-50 border-emerald-100",
      desc: isHighTransport
        ? "Your transport emissions are higher than recommended. Utilizing public transit reduces fuel footprint dramatically."
        : "Share rides to optimize fuel usage during your weekly commutes.",
    },
    {
      id: "rec-2",
      category: "Food & Diet",
      title: isHighFood ? "Adopt 2 Plant-Based Meals per Week" : "Increase Sourcing of Local Produce",
      impact: isHighFood ? "Save ~0.15 tons CO₂/mo" : "Save ~0.08 tons CO₂/mo",
      difficulty: "Medium",
      icon: <UtensilsCrossed className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-50 border-amber-100",
      desc: isHighFood
        ? "Meat-heavy meals generate significantly higher CO₂. Incorporating legumes and veggies twice a week cuts diet emissions."
        : "Buying locally sourced produce cuts down long-distance freight emissions.",
    },
    {
      id: "rec-3",
      category: "Energy & Waste",
      title: "Compost Organic Kitchen Waste",
      impact: "Save ~0.06 tons CO₂/mo",
      difficulty: "Easy",
      icon: <Zap className="w-5 h-5 text-purple-500" />,
      iconBg: "bg-purple-50 border-purple-100",
      desc: "Turn food scraps into rich soil fertilizer instead of sending them to landfills where they emit methane gas.",
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              AI Powered Insights
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Personalized Reduction Plan</h2>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
            Based on your live calculated emissions ({totalEmission.toFixed(2)} tons CO₂/mo), here are high-impact steps tailored for you.
          </p>
        </div>

        <Link
          href="/dashboard/calculator"
          className="relative z-10 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <span>Update Footprint</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommendationsList.map((rec) => {
          const isDone = completedRecs.includes(rec.id);

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl border p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between transition-all ${
                isDone ? "border-emerald-300 bg-emerald-50/20" : "border-gray-150 hover:border-gray-250"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl border ${rec.iconBg}`}>
                    {rec.icon}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {rec.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 leading-snug">{rec.title}</h3>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1.5">{rec.desc}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2.5 py-1 rounded-lg border border-emerald-100">
                    {rec.impact}
                  </span>
                  <span className="bg-gray-100 text-gray-600 font-bold text-[10px] px-2.5 py-1 rounded-lg">
                    {rec.difficulty}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleComplete(rec.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isDone
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      <span>Action Completed</span>
                    </>
                  ) : (
                    <>
                      <span>Commit to Action</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
