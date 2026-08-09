"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Leaf,
  ChevronDown,
  TrendingDown,
  ChevronRight,
  ShieldCheck,
  Lock,
  Share2,
  Car,
  Zap,
  BookOpen,
  Trophy,
  Award
} from "lucide-react";

export default function DashboardPage() {
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState("Monthly");
  const [leaderboardTime, setLeaderboardTime] = useState("This Week");
  const [userName, setUserName] = useState("Ali Khan");
  const [userInitials, setUserInitials] = useState("AK");

  // --- Real DB State ---
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [totalEmission, setTotalEmission] = useState(2.4);
  const [transportEmission, setTransportEmission] = useState(1.08);
  const [foodEmission, setFoodEmission] = useState(0.36);
  const [monthlyAverage, setMonthlyAverage] = useState(2.5);
  const [percentageChange, setPercentageChange] = useState(-10);
  const [totalCalculationsCount, setTotalCalculationsCount] = useState(5);

  const [lineChartData, setLineChartData] = useState([
    { month: "Jan", val: 2.0 },
    { month: "Feb", val: 3.0 },
    { month: "Mar", val: 2.5 },
    { month: "Apr", val: 2.0 },
    { month: "May", val: 2.4 },
    { month: "Jun", val: 2.4 },
  ]);

  const [breakdownData, setBreakdownData] = useState([
    { name: "Transport", pct: 45, val: 1.08, color: "#16a34a" },
    { name: "Electricity", pct: 30, val: 0.72, color: "#3b82f6" },
    { name: "Food", pct: 15, val: 0.36, color: "#f59e0b" },
    { name: "Others", pct: 10, val: 0.24, color: "#a855f7" },
  ]);

  // Real Dynamic Widgets State from MongoDB
  const [badges, setBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [learningWidget, setLearningWidget] = useState<any>({
    title: "What is Carbon Footprint?",
    desc: "Learn the basics of carbon footprint and its impact on climate change.",
    progress: 75,
  });

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      let uid: string | undefined = undefined;
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            uid = u.id || u.email;
            setUserName(u.name || "Ali Khan");
            const initials = (u.name || "Ali Khan")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();
            setUserInitials(initials);
          } catch (e) {}
        }
      }

      const url = uid
        ? `/api/dashboard/stats?userId=${encodeURIComponent(uid)}&timeframe=${encodeURIComponent(leaderboardTime)}`
        : `/api/dashboard/stats?timeframe=${encodeURIComponent(leaderboardTime)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHasData(data.hasData);
          if (data.latest) {
            setTotalEmission(data.latest.totalEmission);
            setTransportEmission(data.latest.transportEmission);
            setFoodEmission(data.latest.foodEmission);
          }
          if (data.monthlyAverage !== undefined) setMonthlyAverage(data.monthlyAverage);
          if (data.percentageChange !== undefined) setPercentageChange(data.percentageChange);
          if (data.totalCalculations !== undefined) setTotalCalculationsCount(data.totalCalculations);
          if (data.lineChartData && data.lineChartData.length > 0) setLineChartData(data.lineChartData);
          if (data.breakdownData && data.breakdownData.length > 0) setBreakdownData(data.breakdownData);

          if (data.badges && data.badges.length > 0) setBadges(data.badges);
          if (data.leaderboard && data.leaderboard.length > 0) setLeaderboard(data.leaderboard);
          if (data.recommendations && data.recommendations.length > 0) setRecommendations(data.recommendations);
          if (data.activeChallenges && data.activeChallenges.length > 0) setChallenges(data.activeChallenges);
          if (data.learningHubWidget) setLearningWidget(data.learningHubWidget);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    const handleUserUpdated = () => {
      fetchDashboardStats();
    };
    window.addEventListener("userUpdated", handleUserUpdated);
    return () => window.removeEventListener("userUpdated", handleUserUpdated);
  }, [leaderboardTime]);

  // Chart rendering math
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 30;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;

  const maxChartVal = Math.max(...lineChartData.map((d) => d.val), 4.0);

  const points = lineChartData.map((d, i) => {
    const divisor = lineChartData.length > 1 ? lineChartData.length - 1 : 1;
    const x = paddingLeft + (i * (chartWidth - paddingLeft - paddingRight)) / divisor;
    const y = chartHeight - paddingBottom - (d.val * (chartHeight - paddingTop - paddingBottom)) / maxChartVal;
    return { x, y, month: d.month, val: d.val };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  const strokeWidth = 14;
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const cx = 56;
  const cy = 56;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col space-y-6">

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: LATEST FOOTPRINT */}
        <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[150px] relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Latest Footprint
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-1 leading-none">
                {totalEmission.toFixed(2)} <span className="text-sm font-extrabold text-gray-500">tons CO₂e</span>
              </h2>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <Leaf className="w-5 h-5 fill-emerald-600/10" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold pt-2 border-t border-gray-100">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Transport: {transportEmission.toFixed(2)}t
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              Food: {foodEmission.toFixed(2)}t
            </span>
          </div>
        </section>

        {/* CARD 2: MONTHLY AVERAGE */}
        <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Monthly Average
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-1 leading-none">
                {monthlyAverage.toFixed(2)} <span className="text-sm font-extrabold text-gray-500">tons/mo</span>
              </h2>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 pt-2 border-t border-gray-100">
            <span>Based on {totalCalculationsCount} calculations</span>
            <span className="text-emerald-600 font-extrabold">Target: &lt; 2.50t</span>
          </div>
        </section>

        {/* CARD 3: EMISSION TREND */}
        <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Progress Trend
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-1 leading-none flex items-center gap-1.5">
                <span>{percentageChange < 0 ? `${percentageChange}%` : `+${percentageChange}%`}</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {percentageChange < 0 ? "Reduction" : "Increase"}
                </span>
              </h2>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
              <Zap className="w-5 h-5" />
            </div>
          </div>

          <div className="text-xs font-medium text-gray-500 pt-2 border-t border-gray-100">
            <span>Compared to previous calculation</span>
          </div>
        </section>

      </div>

      {/* MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: CHARTS, BADGES & LEADERBOARD (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ROW 2: CHARTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 2A: EMISSIONS OVER TIME (LINE CHART) */}
            <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[280px]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Emissions Over Time</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Tracking calculation history</p>
                </div>

                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg outline-none cursor-pointer hover:bg-gray-100 transition"
                  >
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Line Chart SVG */}
              <div className="relative flex-grow w-full h-full flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  {/* Grid Lines */}
                  {[0, 1, 2, 3].map((g) => {
                    const y = paddingTop + (g * (chartHeight - paddingTop - paddingBottom)) / 3;
                    return (
                      <line
                        key={g}
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* Gradient Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#greenGradient)"
                      opacity="0.25"
                    />
                  )}

                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Line Path */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Interactive Points */}
                  {points.map((p, idx) => (
                    <g key={idx} onMouseEnter={() => setHoveredDataIndex(idx)} onMouseLeave={() => setHoveredDataIndex(null)}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredDataIndex === idx ? "7" : "4.5"}
                        fill={hoveredDataIndex === idx ? "#15803d" : "#22c55e"}
                        className="transition-all duration-150"
                      />
                      <circle cx={p.x} cy={p.y} r="2" fill="white" />
                      <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                      <text
                        x={p.x}
                        y={chartHeight - 6}
                        fill="#64748b"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {p.month}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Interactive Tooltip Overlay */}
                {hoveredDataIndex !== null && points[hoveredDataIndex] && (
                  <div
                    className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold shadow-xl border border-slate-800 transition duration-150 pointer-events-none -translate-x-1/2"
                    style={{
                      left: `${(points[hoveredDataIndex].x / chartWidth) * 100}%`,
                      bottom: `${((chartHeight - points[hoveredDataIndex].y + 12) / chartHeight) * 100}%`,
                    }}
                  >
                    <div className="text-center">
                      <p className="text-emerald-400">{points[hoveredDataIndex].month}</p>
                      <p className="text-xs">{points[hoveredDataIndex].val} tons</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* CARD 2B: EMISSIONS BREAKDOWN (DONUT CHART) */}
            <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[280px]">
              <h3 className="text-sm font-extrabold text-gray-900 mb-2">Emissions Breakdown</h3>

              <div className="flex items-center justify-between gap-4 flex-grow">
                {/* Donut graphic */}
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    {breakdownData.map((seg) => {
                      const pctStroke = (seg.pct * circ) / 100;
                      const pctOffset = circ - (accumulatedAngle * circ) / 100;
                      accumulatedAngle += seg.pct;

                      return (
                        <circle
                          key={seg.name}
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={`${pctStroke} ${circ}`}
                          strokeDashoffset={pctOffset}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>

                  {/* Donut cutout text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-black text-gray-800 leading-tight">{totalEmission.toFixed(2)}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tight">tons CO₂e</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-1.5">
                  {breakdownData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-gray-650">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block leading-none">{item.pct}%</span>
                        <span className="text-[9px] text-gray-400">({item.val} tons)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* ROW 3: BADGES & LEADERBOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 3A: BADGES */}
            <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-gray-900">Your Badges</h3>
                <Link href="/dashboard/challenges" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                  See all
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-2.5 flex-grow items-center">
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${
                        badge.locked || !badge.active
                          ? "bg-gray-50 text-gray-300 border-gray-200"
                          : badge.color || "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]"
                      }`}
                    >
                      {badge.locked || !badge.active ? (
                        <Lock className="w-5 h-5 text-gray-300" />
                      ) : (
                        <ShieldCheck className="w-6 h-6" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 mt-2 line-clamp-2 leading-tight">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* CARD 3B: LEADERBOARD */}
            <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-gray-900">Leaderboard</h3>
                <div className="relative">
                  <select
                    value={leaderboardTime}
                    onChange={(e) => setLeaderboardTime(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg outline-none cursor-pointer hover:bg-gray-100 transition"
                  >
                    <option value="weekly">This Week</option>
                    <option value="all">All Time</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Rows list */}
              <div className="space-y-1.5 flex-grow overflow-y-auto pr-1">
                {leaderboard.map((row) => (
                  <div
                    key={row.rank}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl transition ${
                      row.isUser
                        ? "bg-emerald-50/70 border border-emerald-100 text-emerald-800 font-bold"
                        : "hover:bg-gray-50 text-gray-755"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-black text-gray-400 w-3">{row.rank}</span>
                      <div className={`w-6.5 h-6.5 rounded-full overflow-hidden text-[9px] font-bold flex items-center justify-center ${
                        row.isUser
                          ? "bg-emerald-200 text-emerald-850"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {row.avatar}
                      </div>
                      <span className="text-xs font-bold leading-none">{row.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black">{row.points}</span>
                      <Leaf className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>

        {/* RIGHT COLUMN FOR CHALLENGES & LEARNING HUB */}
        <div className="flex flex-col space-y-6">

          {/* CARD 5: ACTIVE CHALLENGES */}
          <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-extrabold text-gray-900">Active Challenges</h3>
              <Link href="/dashboard/challenges" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                See all
              </Link>
            </div>

            <div className="space-y-3.5 flex-grow overflow-y-auto">
              {challenges.map((chal, i) => (
                <Link key={chal.id || i} href="/dashboard/challenges" className="p-3 rounded-xl border border-gray-150 bg-white flex flex-col space-y-2 hover:border-emerald-300 transition block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-850 leading-tight">{chal.title}</h4>
                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{chal.desc}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{chal.daysLeft} days left</span>
                  </div>

                  {/* Progress slider bar */}
                  <div className="flex items-center gap-3">
                    <div className="h-2 bg-gray-100 rounded-full flex-grow overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${chal.color || "bg-emerald-600"}`}
                        style={{ width: `${chal.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-gray-705 w-8 text-right">{chal.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* CARD 6: LEARNING HUB */}
          <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-gray-900">Learning Hub</h3>
              <Link href="/dashboard/learning" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                See all
              </Link>
            </div>

            <Link href="/dashboard/learning" className="flex items-center gap-3.5 bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex-grow hover:border-emerald-300 transition block">
              <div className="w-16 h-16 relative flex-shrink-0 bg-emerald-50 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-100">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-black text-gray-800 leading-tight">{learningWidget.title}</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1 line-clamp-2">
                    {learningWidget.desc}
                  </p>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                    <span>Progress</span>
                    <span>{learningWidget.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full transition-all duration-500" style={{ width: `${learningWidget.progress}%` }} />
                  </div>
                </div>
              </div>
            </Link>
          </section>

        </div>

      </div>

      {/* ================= FOOTER BANNER ================= */}
      <footer className="bg-white border border-gray-150 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600">
            <Leaf className="w-4 h-4 fill-emerald-600/10" />
          </span>
          <p className="text-xs font-bold text-gray-650 leading-snug">
            Every choice you make, makes a difference. Together, we can build a sustainable Peshawar.
          </p>
        </div>

        <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-98 transition flex items-center justify-center gap-2 whitespace-nowrap self-stretch sm:self-auto cursor-pointer">
          <span>Share Your Impact</span>
          <Share2 className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
