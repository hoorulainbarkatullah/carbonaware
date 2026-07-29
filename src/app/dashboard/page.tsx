"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserName(u.name);
        const initials = u.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        setUserInitials(initials);
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchDashboardStats() {
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

        const url = uid ? `/api/dashboard/stats?userId=${encodeURIComponent(uid)}` : "/api/dashboard/stats";
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
          }
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  // Leaderboard data
  const leaderboard = [
    { rank: 1, name: "Sara Khan", points: 1200, avatar: "SK", isUser: false },
    { rank: 2, name: `${userName} (You)`, points: Math.max(100 * totalCalculationsCount, 950), avatar: userInitials, isUser: true },
    { rank: 3, name: "Hamza Bilal", points: 870, avatar: "HB", isUser: false },
    { rank: 4, name: "Ayesha Noor", points: 760, avatar: "AN", isUser: false },
    { rank: 5, name: "Bilal Ahmed", points: 600, avatar: "BA", isUser: false },
  ];

  // Active Challenges data
  const challenges = [
    {
      title: "No Car Day",
      desc: "Use no private vehicle",
      progress: 60,
      daysLeft: 3,
      color: "bg-[#22c55e]",
      icon: <Car className="w-5 h-5 text-red-500" />,
      iconBg: "bg-red-50",
      border: "border-red-100"
    },
    {
      title: "Reduce Energy by 15%",
      desc: "Reduce electricity usage",
      progress: 40,
      daysLeft: 7,
      color: "bg-amber-500",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      title: "Go Green This Week",
      desc: "Adopt 3 eco-friendly habits",
      progress: 20,
      daysLeft: 5,
      color: "bg-purple-500",
      icon: <Leaf className="w-5 h-5 text-purple-500" />,
      iconBg: "bg-purple-50",
      border: "border-purple-100"
    }
  ];

  // AI Recommendations
  const recommendations = [
    {
      title: "Use public transport 2x more",
      desc: "Could reduce 120 kg CO₂e/month",
      icon: <Car className="w-5 h-5 text-[#16a34a]" />,
      iconBg: "bg-[#dcfce7]",
    },
    {
      title: "Reduce electricity usage at night",
      desc: "Could reduce 80 kg CO₂e/month",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-50",
    },
    {
      title: "Try 2 more vegetarian meals weekly",
      desc: "Could reduce 60 kg CO₂e/month",
      icon: <Leaf className="w-5 h-5 text-[#16a34a]" />,
      iconBg: "bg-[#dcfce7]",
    },
  ];

  // Badges data dynamically calculated based on calculation count
  const badges = [
    { name: "Eco Starter", desc: "First calculation", active: totalCalculationsCount >= 1, color: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]" },
    { name: "Consistent Tracker", desc: "Track for 4 weeks", active: totalCalculationsCount >= 4, color: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]" },
    { name: "Green Achiever", desc: "Reduce footprint by 10%", active: percentageChange < 0, color: "bg-blue-50 text-blue-700 border-blue-100" },
    { name: "Climate Saver", desc: "Save 500kg CO₂e", active: false, locked: true },
    { name: "Planet Guardian", desc: "Complete 10 challenges", active: false, locked: true },
  ];

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
  const areaPath = points.length > 0 ? `
    ${linePath} 
    L ${points[points.length - 1].x} ${chartHeight - paddingBottom} 
    L ${points[0].x} ${chartHeight - paddingBottom} 
    Z
  ` : "";

  // Compute donut segment arcs
  let accumulatedAngle = 0;
  const radius = 50;
  const cx = 60;
  const cy = 60;
  const strokeWidth = 14;
  const circ = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col space-y-6">
      {/* ================= DASHBOARD GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS FOR MAIN WIDGETS */}
        <div className="xl:col-span-2 flex flex-col space-y-6">
          
          {/* CARD 1: YOUR CARBON FOOTPRINT */}
          <section className="bg-white rounded-2xl border border-gray-150 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-3xl -z-10" />
            
            {/* Gauge section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1">
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background track circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="11"
                  />
                  {/* Active circular progress path */}
                  <circle
                    cx="72"
                    cy="72"
                    r="54"
                    fill="transparent"
                    stroke="#16a34a"
                    strokeWidth="11"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(totalEmission / 4.0, 1.0))}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Gauge contents */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600 mb-1">
                    <Leaf className="w-4 h-4 fill-emerald-600/10" />
                  </div>
                  <span className="text-2xl font-black text-gray-900 leading-none">{totalEmission.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 font-bold tracking-tight mt-0.5 uppercase">tons CO₂e</span>
                  <span className="text-[9px] text-emerald-600 font-semibold mt-0.5">This Month</span>
                </div>
              </div>

              {/* Progress Details text */}
              <div className="text-center sm:text-left flex-1 max-w-sm">
                <h3 className="text-base font-bold text-gray-800">Your Carbon Footprint</h3>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  {!hasData
                    ? "No calculations recorded yet. Calculate your footprint to get started!"
                    : percentageChange <= 0
                    ? "You are doing better than last month!"
                    : "Emissions increased slightly. Check tips to reduce!"}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2.5 text-emerald-600 bg-emerald-50 w-max px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-100">
                  <TrendingDown className={`w-4.5 h-4.5 animate-bounce ${percentageChange > 0 ? "rotate-180 text-red-500" : ""}`} />
                  <span>{Math.abs(percentageChange)}% from last calculation</span>
                </div>
                <button className="mt-4 flex items-center justify-center sm:justify-start gap-2 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-bold px-4 py-2.5 rounded-xl transition duration-200 cursor-pointer">
                  <span>View Full Report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Globe Illustration */}
            <div className="w-48 h-36 relative overflow-hidden rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-50/50 to-green-50/20">
              <img
                src="/dashboard-globe.jpg"
                alt="Sustainability Globe"
                className="w-full h-full object-contain mix-blend-multiply scale-110 group-hover:scale-115 transition duration-500"
              />
            </div>
          </section>

          {/* CARD 2: EMISSIONS OVER TIME & BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 2A: EMISSIONS OVER TIME (LINE CHART) */}
            <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[280px]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Emissions Over Time</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">(tons CO₂e)</p>
                </div>
                <div className="relative">
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 pr-8 rounded-lg outline-none cursor-pointer hover:bg-gray-100 transition"
                  >
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Yearly</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* SVG Line Chart */}
              <div className="relative flex-grow flex items-end">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="green-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Y-axis gridlines */}
                  {[0, 1, 2, 3, 4].map((gridval) => {
                    const y = chartHeight - paddingBottom - (gridval * (chartHeight - paddingTop - paddingBottom)) / 4.0;
                    return (
                      <g key={gridval}>
                        <line
                          x1={paddingLeft}
                          y1={y}
                          x2={chartWidth - paddingRight}
                          y2={y}
                          stroke="#f1f5f9"
                          strokeWidth="1.5"
                        />
                        <text
                          x={paddingLeft - 8}
                          y={y + 3.5}
                          fill="#94a3b8"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {gridval.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradient Area under line */}
                  <path d={areaPath} fill="url(#green-area-grad)" />

                  {/* Line Path */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Chart Points & Hover triggers */}
                  {points.map((p, idx) => (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDataIndex(idx)}
                      onMouseLeave={() => setHoveredDataIndex(null)}
                    >
                      {/* Dot shadow */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredDataIndex === idx ? "7" : "4.5"}
                        fill={hoveredDataIndex === idx ? "#15803d" : "#22c55e"}
                        className="transition-all duration-150"
                      />
                      {/* Inner white dot */}
                      <circle cx={p.x} cy={p.y} r="2" fill="white" />
                      
                      {/* Interactive invisible larger hover zone */}
                      <circle cx={p.x} cy={p.y} r="18" fill="transparent" />

                      {/* X-axis labels */}
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

                {/* Interactive Tooltip Card overlay */}
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

                {/* Highlight box for latest static/dynamic value */}
                {hoveredDataIndex === null && points.length > 0 && (
                  <div
                    className="absolute bg-white text-gray-900 border border-gray-200 rounded-lg px-2 py-1 shadow-md text-[10px] font-bold -translate-x-1/2"
                    style={{
                      left: `${(points[points.length - 1].x / chartWidth) * 100}%`,
                      bottom: `${((chartHeight - points[points.length - 1].y + 12) / chartHeight) * 100}%`,
                    }}
                  >
                    <span className="text-xs font-black text-gray-800">{points[points.length - 1].val.toFixed(2)}</span>
                    <span className="text-gray-400 ml-0.5">tons</span>
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
                    {breakdownData.map((seg, i) => {
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
                          className="transition-all duration-300 animate-pulse-slow"
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
                <button className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                  See all
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2.5 flex-grow items-center">
                {badges.map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200 group-hover:scale-105 ${
                        badge.locked || !badge.active
                          ? "bg-gray-50 text-gray-300 border-gray-200"
                          : badge.color
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
                    <option>This Week</option>
                    <option>All Time</option>
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

        {/* RIGHT COLUMN FOR RECOMMENDATIONS & CHALLENGES */}
        <div className="flex flex-col space-y-6">
          
          {/* CARD 4: AI RECOMMENDATIONS */}
          <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-gray-900">AI Recommendations</h3>
              <button className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                See all
              </button>
            </div>

            <div className="space-y-3.5 flex-grow overflow-y-auto">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-white hover:border-emerald-100 hover:bg-emerald-50/20 cursor-pointer transition duration-200 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${rec.iconBg}`}>
                      {rec.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-805 leading-tight group-hover:text-emerald-800 transition">
                        {rec.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">{rec.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </section>

          {/* CARD 5: ACTIVE CHALLENGES */}
          <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col h-[280px]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-extrabold text-gray-900">Active Challenges</h3>
              <button className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                See all
              </button>
            </div>

            <div className="space-y-3.5 flex-grow overflow-y-auto">
              {challenges.map((chal, i) => (
                <div key={i} className={`p-3 rounded-xl border ${chal.border} bg-white flex flex-col space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${chal.iconBg}`}>
                        {chal.icon}
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
                        className={`h-full rounded-full transition-all duration-500 ${chal.color}`}
                        style={{ width: `${chal.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-gray-705 w-8 text-right">{chal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CARD 6: LEARNING HUB */}
          <section className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col justify-between h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-gray-900">Learning Hub</h3>
              <button className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition cursor-pointer">
                See all
              </button>
            </div>

            <div className="flex items-center gap-3.5 bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex-grow">
              {/* Book graphic */}
              <div className="w-16 h-16 relative flex-shrink-0 bg-emerald-50 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-100">
                <Leaf className="w-9 h-9 text-emerald-600 fill-emerald-600/10" />
              </div>

              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-xs font-black text-gray-800 leading-tight">What is Carbon Footprint?</h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-semibold mt-1">
                    Learn the basics of carbon footprint and its impact on climate change.
                  </p>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-bold">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>
            </div>
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
