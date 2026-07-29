export interface TransportInput {
  fromLocation?: string;
  toLocation?: string;
  transportType: "car" | "motorbike" | "bus" | "train" | "bicycle" | "walking";
  fuelType?: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  distanceKm: number;
  tripsPerWeek: number;
}

export interface FoodInput {
  dietType: "vegan" | "vegetarian" | "mixed" | "meat-heavy";
  mealsPerDay: number;
  localFoodPct: number;
  foodWasteLevel: "low" | "medium" | "high";
  wasteMgmt: "recycle" | "compost" | "sometimes" | "never";
}

export function validateTransportInput(input: any): { valid: boolean; error?: string; data?: TransportInput } {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "Invalid transport input" };
  }

  const distanceKm = Number(input.distanceKm ?? input.oneWayDist ?? input.roundTripDist);
  if (isNaN(distanceKm) || distanceKm < 0) {
    return { valid: false, error: "Distance must be a non-negative number" };
  }

  const tripsPerWeek = Number(input.tripsPerWeek ?? (input.frequency === "Daily" ? 7 : input.frequency === "Monthly" ? 1 : 5));
  if (isNaN(tripsPerWeek) || tripsPerWeek < 0) {
    return { valid: false, error: "Trips per week must be a non-negative number" };
  }

  const validTypes = ["car", "motorbike", "bus", "train", "bicycle", "walking"];
  const transportType = (input.transportType || "car").toLowerCase();
  if (!validTypes.includes(transportType)) {
    return { valid: false, error: "Invalid transport type selected" };
  }

  let fuelType = input.fuelType;
  if (transportType === "car" || transportType === "motorbike") {
    const validFuels = ["Petrol", "Diesel", "Hybrid", "Electric"];
    if (!fuelType || !validFuels.includes(fuelType)) {
      fuelType = "Petrol";
    }
  }

  return {
    valid: true,
    data: {
      fromLocation: String(input.fromLocation || "").trim(),
      toLocation: String(input.toLocation || "").trim(),
      transportType: transportType as any,
      fuelType: fuelType as any,
      distanceKm,
      tripsPerWeek,
    },
  };
}

export function validateFoodInput(input: any): { valid: boolean; error?: string; data?: FoodInput } {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "Invalid food input" };
  }

  const validDiets = ["vegan", "vegetarian", "mixed", "meat-heavy"];
  const dietType = (input.dietType || "mixed").toLowerCase();
  if (!validDiets.includes(dietType)) {
    return { valid: false, error: "Invalid diet type selected" };
  }

  const mealsPerDay = Number(input.mealsPerDay ?? 3);
  if (isNaN(mealsPerDay) || mealsPerDay < 1 || mealsPerDay > 10) {
    return { valid: false, error: "Meals per day must be between 1 and 10" };
  }

  const localFoodPct = Number(input.localFoodPct ?? 50);
  if (isNaN(localFoodPct) || localFoodPct < 0 || localFoodPct > 100) {
    return { valid: false, error: "Local food percentage must be between 0 and 100" };
  }

  const validWasteLevels = ["low", "medium", "high"];
  const foodWasteLevel = (input.foodWasteLevel || "low").toLowerCase();
  if (!validWasteLevels.includes(foodWasteLevel)) {
    return { valid: false, error: "Invalid food waste level" };
  }

  const validWasteMgmt = ["recycle", "compost", "sometimes", "never"];
  const wasteMgmt = (input.wasteMgmt || "recycle").toLowerCase();
  if (!validWasteMgmt.includes(wasteMgmt)) {
    return { valid: false, error: "Invalid waste management selection" };
  }

  return {
    valid: true,
    data: {
      dietType: dietType as any,
      mealsPerDay,
      localFoodPct,
      foodWasteLevel: foodWasteLevel as any,
      wasteMgmt: wasteMgmt as any,
    },
  };
}

export function calculateTransportEmission(data: TransportInput): number {
  // Emissions per KM (in kg CO2)
  let emissionPerKm = 0.192; // Petrol car default

  if (data.transportType === "car") {
    if (data.fuelType === "Diesel") emissionPerKm = 0.171;
    else if (data.fuelType === "Hybrid") emissionPerKm = 0.108;
    else if (data.fuelType === "Electric") emissionPerKm = 0.045;
    else emissionPerKm = 0.192; // Petrol
  } else if (data.transportType === "motorbike") {
    if (data.fuelType === "Electric") emissionPerKm = 0.025;
    else emissionPerKm = 0.103;
  } else if (data.transportType === "bus") {
    emissionPerKm = 0.089;
  } else if (data.transportType === "train") {
    emissionPerKm = 0.035;
  } else if (data.transportType === "bicycle" || data.transportType === "walking") {
    emissionPerKm = 0.0;
  }

  // Monthly Distance = distanceKm * tripsPerWeek * 4.33 weeks per month
  const monthlyDistanceKm = data.distanceKm * data.tripsPerWeek * 4.33;
  
  // Convert kg to metric tons per month
  const monthlyTons = (monthlyDistanceKm * emissionPerKm) / 1000;
  return parseFloat(monthlyTons.toFixed(2));
}

export function calculateFoodEmission(data: FoodInput): number {
  // Base monthly footprint by diet type (Tons CO2 / month)
  let dietBase = 0.20; // Mixed diet
  if (data.dietType === "vegan") dietBase = 0.10;
  else if (data.dietType === "vegetarian") dietBase = 0.14;
  else if (data.dietType === "meat-heavy") dietBase = 0.28;

  // Meal frequency factor
  const mealFactor = (data.mealsPerDay / 3.0);

  // Local food reduction (up to 20% reduction if 100% local)
  const localMultiplier = 1.0 - (data.localFoodPct / 100) * 0.20;

  // Waste level multiplier
  let wasteMultiplier = 1.0;
  if (data.foodWasteLevel === "medium") wasteMultiplier = 1.15;
  else if (data.foodWasteLevel === "high") wasteMultiplier = 1.30;

  // Waste management bonus/penalty
  let wasteMgmtBonus = 0.0;
  if (data.wasteMgmt === "compost" || data.wasteMgmt === "recycle") wasteMgmtBonus = -0.02;
  else if (data.wasteMgmt === "never") wasteMgmtBonus = 0.04;

  const totalMonthlyTons = Math.max(0.02, (dietBase * mealFactor * localMultiplier * wasteMultiplier) + wasteMgmtBonus);
  return parseFloat(totalMonthlyTons.toFixed(2));
}
