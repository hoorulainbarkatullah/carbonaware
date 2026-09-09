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
  ArrowRight,
  RefreshCw,
  Leaf,
  Bot,
  X,
  Calculator
} from "lucide-react";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [aiModel, setAiModel] = useState<string>("CarbonAware AI");
  const [totalEmission, setTotalEmission] = useState<number>(0);
  const [transportEmission, setTransportEmission] = useState<number>(0);
  const [foodEmission, setFoodEmission] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);
  const [dismissedRecs, setDismissedRecs] = useState<string[]>([]);

  const fetchAIRecommendations = async () => {
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

      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecommendations(data.recommendations || []);
          setSummary(data.summary || "");
          setAiModel(data.aiModel || "CarbonAware AI");
          setTotalEmission(data.totalEmission || 0);
          setTransportEmission(data.transportEmission || 0);
          setFoodEmission(data.foodEmission || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI recommendations:", err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchAIRecommendations();
  }, []);

  const handleRegenerateAI = () => {
    setGenerating(true);
    setDismissedRecs([]);
    fetchAIRecommendations();
  };

  const toggleComplete = (id: string) => {
    setCompletedRecs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const dismissRec = (id: string) => {
    setDismissedRecs((prev) => [...prev, id]);
  };

  const activeRecommendations = recommendations.filter(
    (rec) => !dismissedRecs.includes(rec.id)
  );

  const getIcon = (category: string, iconType?: string) => {
    if (category === "Transport" || iconType === "car") {
      return <Car className="w-5 h-5 text-emerald-600" />;
    }
    if (category.includes("Food") || iconType === "food") {
      return <UtensilsCrossed className="w-5 h-5 text-amber-600" />;
    }
    if (category.includes("Waste") || iconType === "waste") {
      return <Leaf className="w-5 h-5 text-emerald-700" />;
    }
    return <Zap className="w-5 h-5 text-purple-600" />;
  };

  const getCategoryBg = (category: string) => {
    if (category === "Transport") return "bg-emerald-50 border-emerald-100";
    if (category.includes("Food")) return "bg-amber-50 border-amber-100";
    return "bg-purple-50 border-purple-100";
  };

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Header Banner with AI Badge */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-800 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>{aiModel}</span>
            </span>
            <span className="bg-white/10 text-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              Calculation-Based AI
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">AI Personalized Carbon Reduction Plan</h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
            {summary || `AI analyzed your calculated carbon footprint and generated customized reduction steps.`}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleRegenerateAI}
            disabled={generating || loading}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-extrabold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin text-amber-300" : ""}`} />
            <span>{generating ? "AI Generating..." : "Generate AI Insights"}</span>
          </button>

          <Link
            href="/dashboard/calculator"
            className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <span>Update Footprint</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-gray-150 p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
              <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
              <div className="h-16 bg-gray-50 rounded-xl" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no calculation or all dismissed */}
      {!loading && activeRecommendations.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-150 p-10 text-center shadow-xs flex flex-col items-center max-w-lg mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-xs">
            <Calculator className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-black text-gray-900 leading-snug">No Carbon Footprint Calculated Yet</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            AI recommendations are generated dynamically based on your personal transport and food activity calculations. Please calculate your footprint in the Calculator to view tailored reduction steps.
          </p>
          <Link
            href="/dashboard/calculator"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-md transition cursor-pointer"
          >
            <span>Go to Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Active Recommendations Cards Grid */}
      {!loading && activeRecommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeRecommendations.map((rec) => {
            const isDone = completedRecs.includes(rec.id);

            return (
              <div
                key={rec.id}
                className={`bg-white rounded-3xl border p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between transition-all relative ${
                  isDone ? "border-emerald-400 bg-emerald-50/20" : "border-gray-150 hover:border-emerald-200"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Category Icon, Difficulty & Close/Dismiss Button */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${getCategoryBg(rec.category)}`}>
                      {getIcon(rec.category, rec.iconType)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200/60">
                        {rec.difficulty || "Easy"}
                      </span>

                      <button
                        onClick={() => dismissRec(rec.id)}
                        title="Dismiss / Remove recommendation card"
                        className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                      {rec.category}
                    </span>
                    <h3 className="text-sm font-black text-gray-900 leading-tight mt-0.5">
                      {rec.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">
                    {rec.desc}
                  </p>

                  {/* AI Tip Callout */}
                  {rec.aiTip && (
                    <div className="bg-emerald-50/70 border border-emerald-100/80 p-3 rounded-2xl flex items-start gap-2 text-[10px] font-bold text-emerald-850">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{rec.aiTip}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions & CO2 Savings Pill */}
                <div className="pt-4 mt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>{rec.impact || rec.co2Savings}</span>
                  </div>

                  <button
                    onClick={() => toggleComplete(rec.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isDone ? "Implemented" : "Mark Done"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom AI Eco Summary Callout */}
      <div className="bg-[#f0fdf4] border border-[#bbf7d0]/40 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-900 leading-tight">Calculation-Based AI Recommendations</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">
              Recommendations are calculated dynamically based on your personal transport and food activity records.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/calculator"
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
        >
          <span>Calculate Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
