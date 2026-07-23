"use client";

import { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Check,
  TrendingDown,
  Info
} from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Ali Khan");
  const [email, setEmail] = useState("ali.khan@peshawar.kp.edu");
  const [location, setLocation] = useState("Peshawar, KP");
  
  // Targets
  const [monthlyLimit, setMonthlyLimit] = useState(2.5);
  
  // Toggles
  const [notifyLimit, setNotifyLimit] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight">
          Account Settings ⚙️
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Update profile configurations, targets thresholds, and carbon notification rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: PROFILE FORM */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile details card */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <User className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-gray-800 text-sm">Personal Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Primary Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Preferences and rules */}
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Bell className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-gray-800 text-sm">Carbon Notifications & Feeds</h3>
            </div>

            <div className="space-y-3.5 pt-2">
              <label className="flex items-center gap-3 text-xs font-bold text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyLimit}
                  onChange={(e) => setNotifyLimit(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-gray-50 border-gray-300 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Alert me if monthly footprint limit is exceeded</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-gray-50 border-gray-300 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Send weekly email digest summaries</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLeaderboard}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-gray-50 border-gray-300 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Display my name on regional weekly Leaderboards</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: GOALS & SAVE BUTTON */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Shield className="w-5 h-5" />
              </span>
              <h3 className="font-extrabold text-gray-800 text-sm">Carbon Reduction Target</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                <span>Monthly Target Limit</span>
                <span className="text-emerald-600 font-extrabold">{monthlyLimit} tons</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              
              <div className="bg-emerald-50/50 p-3 rounded-xl flex items-start gap-2 text-[10px]">
                <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 leading-relaxed font-semibold">
                  A target of <strong>{monthlyLimit} tons</strong> per month is in line with the Paris Agreement targets for reduction.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  <span>Changes Saved Successfully!</span>
                </>
              ) : (
                <span>Save All Configurations</span>
              )}
            </button>
            
            <button
              type="button"
              className="w-full bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 font-extrabold py-3.5 rounded-xl transition cursor-pointer text-xs"
            >
              Cancel & Discard
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
