// Shared client helpers for AI recommendations.
// The calculator generates recommendations right after a successful Calculate and stores them here,
// so the Recommendations page shows that result instead of regenerating on every visit.

export type RecCategory = "Transport" | "Food";

export interface StoredRecommendations {
  calculationId: string | null;
  categories: RecCategory[];
  // "pending" = Calculate succeeded but generation didn't finish (e.g. user navigated away)
  status: "pending" | "ready";
  recommendations: any[];
  summary: string;
  aiModel: string;
  totalEmission: number;
  transportEmission: number;
  foodEmission: number;
  updatedAt: number;
}

const storageKey = (userId: string) => `carbonaware:ai-recs:${userId}`;

export function readStoredRecommendations(userId: string | undefined): StoredRecommendations | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as StoredRecommendations) : null;
  } catch {
    return null;
  }
}

export function writeStoredRecommendations(userId: string | undefined, data: StoredRecommendations) {
  if (!userId || typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode / quota) – recommendations still show for this page view
  }
}

export async function requestRecommendations(params: {
  userId: string | undefined;
  calculationId?: string | null;
  categories?: RecCategory[];
  excludeTitles?: string[];
}) {
  const res = await fetch("/api/ai/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "generate", ...params }),
  });
  if (!res.ok) throw new Error(`Recommendations request failed (${res.status})`);
  return res.json();
}
