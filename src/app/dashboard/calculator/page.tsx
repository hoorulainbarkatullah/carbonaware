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
  UtensilsCrossed,
  Trash2,
  Users,
  Calculator,
  AlertCircle,
  CheckCircle2,
  X
} from "lucide-react";

export default function CalculatorPage() {
  // Active tab state (for mobile responsive view toggling)
  const [activeTab, setActiveTab] = useState<"transport" | "food">("transport");

  // Calculation Document ID tracking
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Transport Input States ---
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [transportType, setTransportType] = useState<"car" | "motorbike" | "bus" | "train" | "bicycle" | "walking">("car");
  const [fuelType, setFuelType] = useState<"Petrol" | "Diesel" | "Hybrid" | "Electric">("Petrol");
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(0);

  // --- Food & Waste Input States ---
  const [dietType, setDietType] = useState<"vegan" | "vegetarian" | "mixed" | "meat-heavy">("mixed");
  const [mealsPerDay, setMealsPerDay] = useState<number>(0);
  const [localFoodPct, setLocalFoodPct] = useState<number>(0);
  const [foodWasteLevel, setFoodWasteLevel] = useState<"low" | "medium" | "high">("low");
  const [wasteMgmt, setWasteMgmt] = useState<"recycle" | "compost" | "sometimes" | "never">("recycle");

  // --- Calculations ---
  const [transportFootprint, setTransportFootprint] = useState<number>(0.0);
  const [foodFootprint, setFoodFootprint] = useState<number>(0.0);
  const [totalFootprint, setTotalFootprint] = useState<number>(0.0);

  const [transportPct, setTransportPct] = useState<number>(50);
  const [foodPct, setFoodPct] = useState<number>(50);

  // Helper to retrieve logged in user ID or email
  const getUserId = () => {
    if (typeof window === "undefined") return undefined;
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        return u.id || u.email;
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  };

  // Load latest calculation from backend on mount
  useEffect(() => {
    async function fetchLatest() {
      try {
        const uid = getUserId();
        const url = uid ? `/api/calculator/latest?userId=${encodeURIComponent(uid)}` : "/api/calculator/latest";
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.calculation) {
          const calc = data.calculation;
          setCalculationId(calc.id);
          if (calc.transportEmission !== null && calc.transportEmission !== undefined) {
            setTransportFootprint(calc.transportEmission);
          }
          if (calc.foodEmission !== null && calc.foodEmission !== undefined) {
            setFoodFootprint(calc.foodEmission);
          }
          if (calc.totalEmission !== null && calc.totalEmission !== undefined) {
            setTotalFootprint(calc.totalEmission);
          }

          if (calc.transportData) {
            const td = calc.transportData;
            if (td.fromLocation) setFromLocation(td.fromLocation);
            if (td.toLocation) setToLocation(td.toLocation);
            if (td.transportType) setTransportType(td.transportType);
            if (td.fuelType) setFuelType(td.fuelType);
            if (td.distanceKm !== undefined) setDistanceKm(td.distanceKm);
            if (td.tripsPerWeek !== undefined) setTripsPerWeek(td.tripsPerWeek);
          }

          if (calc.foodData) {
            const fd = calc.foodData;
            if (fd.dietType) setDietType(fd.dietType);
            if (fd.mealsPerDay !== undefined) setMealsPerDay(fd.mealsPerDay);
            if (fd.localFoodPct !== undefined) setLocalFoodPct(fd.localFoodPct);
            if (fd.foodWasteLevel) setFoodWasteLevel(fd.foodWasteLevel);
            if (fd.wasteMgmt) setWasteMgmt(fd.wasteMgmt);
          }
        }
      } catch (err) {
        console.error("Failed to load latest calculation:", err);
      }
    }
    fetchLatest();
  }, []);

  // Calculate live results client-side for smooth UX feedback
  useEffect(() => {
    // 1. Transport Calculation
    let emissionPerKm = 0.192;
    if (transportType === "car") {
      if (fuelType === "Diesel") emissionPerKm = 0.171;
      else if (fuelType === "Hybrid") emissionPerKm = 0.108;
      else if (fuelType === "Electric") emissionPerKm = 0.045;
      else emissionPerKm = 0.192;
    } else if (transportType === "motorbike") {
      if (fuelType === "Electric") emissionPerKm = 0.025;
      else emissionPerKm = 0.103;
    } else if (transportType === "bus") {
      emissionPerKm = 0.089;
    } else if (transportType === "train") {
      emissionPerKm = 0.035;
    } else if (transportType === "bicycle" || transportType === "walking") {
      emissionPerKm = 0.0;
    }

    const monthlyDistanceKm = (distanceKm || 0) * (tripsPerWeek || 0) * 4.33;
    const calcTransport = (monthlyDistanceKm * emissionPerKm) / 1000;
    setTransportFootprint(parseFloat(calcTransport.toFixed(2)));

    // 2. Food Calculation
    let dietBase = 0.20;
    if (dietType === "vegan") dietBase = 0.10;
    else if (dietType === "vegetarian") dietBase = 0.14;
    else if (dietType === "meat-heavy") dietBase = 0.28;

    const mealFactor = (mealsPerDay || 3) / 3.0;
    const localMultiplier = 1.0 - ((localFoodPct || 0) / 100) * 0.20;
    let wasteMultiplier = 1.0;
    if (foodWasteLevel === "medium") wasteMultiplier = 1.15;
    else if (foodWasteLevel === "high") wasteMultiplier = 1.30;

    let wasteMgmtBonus = 0.0;
    if (wasteMgmt === "compost" || wasteMgmt === "recycle") wasteMgmtBonus = -0.02;
    else if (wasteMgmt === "never") wasteMgmtBonus = 0.04;

    const calcFood = Math.max(0.02, (dietBase * mealFactor * localMultiplier * wasteMultiplier) + wasteMgmtBonus);
    setFoodFootprint(parseFloat(calcFood.toFixed(2)));

  }, [
    transportType,
    fuelType,
    distanceKm,
    tripsPerWeek,
    dietType,
    mealsPerDay,
    localFoodPct,
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

  // Auto-dismiss alert messages after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear alert banners
  const clearAlerts = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Clear / Reset Calculator function to start fresh calculation
  const handleClearCalculator = () => {
    clearAlerts();
    setCalculationId(null);
    setIsCompleted(false);

    setFromLocation("");
    setToLocation("");
    setTransportType("car");
    setFuelType("Petrol");
    setDistanceKm(0);
    setTripsPerWeek(0);

    setDietType("mixed");
    setMealsPerDay(0);
    setLocalFoodPct(0);
    setFoodWasteLevel("low");
    setWasteMgmt("recycle");

    setTransportFootprint(0.0);
    setFoodFootprint(0.0);
    setTotalFootprint(0.0);
    setTransportPct(50);
    setFoodPct(50);

    setSuccessMessage("Calculator reset! You can now calculate new footprint data.");
  };

  // Handle Calculate Transport action
  const handleCalculateTransport = async () => {
    clearAlerts();

    if (distanceKm < 0 || tripsPerWeek < 0) {
      setErrorMessage("Distance and trips per week cannot be negative numbers.");
      return;
    }

    try {
      const payload = {
        action: "transport",
        userId: getUserId(),
        calculationId,
        transportData: {
          fromLocation,
          toLocation,
          transportType,
          fuelType,
          distanceKm,
          tripsPerWeek
        }
      };

      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to calculate transport emission.");
        return;
      }

      if (data.success && data.calculation) {
        setCalculationId(data.calculation.id);
        if (data.calculation.transportEmission !== null) {
          setTransportFootprint(data.calculation.transportEmission);
        }
        setSuccessMessage("Transport footprint calculated!");
      }
    } catch (err) {
      console.error("Failed to calculate transport emission:", err);
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  // Handle Calculate Food action
  const handleCalculateFood = async () => {
    clearAlerts();

    if (mealsPerDay < 1 || localFoodPct < 0 || localFoodPct > 100) {
      setErrorMessage("Please enter valid food parameters.");
      return;
    }

    try {
      const payload = {
        action: "food",
        userId: getUserId(),
        calculationId,
        foodData: {
          dietType,
          mealsPerDay,
          localFoodPct,
          foodWasteLevel,
          wasteMgmt
        }
      };

      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to calculate food emission.");
        return;
      }

      if (data.success && data.calculation) {
        setCalculationId(data.calculation.id);
        if (data.calculation.foodEmission !== null) {
          setFoodFootprint(data.calculation.foodEmission);
        }
        setSuccessMessage("Food footprint calculated!");
      }
    } catch (err) {
      console.error("Failed to calculate food emission:", err);
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  // Handle Save Result / Final calculation
  const handleSaveResult = async () => {
    clearAlerts();

    try {
      const payload = {
        action: "complete",
        userId: getUserId(),
        calculationId,
        transportData: {
          fromLocation,
          toLocation,
          transportType,
          fuelType,
          distanceKm,
          tripsPerWeek
        },
        foodData: {
          dietType,
          mealsPerDay,
          localFoodPct,
          foodWasteLevel,
          wasteMgmt
        }
      };

      const res = await fetch("/api/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to save calculation.");
        return;
      }

      if (data.success && data.calculation) {
        setCalculationId(data.calculation.id);
        if (data.calculation.totalEmission !== null) {
          setTotalFootprint(data.calculation.totalEmission);
        }
        setIsCompleted(true);
        setSuccessMessage("Calculation saved successfully to database!");
      }
    } catch (err) {
      console.error("Failed to save carbon calculation result:", err);
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  // Status message & recommendation tip based on total emissions
  const getCarbonTip = () => {
    if (totalFootprint < 1.0) {
      return "Excellent eco-score! Keep up your low-carbon commuting and sustainable diet habits.";
    } else if (totalFootprint <= 2.5) {
      return "Consider carpooling, choosing public transport, or trying plant-based meal options.";
    } else {
      return "Your footprint is higher than average. Switching to public transport or reducing food waste can lower your footprint significantly.";
    }
  };

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
            {transportFootprint > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Transport calculated" />
            )}
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
            {foodFootprint > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Food calculated" />
            )}
          </button>
        </div>

        {/* Small Planet Banner & Clear Calculator Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCalculator}
            className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            title="Clear all calculator inputs and start fresh"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Calculator</span>
          </button>

          <div className="bg-[#dcfce7]/60 border border-emerald-100 text-[#15803d] px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm">
            <span>Every small step helps to save our planet! 🌍</span>
          </div>
        </div>
      </div>

      {/* ALERT BANNERS */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 transition p-1 rounded-lg hover:bg-red-100 cursor-pointer"
            title="Close message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-800 transition p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
            title="Close message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2-COLUMN RESPONSIVE LAYOUT (Single active tab form + Results Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* COLUMN 1: ACTIVE TAB FORM (Transport OR Food & Waste) */}
        {activeTab === "transport" ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px] animate-fadeIn">
            <div className="space-y-4">
              {/* Title & Active Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">1. Transport Footprint</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Calculate emissions from your daily commute</p>
                  </div>
                </div>

                {transportFootprint > 0 && (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Calculated
                  </span>
                )}
              </div>

            {/* Commute Inputs */}
            <div className="space-y-3.5 pt-2">
              {/* From Location */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Start Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="Enter start location..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Destination Location */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="Enter destination..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Distance & Trips per week */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Distance (KM)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">km</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Trips Per Week</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="14"
                      value={tripsPerWeek}
                      onChange={(e) => setTripsPerWeek(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/20 text-emerald-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600">trips</span>
                  </div>
                </div>
              </div>

              {/* Transport Type selector grid */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Transport Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "car", label: "Car", icon: <Car className="w-4 h-4" /> },
                    { id: "motorbike", label: "Motorcycle", icon: <Zap className="w-4 h-4" /> },
                    { id: "bus", label: "Bus", icon: <Users className="w-4 h-4" /> },
                    { id: "train", label: "Train", icon: <Car className="w-4 h-4 text-emerald-600" /> },
                    { id: "bicycle", label: "Bicycle", icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
                    { id: "walking", label: "Walking", icon: <Leaf className="w-4 h-4 text-emerald-600" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTransportType(item.id as any)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 justify-center transition cursor-pointer ${
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

              {/* Fuel Type dropdown (visible when Car or Motorcycle) */}
              {(transportType === "car" || transportType === "motorbike") && (
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Fuel Type</label>
                  <div className="relative">
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition appearance-none"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Zap className="w-3.5 h-3.5 text-gray-400" />
                    </span>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calculate button & did you know box */}
          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={handleCalculateTransport}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Calculate Transport</span>
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
                  Using public transport or walking just twice a week saves over 0.5 tons of CO₂ per year.
                </p>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm border border-emerald-100">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px] animate-fadeIn">
            <div className="space-y-4">
              {/* Title & Active Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">2. Food & Waste Footprint</h3>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Calculate emissions from your diet and waste habits</p>
                  </div>
                </div>

                {foodFootprint > 0 && (
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Calculated
                  </span>
                )}
              </div>

            {/* Form Inputs */}
            <div className="space-y-4 pt-2">
              {/* Diet Type */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-2">Diet Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "vegan", label: "Vegan", icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
                    { id: "vegetarian", label: "Vegetarian", icon: <Leaf className="w-4 h-4" /> },
                    { id: "mixed", label: "Mixed", icon: <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-600/10" /> },
                    { id: "meat-heavy", label: "Meat Heavy", icon: <Zap className="w-4 h-4 text-amber-500" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setDietType(item.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                        dietType === item.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 font-black"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Meals Per Day & Local Food % */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Meals Per Day</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">meals</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Local Food %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={localFoodPct}
                      onChange={(e) => setLocalFoodPct(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">%</span>
                  </div>
                </div>
              </div>

              {/* Food Waste Level */}
              <div>
                <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Food Waste Level</label>
                <div className="relative">
                  <select
                    value={foodWasteLevel}
                    onChange={(e) => setFoodWasteLevel(e.target.value as any)}
                    className="w-full pl-8 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-50 transition appearance-none capitalize"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "recycle", label: "Recycle", icon: <Leaf className="w-4 h-4 text-emerald-600" /> },
                    { id: "compost", label: "Compost", icon: <Leaf className="w-4 h-4 text-emerald-700" /> },
                    { id: "sometimes", label: "Sometimes", icon: <Calendar className="w-4 h-4 text-gray-400" /> },
                    { id: "never", label: "Never", icon: <Trash2 className="w-4 h-4 text-red-400" /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setWasteMgmt(item.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${
                        wasteMgmt === item.id
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 font-black"
                          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {item.icon}
                      <span className="text-[10px]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
            <button
              onClick={handleCalculateFood}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <span>Calculate Food</span>
              <Calculator className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}

        {/* COLUMN 2: YOUR CARBON FOOTPRINT RESULTS */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px]">
          
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Your Carbon Footprint</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Live estimated breakdown</p>
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
                  strokeDashoffset={2 * Math.PI * 68 * (1 - Math.min(1, totalFootprint / 3.0))}
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
                  <span>Calculated Live</span>
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
                    <span>Transport Emission</span>
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
                    <span>Food Emission</span>
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
            {/* Dynamic Tip widget based on real calculation result */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0]/40 p-3.5 rounded-2xl flex items-start gap-2.5">
              <Lightbulb className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-emerald-800">Tip to reduce your footprint</p>
                <p className="text-[9px] text-gray-650 leading-relaxed font-semibold mt-0.5">
                  {getCarbonTip()}
                </p>
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={handleSaveResult}
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-600 font-extrabold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition cursor-pointer shadow-sm"
              >
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
