"use client";

import { Trophy, Sparkles, Calendar } from "lucide-react";

export default function ChallengesPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-white border border-gray-150 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] max-w-2xl mx-auto space-y-5 my-12">
      <div className="p-4 bg-emerald-50 rounded-full text-emerald-600 animate-pulse">
        <Trophy className="w-12 h-12" />
      </div>
      
      <div className="space-y-2">
        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
          Roadmap Goal
        </span>
        <h2 className="text-2xl font-black text-gray-900 mt-2">
          Eco Challenges & Badges
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Compete in localized sustainability challenges, verify actions with friends, and earn rare ecosystem badges to display on your dashboard profile.
        </p>
      </div>

      <div className="border-t border-gray-100 pt-5 flex items-center gap-3 justify-center text-xs font-bold text-gray-400">
        <Calendar className="w-4 h-4 text-emerald-500" />
        <span>Estimated release: Q3 2026</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span>Beta testing soon</span>
      </div>
    </div>
  );
}
