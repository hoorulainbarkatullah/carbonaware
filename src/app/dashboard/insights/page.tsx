"use client";

import { useState } from "react";
import {
  TrendingDown,
  Building,
  Users,
  Compass,
  AlertTriangle,
  Info,
  Calendar,
  ChevronDown
} from "lucide-react";

export default function InsightsPage() {
  const [activeDept, setActiveDept] = useState("Operations");

  const depts = [
    { name: "Operations", emissions: 14.5, pct: 42, color: "bg-emerald-600", trend: "-5%" },
    { name: "Logistics", emissions: 11.2, pct: 32, color: "bg-blue-500", trend: "+2%" },
    { name: "Sales & Marketing", emissions: 5.8, pct: 16, color: "bg-amber-500", trend: "-12%" },
    { name: "Administration", emissions: 3.5, pct: 10, color: "bg-purple-500", trend: "-1%" }
  ];

  const carbonOffsets = [
    { year: "2026", credits: 120, status: "Verified", source: "Peshawar Urban Afforestation Project" },
    { year: "2025", credits: 85, status: "Verified", source: "KP Solar Parks Solar Grid Program" }
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-end items-center">
        <div className="relative">
          <select className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 pr-8 rounded-xl shadow-sm outline-none cursor-pointer hover:bg-gray-50 transition">
            <option>Q2 2026 Audit</option>
            <option>Q1 2026 Audit</option>
            <option>Annual Audit 2025</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* BENCHMARK GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Total Corp Footprint</span>
            <span className="text-2xl font-black text-gray-900 mt-0.5 block">35.0 <span className="text-sm font-semibold text-gray-450">tons</span></span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">Inside regional benchmark limits.</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-650">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Per Capita Average</span>
            <span className="text-2xl font-black text-gray-900 mt-0.5 block">0.88 <span className="text-sm font-semibold text-gray-450">tons</span></span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1.5 block">20% lower than KP state averages.</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Sustainability Grade</span>
            <span className="text-2xl font-black text-amber-600 mt-0.5 block">A- Grade</span>
            <span className="text-[10px] text-gray-450 font-bold mt-1.5 block">Based on Green Auditing scores.</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        
        {/* DEPARTMENT COMPONENT */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900">Emissions by Department</h3>

          <div className="space-y-4 flex-grow">
            {depts.map((dept) => (
              <div
                key={dept.name}
                onClick={() => setActiveDept(dept.name)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col space-y-2 ${
                  activeDept === dept.name
                    ? "bg-emerald-50/20 border-emerald-300"
                    : "bg-white border-gray-100 hover:border-gray-250"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-805">{dept.name}</span>
                  <span className="text-gray-900">{dept.emissions} tons ({dept.pct}%)</span>
                </div>
                
                <div className="flex items-center gap-3.5">
                  {/* Slider line bar */}
                  <div className="h-2.5 bg-gray-100 rounded-full flex-grow overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${dept.color}`}
                      style={{ width: `${dept.pct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-black w-10 text-right ${
                    dept.trend.startsWith("-") ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {dept.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARBON OFFSET AUDIT CARDS */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900">Carbon Offsets & Credits</h3>
          
          <div className="space-y-4 flex-grow">
            {carbonOffsets.map((offset, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-gray-100 bg-[#fbfdfc] space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-gray-900">{offset.year} Offsets</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {offset.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">PROJECT SOURCE</p>
                  <p className="text-xs font-bold text-gray-800 leading-snug mt-0.5">{offset.source}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">-{offset.credits} t CO₂e saved</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 leading-relaxed font-bold">
              Carbon credits offset audits for Q2 2026 are scheduled for third-party verification on July 30.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
