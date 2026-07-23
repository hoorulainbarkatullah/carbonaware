"use client";

import { useState } from "react";
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
  ExternalLink
} from "lucide-react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const historyRecords = [
    {
      id: 1,
      date: "Jun 2026",
      transport: 0.88,
      energy: 0.72,
      diet: 0.60,
      waste: 0.20,
      total: 2.40,
      status: "Excellent",
      reduction: "-10%"
    },
    {
      id: 2,
      date: "May 2026",
      transport: 0.95,
      energy: 0.80,
      diet: 0.65,
      waste: 0.22,
      total: 2.62,
      status: "Good",
      reduction: "-3%"
    },
    {
      id: 3,
      date: "Apr 2026",
      transport: 1.05,
      energy: 0.82,
      diet: 0.65,
      waste: 0.25,
      total: 2.77,
      status: "Average",
      reduction: "+2%"
    },
    {
      id: 4,
      date: "Mar 2026",
      transport: 1.10,
      energy: 0.88,
      diet: 0.70,
      waste: 0.25,
      total: 2.93,
      status: "Average",
      reduction: "-4%"
    },
    {
      id: 5,
      date: "Feb 2026",
      transport: 1.20,
      energy: 0.95,
      diet: 0.75,
      waste: 0.30,
      total: 3.20,
      status: "High",
      reduction: "Baseline"
    }
  ];

  const filteredRecords = historyRecords.filter(r => 
    r.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            Footprint History 📂
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse and download past carbon calculation reports and progress history.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50 transition cursor-pointer self-stretch sm:self-auto justify-center">
          <Download className="w-4.5 h-4.5 text-gray-400" />
          <span>Export All Data (.CSV)</span>
        </button>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Average Monthly Footprint</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">2.78 <span className="text-sm font-semibold text-gray-400">tons</span></span>
          <span className="text-[10px] text-emerald-600 font-bold mt-2 block flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Down 25% from February</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Total Logs Recorded</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">5 months</span>
          <span className="text-[10px] text-gray-400 font-semibold mt-2 block">Next record cycle due in 12 days.</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Total Carbon Saved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">850 kg <span className="text-sm font-semibold text-emerald-500">CO₂e</span></span>
          <span className="text-[10px] text-gray-400 font-semibold mt-2 block">Equivalent to planting 14 trees.</span>
        </div>
      </div>

      {/* TABLE FILTERS & LOG */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
        {/* Search header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by date or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <button className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer">
              <Filter className="w-4 h-4 text-gray-400" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100">
                <th className="py-3 px-5">Month / Date</th>
                <th className="py-3 px-5">🚗 Transport</th>
                <th className="py-3 px-5">💡 Energy</th>
                <th className="py-3 px-5">🥗 Diet</th>
                <th className="py-3 px-5">🗑️ Waste</th>
                <th className="py-3 px-5">Total Emissions</th>
                <th className="py-3 px-5">Change</th>
                <th className="py-3 px-5 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition">
                  <td className="py-4.5 px-5 text-gray-900 font-extrabold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{record.date}</span>
                  </td>
                  <td className="py-4.5 px-5 text-gray-600">{record.transport} t</td>
                  <td className="py-4.5 px-5 text-gray-600">{record.energy} t</td>
                  <td className="py-4.5 px-5 text-gray-600">{record.diet} t</td>
                  <td className="py-4.5 px-5 text-gray-600">{record.waste} t</td>
                  <td className="py-4.5 px-5 text-gray-900 font-black">{record.total.toFixed(2)} t</td>
                  <td className="py-4.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      record.reduction.startsWith("-")
                        ? "bg-emerald-50 text-emerald-700"
                        : record.reduction.startsWith("+")
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {record.reduction}
                    </span>
                  </td>
                  <td className="py-4.5 px-5 text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 ml-auto cursor-pointer font-extrabold">
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-semibold">
                    No history log entries matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
