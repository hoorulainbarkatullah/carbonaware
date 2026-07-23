"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Zap,
  Leaf,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Lightbulb,
  Bookmark,
  Sparkles,
  UtensilsCrossed,
  Info,
  Trash2,
  MapPinIcon,
  Users,
  Calculator
} from "lucide-react";

export default function CalculatorPage() {
  // Active tab state (useful for mobile responsive view toggling)
  const [activeTab, setActiveTab] = useState<"transport" | "food">("transport");

  // --- Transport Input States ---
  const [fromLocation, setFromLocation] = useState("DHA Phase 5, Lahore");
  const [toLocation, setToLocation] = useState("Arfa Software House, Lahore");
  const [oneWayDist, setOneWayDist] = useState(12);
  const [roundTripDist, setRoundTripDist] = useState(24);
  const [transportType, setTransportType] = useState<"car" | "motorbike" | "bus" | "other">("car");
  const [fuelType, setFuelType] = useState("Petrol");
  const [frequency, setFrequency] = useState("Daily");

  // --- Food & Waste Input States ---
  const [dietType, setDietType] = useState<"vegetarian" | "mixed" | "meat-heavy">("mixed");
  const [consumptionLevel, setConsumptionLevel] = useState("Medium");
  const [foodWasteLevel, setFoodWasteLevel] = useState("Low");
  const [wasteMgmt, setWasteMgmt] = useState<"recycle" | "sometimes" | "never">("recycle");

  // --- Calculations ---
  const [transportFootprint, setTransportFootprint] = useState(1.35);
  const [foodFootprint, setFoodFootprint] = useState(0.70);
  const [totalFootprint, setTotalFootprint] = useState(2.05);

  const [transportPct, setTransportPct] = useState(66);
  const [foodPct, setFoodPct] = useState(34);

  // Sync one-way distance to round-trip
  const handleOneWayChange = (val: number) => {
    setOneWayDist(val);
    setRoundTripDist(val * 2);
  };

  // Sync round-trip back to one-way
  const handleRoundTripChange = (val: number) => {
    setRoundTripDist(val);
    setOneWayDist(Math.round(val / 2));
  };

  // Calculate results on input change
  useEffect(() => {
    // 1. Calculate Transport
    let transportFactor = 1.875; // Baseline for Petrol Car
    if (transportType === "car") {
      if (fuelType === "Diesel") transportFactor = 1.70;
      if (fuelType === "Hybrid") transportFactor = 0.90;
      if (fuelType === "Electric") transportFactor = 0.25;
    } else if (transportType === "motorbike") {
      transportFactor = 0.70;
    } else if (transportType === "bus") {
      transportFactor = 0.15;
    } else {
      transportFactor = 0.35;
    }

    let freqMultiplier = 30; // Daily
    if (frequency === "Weekly") freqMultiplier = 4;
    if (frequency === "Monthly") freqMultiplier = 1;

    // Transport emissions in tons/month
    const calcTransport = (roundTripDist * freqMultiplier * transportFactor) / 1000;
    setTransportFootprint(parseFloat(calcTransport.toFixed(2)));

    // 2. Calculate Food & Waste
    let dietBase = 0.60;
    if (dietType === "vegetarian") dietBase = 0.40;
    if (dietType === "meat-heavy") dietBase = 0.90;

    let consumptionFactor = 0.0;
    if (consumptionLevel === "Low") consumptionFactor = -0.15;
    if (consumptionLevel === "High") consumptionFactor = 0.20;

    let wasteFactor = 0.0;
    if (foodWasteLevel === "Medium") wasteFactor = 0.10;
    if (foodWasteLevel === "High") wasteFactor = 0.25;

    let recycleFactor = 0.10;
    if (wasteMgmt === "sometimes") recycleFactor = 0.20;
    if (wasteMgmt === "never") recycleFactor = 0.30;

    const calcFood = dietBase + consumptionFactor + wasteFactor + recycleFactor;
    setFoodFootprint(parseFloat(calcFood.toFixed(2)));

  }, [
    roundTripDist,
    transportType,
    fuelType,
    frequency,
    dietType,
    consumptionLevel,
    foodWasteLevel,
    wasteMgmt
  ]);

  // Sync total emissions and percentages
  useEffect(() => {
    const total = parseFloat((transportFootprint + foodFootprint).toFixed(2));
    setTotalFootprint(total);

    if (total > 0) {
      const tPct = Math.round((transportFootprint / total) * 100);
      setTransportPct(tPct);
      setFoodPct(100 - tPct);
    } else {
      setTransportPct(0);
      setFoodPct(0);
    }
  }, [transportFootprint, foodFootprint]);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* TABS & PLANET BANNER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Navigation Tabs */}
        <div className="bg-white border border-gray-150 p-1 rounded-2xl flex w-full md:w-max shadow-sm">
          <button
            onClick={() => setActiveTab("transport")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "transport"
                ? "bg-[#dcfce7] text-[#15803d]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Car className="w-4.5 h-4.5" />
            <span>Transport</span>
          </button>
          
          <button
            onClick={() => setActiveTab("food")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "food"
                ? "bg-[#dcfce7] text-[#15803d]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <UtensilsCrossed className="w-4.5 h-4.5" />
            <span>Food & Waste</span>
          </button>
        </div>

        {/* Small Planet Banner */}
        <div className="bg-[#dcfce7]/60 border border-emerald-100 text-[#15803d] px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm">
          <span>Every small step helps to save our planet! 🌍</span>
        </div>
      </div>

      {/* 3-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: TRANSPORT FOOTPRINT */}
        <div className={`bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px] ${
          activeTab === "transport" ? "block animate-fadeIn" : "hidden xl:block"
        }`}>
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">1. Transport Footprint</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Calculate emissions from your daily commute</p>
              </div>
            </div>

            {/* Commute Inputs */}
            <div className="space-y-3.5 pt-2">
              {/* From */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">From (Home)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">To (Workplace)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Distance grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">One-way Distance</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={oneWayDist}
                      onChange={(e) => handleOneWayChange(parseInt(e.target.value) || 0)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">km</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Round Trip</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={roundTripDist}
                      onChange={(e) => handleRoundTripChange(parseInt(e.target.value) || 0)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/20 text-emerald-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600">km</span>
                  </div>
                </div>
              </div>

              {/* Transport Type selector grid */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Transport Type</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[
                    { id: "car", label: "Car", icon: <Car className="w-4 h-4" /> },
                    { id: "motorbike", label: "Motorbike", icon: <Zap className="w-4 h-4" /> },
                    { id: "bus", label: "Bus", icon: <Users className="w-4 h-4" /> },
                    { id: "other", label: "Other", icon: <span className="text-[10px] leading-none">•••</span> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTransportType(item.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 justify-center transition cursor-pointer ${
                        transportType === item.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[9px] font-black">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Car details dropdowns */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Car Type / Fuel</label>
                  <div className="relative">
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      disabled={transportType !== "car"}
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>Hybrid</option>
                      <option>Electric</option>
                    </select>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Zap className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Travel Frequency</label>
                  <div className="relative">
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition appearance-none"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculate button & did you know box */}
          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs">
              <span>Calculate Transport Footprint</span>
              <Calculator className="w-4 h-4" />
            </button>

            {/* Did you know callout */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl flex items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <p className="text-[10px] font-black text-emerald-800 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-650" />
                  <span>Did you know?</span>
                </p>
                <p className="text-[9px] text-gray-550 leading-relaxed font-bold">
                  Using public transport just 2 times a week can reduce your annual emissions by up to 1 ton of CO₂.
                </p>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm border border-emerald-100">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: FOOD & WASTE FOOTPRINT */}
        <div className={`bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px] ${
          activeTab === "food" ? "block animate-fadeIn" : "hidden xl:block"
        }`}>
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">🥗 .Food & Waste Footprint</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Calculate emissions from your food habits and waste management</p>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4 pt-2">
              {/* Diet Type */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Diet Type</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "vegetarian", label: "Vegetarian", icon: <Leaf className="w-4.5 h-4.5" /> },
                    { id: "mixed", label: "Mixed", icon: <Leaf className="w-4.5 h-4.5 text-emerald-600 fill-emerald-600/10" /> },
                    { id: "meat-heavy", label: "Meat-heavy", icon: <Zap className="w-4.5 h-4.5" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDietType(item.id as any)}
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        dietType === item.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[9px] font-black">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Consumption Level */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Food Consumption Level</label>
                <div className="relative">
                  <select
                    value={consumptionLevel}
                    onChange={(e) => setConsumptionLevel(e.target.value)}
                    className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition appearance-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Food Waste Level */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Food Waste Level</label>
                <div className="relative">
                  <select
                    value={foodWasteLevel}
                    onChange={(e) => setFoodWasteLevel(e.target.value)}
                    className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition appearance-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Waste Management */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Waste Management</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "recycle", label: "Recycle", icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
                    { id: "sometimes", label: "Sometimes", icon: <Calendar className="w-4 h-4 text-gray-400" /> },
                    { id: "never", label: "Never", icon: <Trash2 className="w-4 h-4 text-red-400" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setWasteMgmt(item.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        wasteMgmt === item.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[9px] font-black">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs">
              <span>Calculate Food Footprint</span>
              <Calculator className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COLUMN 3: YOUR CARBON FOOTPRINT RESULTS */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px]">
          
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Your Carbon Footprint</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Here's your estimated breakdown</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="12"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="68"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 68}
                  strokeDashoffset={2 * Math.PI * 68 * (1 - (totalFootprint / 3.5))} // Scaled out of 3.5 tons max
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-tight">Total Footprint</span>
                <span className="text-3xl font-black text-gray-900 leading-none mt-1">{totalFootprint.toFixed(2)}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">tons CO₂ / month</span>
                
                {/* Improvement pill */}
                <div className="mt-2.5 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-100">
                  <TrendingDown className="w-3 h-3 text-emerald-700" />
                  <span>15% better</span>
                </div>
              </div>
            </div>

            {/* Progress Breakdown list */}
            <div className="space-y-3">
              {/* Transport progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span>Transport Footprint</span>
                  </div>
                  <span>{transportFootprint.toFixed(2)} tons CO₂</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 bg-gray-100 rounded-full flex-grow overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${transportPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md min-w-[32px] text-center border border-emerald-100">
                    {transportPct}%
                  </span>
                </div>
              </div>

              {/* Food progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                    <span>Food & Waste Footprint</span>
                  </div>
                  <span>{foodFootprint.toFixed(2)} tons CO₂</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 bg-gray-100 rounded-full flex-grow overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${foodPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md min-w-[32px] text-center border border-emerald-100">
                    {foodPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips and actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            {/* Tips widget */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0]/40 p-3.5 rounded-2xl flex items-start gap-2.5">
              <Lightbulb className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-emerald-800">Tip to reduce your footprint</p>
                <p className="text-[9px] text-gray-650 leading-relaxed font-semibold mt-0.5">
                  Consider carpooling or using public transport and try reducing food waste.
                </p>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-600 font-extrabold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition cursor-pointer shadow-sm">
                <Bookmark className="w-4 h-4" />
                <span>Save Result</span>
              </button>
              
              <Link
                href="/dashboard/recommendations"
                className="flex items-center justify-center gap-2 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer text-center"
              >
                <span>Recommendations</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM ACTION CARD */}
      <div className="bg-[#f0fdf4] border border-[#bbf7d0]/40 rounded-2xl p-4.5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 border border-emerald-200">
            🌱
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-900 leading-tight">Track more. Improve more. Inspire others.</h4>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">
              Keep tracking your footprint and take action towards a greener tomorrow.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/history"
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-250 font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition whitespace-nowrap self-stretch sm:self-auto cursor-pointer"
        >
          <span>View History</span>
          <TrendingDown className="w-4 h-4 transform rotate-180" />
        </Link>
      </div>

    </div>
  );
}
