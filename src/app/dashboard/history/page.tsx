"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Car,
  Zap,
  Leaf,
  Trash2,
  TrendingDown,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  UtensilsCrossed,
  Flame,
  Medal,
  ChevronDown
} from "lucide-react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [timeRange, setTimeRange] = useState("Last 6 Months");

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Real backend data state
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    averageMonthlyFootprint: 0,
    totalLogsRecorded: 0,
    totalCarbonSavedKg: 0,
  });

  const [analytics, setAnalytics] = useState<{
    lowestFootprint: number;
    lowestDate: string;
    highestFootprint: number;
    highestDate: string;
    longestStreakVal: number;
    longestStreakDate: string;
    footprintTrend: Array<{ month: string; fullDate: string; total: number }>;
    breakdownData: {
      dateLabel: string;
      total: number;
      items: Array<{ name: string; val: number; pct: number; color: string }>;
    };
  }>({
    lowestFootprint: 2.15,
    lowestDate: "Jun 2024",
    highestFootprint: 2.75,
    highestDate: "Jan 2024",
    longestStreakVal: 1.78,
    longestStreakDate: "Jun 2024",
    footprintTrend: [
      { month: "Jan", fullDate: "Jan 2024", total: 2.75 },
      { month: "Feb", fullDate: "Feb 2024", total: 2.45 },
      { month: "Mar", fullDate: "Mar 2024", total: 2.30 },
      { month: "Apr", fullDate: "Apr 2024", total: 2.10 },
      { month: "May", fullDate: "May 2024", total: 1.70 },
      { month: "Jun", fullDate: "Jun 2024", total: 2.15 },
    ],
    breakdownData: {
      dateLabel: "June 2024",
      total: 2.15,
      items: [
        { name: "Transport", val: 1.55, pct: 72.0, color: "#16a34a" },
        { name: "Food & Waste", val: 0.45, pct: 21.0, color: "#3b82f6" },
        { name: "Others", val: 0.15, pct: 7.0, color: "#eab308" },
      ],
    },
  });

  // Selected calculation record for Details Modal
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Fetch history records from MongoDB via Prisma API
  const fetchHistory = async () => {
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

      const userQuery = uid ? `&userId=${encodeURIComponent(uid)}` : "";
      const url = `/api/calculator/history?page=${page}&limit=5&search=${encodeURIComponent(searchTerm)}${userQuery}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecords(data.records || []);
          setTotalPages(data.totalPages || 1);
          if (data.summary) {
            setSummary(data.summary);
          }
          if (data.analytics) {
            setAnalytics(data.analytics);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch calculation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, searchTerm]);

  // Client filter by status if applied
  const filteredRecords = records.filter((r) => {
    if (statusFilter === "All") return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ["ID,Date,Transport (t),Diet/Food (t),Total Emissions (t),Status,Change\n"];
    const rows = records.map(
      (r) => `"${r.id}","${r.date}",${r.transport},${r.diet},${r.total},"${r.status}","${r.reduction}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carbon_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for SVG Trend Line calculation
  const trendData = analytics.footprintTrend;
  const maxVal = Math.max(...trendData.map((d) => d.total), 3.0);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* ACTION CONTROLS BAR */}
      <div className="flex justify-end items-center gap-3">
        {/* Time range selector */}
        <div className="relative">
          <button
            onClick={() => setTimeRange(timeRange === "Last 6 Months" ? "All Time" : "Last 6 Months")}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition cursor-pointer"
          >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{timeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

      {/* TOP 4 SUMMARY STAT CARDS MATCHING DESIGN IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lowest Footprint */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lowest Footprint</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{analytics.lowestFootprint.toFixed(2)}</span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium block">ton CO₂ / month</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Lowest Footprint % vs last 6 months */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lowest Footprint</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">12.6%</span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium block">vs last 6 months</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingDown className="w-6 h-6 transform -rotate-45" />
          </div>
        </div>

        {/* Card 3: Longest Streak */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Longest Streak</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{analytics.longestStreakVal.toFixed(2)}</span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium block">ton CO₂ ({analytics.longestStreakDate})</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl">
            🏆
          </div>
        </div>

        {/* Card 4: Highest Footprint */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4.5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Highest Footprint</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900">{analytics.highestFootprint.toFixed(2)}</span>
            </div>
            <span className="text-[9px] text-gray-400 font-medium block">ton CO₂ ({analytics.highestDate})</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2-COLUMN ANALYTICS CHARTS SECTION (IMAGE MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FOOTPRINT TREND LINE CHART (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Footprint Trend</h3>
              <span className="text-[10px] text-gray-400 font-semibold">Ton CO₂</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700">
              <span>Ton CO₂</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Interactive SVG Trend Line */}
          <div className="relative w-full h-48 mt-2">
            {/* Y-axis Grid Labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] text-gray-400 font-bold pointer-events-none">
              <span>3</span>
              <span>2</span>
              <span>1</span>
              <span>0</span>
            </div>

            {/* Horizontal Grid lines */}
            <div className="pl-6 inset-0 h-full flex flex-col justify-between">
              <div className="w-full border-b border-gray-100 h-0" />
              <div className="w-full border-b border-gray-100 h-0" />
              <div className="w-full border-b border-gray-100 h-0" />
              <div className="w-full border-b border-gray-200 h-0" />
            </div>

            {/* SVG Line & Data Points */}
            <div className="absolute inset-0 pl-8 pr-4 pt-2 pb-6">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Calculate points dynamically */}
                {(() => {
                  const pts = trendData.map((d, idx) => {
                    const x = (idx / Math.max(1, trendData.length - 1)) * 480 + 10;
                    const y = 140 - (d.total / 3.2) * 130;
                    return { x, y, total: d.total, month: d.month };
                  });

                  const pathStr = pts.reduce(
                    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ""
                  );

                  return (
                    <>
                      {/* Polyline */}
                      <path
                        d={pathStr}
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Circles and Data Value Badges */}
                      {pts.map((p, i) => (
                        <g key={i} className="group">
                          {/* Value badge over node */}
                          <text
                            x={p.x}
                            y={p.y - 12}
                            textAnchor="middle"
                            className="text-[11px] font-black fill-gray-900"
                          >
                            {p.total.toFixed(2)}
                          </text>

                          {/* Data point circle */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            className="fill-[#16a34a] stroke-white stroke-[2.5]"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              {/* X-axis Month Labels */}
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mt-2">
                {trendData.map((d, i) => (
                  <span key={i} className="text-center w-8">
                    {d.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BREAKDOWN DONUT CHART (1 Col) */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">
              Breakdown ({analytics.breakdownData.dateLabel})
            </h3>
          </div>

          {/* Donut Chart visual */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="64"
                fill="transparent"
                stroke="#eab308"
                strokeWidth="14"
              />
              <circle
                cx="88"
                cy="88"
                r="64"
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="14"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - (analytics.breakdownData.items[0]?.pct || 70) / 100)}
                className="transition-all duration-700"
              />
              <circle
                cx="88"
                cy="88"
                r="64"
                fill="transparent"
                stroke="#16a34a"
                strokeWidth="14"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - (analytics.breakdownData.items[0]?.pct || 70) / 100)}
                className="transition-all duration-700"
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {analytics.breakdownData.total.toFixed(2)}
              </span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Ton CO₂
              </span>
            </div>
          </div>

          {/* Breakdown Legend List matching Design Image */}
          <div className="space-y-2.5 pt-2">
            {analytics.breakdownData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <span className="text-gray-500 font-semibold">
                  {item.val.toFixed(2)} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* HISTORY LOG TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
        {/* Table Title and Search Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <h3 className="text-sm font-extrabold text-gray-900">History Log</h3>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 sm:max-w-md justify-end">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by date..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer whitespace-nowrap"
              >
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span>Filter</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 w-36 text-xs font-bold text-gray-700">
                  {["All", "Excellent", "Good", "Average", "High"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-emerald-50 hover:text-emerald-700 ${
                        statusFilter === status ? "text-emerald-700 font-black bg-emerald-50/50" : ""
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table Matching Design Header Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 border-b border-gray-100">
                <th className="py-3.5 px-5">Month</th>
                <th className="py-3.5 px-5">Transport (Ton CO₂)</th>
                <th className="py-3.5 px-5">Food & Waste (Ton CO₂)</th>
                <th className="py-3.5 px-5">Others (Ton CO₂)</th>
                <th className="py-3.5 px-5">Total (Ton CO₂)</th>
                <th className="py-3.5 px-5">Change</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-4 px-5 text-gray-900 font-extrabold">
                    {record.date}
                  </td>
                  <td className="py-4 px-5 text-gray-700">{record.transport.toFixed(2)}</td>
                  <td className="py-4 px-5 text-gray-700">{record.diet.toFixed(2)}</td>
                  <td className="py-4 px-5 text-gray-700">{record.waste ? record.waste.toFixed(2) : "0.15"}</td>
                  <td className="py-4 px-5 text-gray-900 font-black">{record.total.toFixed(2)}</td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1 font-black ${
                      record.reduction.startsWith("-")
                        ? "text-emerald-600"
                        : record.reduction.startsWith("+")
                        ? "text-red-500"
                        : "text-emerald-600"
                    }`}>
                      {record.reduction.startsWith("-") ? "↓ " : record.reduction.startsWith("+") ? "↑ " : "↓ "}
                      {record.reduction.replace("-", "").replace("+", "")}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="text-emerald-600 hover:text-emerald-700 text-xs font-extrabold cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold">
                    No history log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-600">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Calculation Report Details</h3>
                <p className="text-xs text-gray-400 font-semibold">{selectedRecord.date}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {/* Summary pill */}
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex justify-between items-center">
                <span className="text-xs font-extrabold text-emerald-900">Total Carbon Footprint</span>
                <span className="text-lg font-black text-emerald-700">{selectedRecord.total.toFixed(2)} tons CO₂e</span>
              </div>

              {/* Transport Details */}
              <div className="border border-gray-150 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-gray-800">
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Transport Footprint: {selectedRecord.transport.toFixed(2)} tons</span>
                </div>
                {selectedRecord.transportData ? (
                  <div className="text-[11px] text-gray-600 space-y-1 font-semibold pl-6">
                    <p>• Type: {selectedRecord.transportData.transportType || "Car"} ({selectedRecord.transportData.fuelType || "Petrol"})</p>
                    <p>• Route: {selectedRecord.transportData.fromLocation || "N/A"} → {selectedRecord.transportData.toLocation || "N/A"}</p>
                    <p>• Distance: {selectedRecord.transportData.distanceKm || selectedRecord.transportData.roundTripDist || 0} km ({selectedRecord.transportData.tripsPerWeek || 5} trips/wk)</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 pl-6">Standard transport commute data</p>
                )}
              </div>

              {/* Food Details */}
              <div className="border border-gray-150 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-gray-800">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                  <span>Food & Waste Footprint: {selectedRecord.diet.toFixed(2)} tons</span>
                </div>
                {selectedRecord.foodData ? (
                  <div className="text-[11px] text-gray-600 space-y-1 font-semibold pl-6">
                    <p>• Diet: {selectedRecord.foodData.dietType || "Mixed"}</p>
                    <p>• Meals/Day: {selectedRecord.foodData.mealsPerDay || 3}</p>
                    <p>• Local Food %: {selectedRecord.foodData.localFoodPct || 50}%</p>
                    <p>• Waste Level: {selectedRecord.foodData.foodWasteLevel || "Low"}</p>
                    <p>• Recycling: {selectedRecord.foodData.wasteMgmt || "Recycle"}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 pl-6">Standard dietary & waste data</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
