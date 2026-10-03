"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import LocationPicker from "@/components/calculator/LocationPicker";
import type { MapTarget } from "@/components/calculator/RouteMap";
import { GeoPoint, fetchRoute, reverseGeocode, formatCoords, isSameLocation } from "@/lib/geo";
import { RecCategory, requestRecommendations, writeStoredRecommendations } from "@/lib/aiRecommendations";
import {
  Loader2,
  RefreshCw,
  Route,
  Car,
  Zap,
  Leaf,
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

// Leaflet needs the browser, so the map is only rendered client-side
const RouteMap = dynamic(() => import("@/components/calculator/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-56 sm:h-64 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
      Loading map...
    </div>
  ),
});

type TransportType = "car" | "motorbike" | "bus" | "train" | "bicycle" | "walking";
type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";

// Inputs used by the last successful Calculate (plus its route result)
type TransportSnapshot = {
  start: GeoPoint;
  destination: GeoPoint;
  transportType: TransportType;
  fuelType: FuelType;
  tripsPerWeek: number;
  distanceKm: number;
  path: [number, number][];
};

type FoodSnapshot = {
  dietType: "vegan" | "vegetarian" | "mixed" | "meat-heavy";
  mealsPerDay: number;
  localFoodPct: number;
  foodWasteLevel: "low" | "medium" | "high";
  wasteMgmt: "recycle" | "compost" | "sometimes" | "never";
};

const samePoint = (a: GeoPoint | null, b: GeoPoint | null) => !!a && !!b && a.lat === b.lat && a.lon === b.lon;

