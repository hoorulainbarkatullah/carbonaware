// Client-side helpers for the calculator's location flow.
// Uses free OpenStreetMap-based services (no API key):
//  - Photon (photon.komoot.io): place search (search-as-you-type is allowed) + reverse geocoding
//  - OSRM (routing.openstreetmap.de): road route distance

export interface GeoPoint {
  name: string;
  lat: number;
  lon: number;
}

export interface RouteResult {
  distanceKm: number;
  // [lat, lon] pairs for drawing the route on the map
  path: [number, number][];
}

// Peshawar district bounding box: minLon, minLat, maxLon, maxLat
export const PESHAWAR_BBOX = [71.35, 33.85, 71.8, 34.2] as const;
export const PESHAWAR_CENTER: [number, number] = [34.0151, 71.5249];

const PHOTON_URL = "https://photon.komoot.io";
const OSRM_URL = "https://routing.openstreetmap.de";

// Two points closer than this are treated as the same location
const SAME_LOCATION_METERS = 50;

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties?: Record<string, string | undefined>;
}

function featureToPoint(feature: PhotonFeature): GeoPoint {
  const p = feature.properties || {};
  const [lon, lat] = feature.geometry.coordinates;
  const area = p.district || p.locality || p.suburb;
  const parts = [p.name || p.street, area && area !== p.name ? area : null, p.city || "Peshawar"].filter(Boolean);
  return { name: Array.from(new Set(parts)).join(", "), lat, lon };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeoPoint[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    lang: "en",
    bbox: PESHAWAR_BBOX.join(","),
  });
  const res = await fetch(`${PHOTON_URL}/api/?${params}`, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = await res.json();
  const results: GeoPoint[] = (data.features || []).map(featureToPoint);
  // Drop duplicate labels (e.g. several segments of the same road)
  const seen = new Set<string>();
  return results.filter((r) => (seen.has(r.name) ? false : (seen.add(r.name), true)));
}

export async function reverseGeocode(lat: number, lon: number, signal?: AbortSignal): Promise<string> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), lang: "en" });
  const res = await fetch(`${PHOTON_URL}/reverse?${params}`, { signal });
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.features || data.features.length === 0) throw new Error("No place found");
  return featureToPoint(data.features[0]).name;
}

export function formatCoords(lat: number, lon: number) {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

// Straight-line distance in meters (used only for the "same location" check)
export function haversineMeters(a: GeoPoint, b: GeoPoint) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isSameLocation(a: GeoPoint, b: GeoPoint) {
  return haversineMeters(a, b) < SAME_LOCATION_METERS;
}

// OSRM routing profile for the selected transport mode
export function routingProfile(transportType: string) {
  if (transportType === "walking") return "routed-foot";
  if (transportType === "bicycle") return "routed-bike";
  return "routed-car";
}

export async function fetchRoute(from: GeoPoint, to: GeoPoint, transportType: string, signal?: AbortSignal): Promise<RouteResult> {
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const res = await fetch(
    `${OSRM_URL}/${routingProfile(transportType)}/route/v1/driving/${coords}?overview=full&geometries=geojson`,
    { signal }
  );
  if (!res.ok) throw new Error(`Route request failed (${res.status})`);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("No road route found between these locations");
  }
  const route = data.routes[0];
  return {
    distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
    path: route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]),
  };
}