export default function CalculatorPage() {
  // Active tab state (for mobile responsive view toggling)
  const [activeTab, setActiveTab] = useState<"transport" | "food">("transport");

  // Calculation Document ID tracking & independent calculation flags
  const [calculationId, setCalculationId] = useState<string | null>(null);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [isTransportCalculated, setIsTransportCalculated] = useState<boolean>(false);
  const [isFoodCalculated, setIsFoodCalculated] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Transport Input States (Start Clean & Empty) ---
  // Start / Destination are picked via search, current location, or the map
  const [startPoint, setStartPoint] = useState<GeoPoint | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<GeoPoint | null>(null);
  const [mapTarget, setMapTarget] = useState<MapTarget>("start");
  const [mapNotice, setMapNotice] = useState<Record<MapTarget, string | null>>({ start: null, destination: null });
  const [transportType, setTransportType] = useState<"car" | "motorbike" | "bus" | "train" | "bicycle" | "walking">("car");
  const [fuelType, setFuelType] = useState<"Petrol" | "Diesel" | "Hybrid" | "Electric">("Petrol");
  const [tripsPerWeek, setTripsPerWeek] = useState<number>(0);

  // --- Food & Waste Input States (Start Clean & Empty) ---
  const [dietType, setDietType] = useState<"vegan" | "vegetarian" | "mixed" | "meat-heavy">("mixed");
  const [mealsPerDay, setMealsPerDay] = useState<number>(0);
  const [localFoodPct, setLocalFoodPct] = useState<number>(0);
  const [foodWasteLevel, setFoodWasteLevel] = useState<"low" | "medium" | "high">("low");
  const [wasteMgmt, setWasteMgmt] = useState<"recycle" | "compost" | "sometimes" | "never">("recycle");

  // --- Calculations ---
  // Results only change when a Calculate button succeeds (no live preview from inputs)
  const [transportFootprint, setTransportFootprint] = useState<number>(0.0);
  const [foodFootprint, setFoodFootprint] = useState<number>(0.0);
  const [totalFootprint, setTotalFootprint] = useState<number>(0.0);

  const [transportPct, setTransportPct] = useState<number>(0);
  const [foodPct, setFoodPct] = useState<number>(0);

  // Snapshots of the inputs used by the last successful Calculate, to detect outdated results
  const [transportSnapshot, setTransportSnapshot] = useState<TransportSnapshot | null>(null);
  const [foodSnapshot, setFoodSnapshot] = useState<FoodSnapshot | null>(null);
  const [isCalculatingTransport, setIsCalculatingTransport] = useState(false);
  const [isCalculatingFood, setIsCalculatingFood] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [recsStatus, setRecsStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [recsCategories, setRecsCategories] = useState<RecCategory[]>([]);

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

  const sameLocation = !!startPoint && !!destinationPoint && isSameLocation(startPoint, destinationPoint);

  // Values from the last calculation (never recomputed from the current, unsubmitted inputs)
  const fromLocation = transportSnapshot?.start.name ?? "";
  const toLocation = transportSnapshot?.destination.name ?? "";
  const distanceKm = transportSnapshot?.distanceKm ?? 0;

  const routeMatchesMarkers =
    !!transportSnapshot &&
    samePoint(transportSnapshot.start, startPoint) &&
    samePoint(transportSnapshot.destination, destinationPoint);
  const routePath = routeMatchesMarkers ? transportSnapshot!.path : null;

  const transportOutdated =
    !!transportSnapshot &&
    (!routeMatchesMarkers ||
      transportSnapshot.transportType !== transportType ||
      transportSnapshot.fuelType !== fuelType ||
      transportSnapshot.tripsPerWeek !== tripsPerWeek);

  const foodOutdated =
    !!foodSnapshot &&
    (foodSnapshot.dietType !== dietType ||
      foodSnapshot.mealsPerDay !== mealsPerDay ||
      foodSnapshot.localFoodPct !== localFoodPct ||
      foodSnapshot.foodWasteLevel !== foodWasteLevel ||
      foodSnapshot.wasteMgmt !== wasteMgmt);

  // Map click / marker drag: use the coordinates immediately, then look up a readable name
  const handleMapPick = async (target: MapTarget, lat: number, lon: number) => {
    const setPoint = target === "start" ? setStartPoint : setDestinationPoint;
    setMapNotice((n) => ({ ...n, [target]: null }));
    setPoint({ name: formatCoords(lat, lon), lat, lon });

    if (target === "start" && !destinationPoint) setMapTarget("destination");

    try {
      const name = await reverseGeocode(lat, lon);
      setPoint((p) => (p && p.lat === lat && p.lon === lon ? { ...p, name } : p));
    } catch {
      setMapNotice((n) => ({ ...n, [target]: "Couldn't find a place name for this point, so coordinates are shown instead." }));
    }
  };

  const handlePickerChange = (target: MapTarget, point: GeoPoint | null) => {
    setMapNotice((n) => ({ ...n, [target]: null }));
    if (target === "start") {
      setStartPoint(point);
      if (point && !destinationPoint) setMapTarget("destination");
    } else {
      setDestinationPoint(point);
    }
  };

  // Basic input validation only – the route is requested when Calculate Transport is clicked
  const routeMessage = (() => {
    if (!startPoint && !destinationPoint) return "Select a start location and a destination, then click Calculate Transport.";
    if (!startPoint) return "Select a start location.";
    if (!destinationPoint) return "Select a destination.";
    if (sameLocation) return "Start and destination are the same. Please choose two different locations.";
    return null;
  })();

  // Sync total emissions and percentages based on calculated categories
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

  // Generate AI recommendations for exactly the categories calculated in this session,
  // based on the calculation just saved. Runs only after a Calculate button succeeds.
  const refreshRecommendations = async (calcId: string, categories: RecCategory[]) => {
    const uid = getUserId();
    setRecsCategories(categories);
    setRecsStatus("generating");
    const base = {
      calculationId: calcId,
      categories,
      summary: "",
      aiModel: "CarbonAware AI",
      totalEmission: 0,
      transportEmission: 0,
      foodEmission: 0,
    };
    writeStoredRecommendations(uid, { ...base, status: "pending", recommendations: [], updatedAt: Date.now() });

    try {
      const data = await requestRecommendations({ userId: uid, calculationId: calcId, categories });
      if (!data.success) throw new Error("Recommendations request was not successful");
      writeStoredRecommendations(uid, {
        ...base,
        status: "ready",
        recommendations: data.recommendations || [],
        summary: data.summary || "",
        aiModel: data.aiModel || "CarbonAware AI",
        totalEmission: data.totalEmission || 0,
        transportEmission: data.transportEmission || 0,
        foodEmission: data.foodEmission || 0,
        updatedAt: Date.now(),
      });
      setRecsStatus("ready");
    } catch (err) {
      console.error("Failed to generate AI recommendations:", err);
      setRecsStatus("error");
    }
  };

  // Clear / Reset Calculator function to start fresh calculation
  const handleClearCalculator = () => {
    clearAlerts();
    setCalculationId(null);
    setHasCalculated(false);
    setIsTransportCalculated(false);
    setIsFoodCalculated(false);
    setIsCompleted(false);

    setStartPoint(null);
    setDestinationPoint(null);
    setMapTarget("start");
    setMapNotice({ start: null, destination: null });
    setTransportType("car");
    setFuelType("Petrol");
    setTripsPerWeek(0);
    setTransportSnapshot(null);
    setRouteError(null);

    setDietType("mixed");
    setMealsPerDay(0);
    setLocalFoodPct(0);
    setFoodWasteLevel("low");
    setWasteMgmt("recycle");
    setFoodSnapshot(null);

    setTransportFootprint(0.0);
    setFoodFootprint(0.0);
    setTotalFootprint(0.0);
    setTransportPct(0);
    setFoodPct(0);
    setRecsStatus("idle");
    setRecsCategories([]);

    setSuccessMessage("Calculator reset! All fields cleared for new input.");
  };

  // Handle Calculate Transport: route distance → emission → recommendations, all on click
  const handleCalculateTransport = async () => {
    clearAlerts();
    if (isCalculatingTransport) return;

    if (routeMessage || !startPoint || !destinationPoint) {
      setErrorMessage(routeMessage || "Please select a start location and a destination.");
      return;
    }
    if (tripsPerWeek <= 0) {
      setErrorMessage("Please enter valid trips per week.");
      return;
    }

    // Freeze the inputs being calculated so later edits mark the result as outdated
    const inputs = { start: startPoint, destination: destinationPoint, transportType, fuelType, tripsPerWeek };
    setIsCalculatingTransport(true);
    setRouteError(null);

    try {
      let route;
      try {
        route = await fetchRoute(inputs.start, inputs.destination, inputs.transportType);
      } catch (err) {
        console.error("Route calculation failed:", err);
        setRouteError("Couldn't calculate the road distance. Check your connection and try again, or adjust the locations.");
        return;
      }

      const payload = {
        action: "transport",
        userId: getUserId(),
        calculationId,
        transportData: {
          fromLocation: inputs.start.name,
          toLocation: inputs.destination.name,
          transportType: inputs.transportType,
          fuelType: inputs.fuelType,
          distanceKm: route.distanceKm,
          tripsPerWeek: inputs.tripsPerWeek
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
        setTransportSnapshot({ ...inputs, distanceKm: route.distanceKm, path: route.path });
        setHasCalculated(true);
        setIsTransportCalculated(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userUpdated"));
        }
        setSuccessMessage("Transport footprint calculated & recorded independently!");
        refreshRecommendations(data.calculation.id, isFoodCalculated ? ["Transport", "Food"] : ["Transport"]);
      }
    } catch (err) {
      console.error("Failed to calculate transport emission:", err);
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsCalculatingTransport(false);
    }
  };

  // Handle Calculate Food action
  const handleCalculateFood = async () => {
    clearAlerts();
    if (isCalculatingFood) return;

    if (mealsPerDay < 1 || localFoodPct < 0 || localFoodPct > 100) {
      setErrorMessage("Please enter valid food parameters.");
      return;
    }

    const inputs: FoodSnapshot = { dietType, mealsPerDay, localFoodPct, foodWasteLevel, wasteMgmt };
    setIsCalculatingFood(true);

    try {
      const payload = {
        action: "food",
        userId: getUserId(),
        calculationId,
        foodData: inputs
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
        setFoodSnapshot(inputs);
        setHasCalculated(true);
        setIsFoodCalculated(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userUpdated"));
        }
        setSuccessMessage("Food footprint calculated & recorded independently!");
        refreshRecommendations(data.calculation.id, isTransportCalculated ? ["Transport", "Food"] : ["Food"]);
      }
    } catch (err) {
      console.error("Failed to calculate food emission:", err);
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsCalculatingFood(false);
    }
  };

  // Handle Save Result / Final calculation – saves the values from the last Calculate, not unsubmitted edits
  const handleSaveResult = async () => {
    clearAlerts();

    if (!transportSnapshot && !foodSnapshot) {
      setErrorMessage("Please calculate your transport or food footprint before saving.");
      return;
    }
    if (transportOutdated || foodOutdated) {
      setErrorMessage("Your inputs changed since the last calculation. Click Calculate again before saving.");
      return;
    }

    try {
      const payload = {
        action: "complete",
        userId: getUserId(),
        calculationId,
        ...(transportSnapshot
          ? {
              transportData: {
                fromLocation,
                toLocation,
                transportType: transportSnapshot.transportType,
                fuelType: transportSnapshot.fuelType,
                distanceKm,
                tripsPerWeek: transportSnapshot.tripsPerWeek
              }
            }
          : {}),
        ...(foodSnapshot ? { foodData: foodSnapshot } : {})
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
        setHasCalculated(true);
        setIsCompleted(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userUpdated"));
        }
        setSuccessMessage("Calculation saved successfully to your Dashboard!");
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
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === "transport"
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
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${activeTab === "food"
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
                <LocationPicker
                  label="Start Location"
                  placeholder="Search a Peshawar area, e.g. Hayatabad..."
                  variant="start"
                  value={startPoint}
                  onChange={(p) => handlePickerChange("start", p)}
                  externalNotice={mapNotice.start}
                />

                {/* Destination Location */}
                <LocationPicker
                  label="Destination"
                  placeholder="Search a Peshawar area, e.g. Saddar..."
                  variant="destination"
                  value={destinationPoint}
                  onChange={(p) => handlePickerChange("destination", p)}
                  externalNotice={mapNotice.destination}
                />

                {/* Map selection */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label className="block text-[10px] uppercase font-black text-gray-400">Or Pick On Map</label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                      {([
                        { id: "start", label: "Set Start", dot: "bg-emerald-500" },
                        { id: "destination", label: "Set Destination", dot: "bg-red-500" },
                      ] as const).map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setMapTarget(t.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black transition cursor-pointer ${
                            mapTarget === t.id ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-700"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <RouteMap
                    start={startPoint}
                    destination={destinationPoint}
                    path={routePath}
                    activeTarget={mapTarget}
                    onPick={handleMapPick}
                  />
                  <p className="mt-1.5 text-[10px] font-semibold text-gray-400">
                    Tap the map to place the {mapTarget === "start" ? "Start (A)" : "Destination (B)"} marker. Drag markers to adjust.
                  </p>
                </div>

                {/* Distance & Trips per week */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5">Distance (KM) · Auto</label>
                    <div className="relative">
                      <div className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-800 flex items-center gap-1.5 min-h-[38px]">
                        {isCalculatingTransport ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                            <span className="text-gray-400">Calculating...</span>
                          </>
                        ) : transportSnapshot ? (
                          <>
                            <Route className={`w-3.5 h-3.5 ${transportOutdated ? "text-amber-500" : "text-emerald-600"}`} />
                            <span className={transportOutdated ? "text-gray-400 line-through" : ""}>{distanceKm.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
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

                {/* Route status (one-way road distance per trip) */}
                {routeError ? (
                  <div className="text-[10px] font-bold flex items-start justify-between gap-2 text-red-600">
                    <span className="flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-px flex-shrink-0" />
                      <span>{routeError}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCalculateTransport}
                      className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-black whitespace-nowrap cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                ) : routeMessage ? (
                  <div className={`text-[10px] font-bold flex items-start gap-1 ${sameLocation ? "text-red-600" : "text-gray-400"}`}>
                    <AlertCircle className="w-3 h-3 mt-px flex-shrink-0" />
                    <span>{routeMessage}</span>
                  </div>
                ) : transportOutdated ? (
                  <p className="text-[10px] font-bold text-amber-600 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-px flex-shrink-0" />
                    <span>Inputs changed since the last calculation. Click Calculate Transport to update the distance and results.</span>
                  </p>
                ) : transportSnapshot ? (
                  <p className="text-[10px] font-semibold text-gray-400">
                    One-way road distance per trip, calculated from the selected route.
                  </p>
                ) : (
                  <p className="text-[10px] font-semibold text-gray-400">
                    The road distance is calculated when you click Calculate Transport.
                  </p>
                )}

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
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 justify-center transition cursor-pointer ${transportType === item.id
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
                disabled={isCalculatingTransport}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-70 disabled:cursor-wait"
              >
                <span>{isCalculatingTransport ? "Calculating..." : "Calculate Transport"}</span>
                {isCalculatingTransport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
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
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${dietType === item.id
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
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition cursor-pointer ${wasteMgmt === item.id
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
                disabled={isCalculatingFood}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-70 disabled:cursor-wait"
              >
                <span>{isCalculatingFood ? "Calculating..." : "Calculate Food"}</span>
                {isCalculatingFood ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* COLUMN 2: YOUR CARBON FOOTPRINT RESULTS */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col justify-between min-h-[580px]">

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Your Carbon Footprint</h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Updated when you click Calculate</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-52 h-52 sm:w-56 sm:h-56 mx-auto flex items-center justify-center my-2">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="82"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 82}
                  strokeDashoffset={2 * Math.PI * 82 * (1 - Math.min(1, totalFootprint / 3.0))}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">Total Footprint</span>
                <span className="text-3xl sm:text-4xl font-black text-gray-900 leading-none mt-1">{totalFootprint.toFixed(2)}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">tons CO₂ / month</span>

                {/* Independent calculation status pill */}
                <div className="mt-3 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[9px] font-black border border-emerald-100/80 shadow-2xs">
                  <TrendingDown className="w-3 h-3 text-emerald-700" />
                  <span>
                    {isTransportCalculated && isFoodCalculated
                      ? "Both Categories Calculated 🌿"
                      : isTransportCalculated
                      ? "Transport Calculated Individually 🚗"
                      : isFoodCalculated
                      ? "Food Calculated Individually 🍲"
                      : "Not Calculated Yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Breakdown list */}
            <div className="space-y-3">
              {/* Transport progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>Transport Emission</span>
                    {transportOutdated ? (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Inputs changed – click Calculate Transport to update">
                        Outdated
                      </span>
                    ) : isTransportCalculated && (
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Recorded
                      </span>
                    )}
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
                    <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                    <span>Food Emission</span>
                    {foodOutdated ? (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Inputs changed – click Calculate Food to update">
                        Outdated
                      </span>
                    ) : isFoodCalculated && (
                      <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Recorded
                      </span>
                    )}
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
                className="flex items-center justify-center gap-2 bg-emerald-650 hover:bg-emerald-700 hover:text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md hover:shadow-lg transition cursor-pointer text-center"
              >
                <span>Recommendations</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* AI recommendation status – generated only after a successful Calculate */}
            {recsStatus !== "idle" && (
              <p
                className={`text-[10px] font-bold flex items-center gap-1.5 ${
                  recsStatus === "error" ? "text-red-600" : recsStatus === "ready" ? "text-emerald-700" : "text-gray-400"
                }`}
              >
                {recsStatus === "generating" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : recsStatus === "error" ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span>
                  {recsStatus === "generating"
                    ? `Generating ${recsCategories.join(" & ")} AI recommendations...`
                    : recsStatus === "ready"
                      ? `AI recommendations updated for ${recsCategories.join(" & ")}.`
                      : "Couldn't generate AI recommendations. Click Calculate again to retry."}
                </span>
              </p>
            )}
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
