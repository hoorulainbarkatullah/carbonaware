"use client";

// Leaflet touches `window`, so this component must be loaded with next/dynamic({ ssr: false })
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GeoPoint, PESHAWAR_CENTER } from "@/lib/geo";

export type MapTarget = "start" | "destination";

type Props = {
  start: GeoPoint | null;
  destination: GeoPoint | null;
  path: [number, number][] | null;
  activeTarget: MapTarget;
  onPick: (target: MapTarget, lat: number, lon: number) => void;
};

const pinIcon = (target: MapTarget) =>
  L.divIcon({
    className: "",
    html: `<div class="w-7 h-7 rounded-full border-[3px] border-white shadow-md flex items-center justify-center text-[11px] font-black text-white ${
      target === "start" ? "bg-emerald-600" : "bg-red-500"
    }">${target === "start" ? "A" : "B"}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

export default function RouteMap({ start, destination, path, activeTarget, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<MapTarget, L.Marker | null>>({ start: null, destination: null });
  const routeRef = useRef<L.Polyline | null>(null);

  // Latest props for Leaflet event handlers registered once
  const onPickRef = useRef(onPick);
  const activeRef = useRef(activeTarget);
  useEffect(() => {
    onPickRef.current = onPick;
    activeRef.current = activeTarget;
  }, [onPick, activeTarget]);

  // Create the map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { center: PESHAWAR_CENTER, zoom: 12 });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onPickRef.current(activeRef.current, e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = { start: null, destination: null };
      routeRef.current = null;
    };
  }, []);

  // Sync draggable Start (A) / Destination (B) markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sync = (target: MapTarget, point: GeoPoint | null) => {
      const existing = markersRef.current[target];
      if (!point) {
        existing?.remove();
        markersRef.current[target] = null;
        return;
      }
      if (existing) {
        existing.setLatLng([point.lat, point.lon]);
        existing.setTooltipContent(point.name);
        return;
      }
      const marker = L.marker([point.lat, point.lon], { icon: pinIcon(target), draggable: true })
        .bindTooltip(point.name, { direction: "top", offset: [0, -14] })
        .addTo(map);
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onPickRef.current(target, lat, lng);
      });
      markersRef.current[target] = marker;
    };

    sync("start", start);
    sync("destination", destination);
  }, [start, destination]);

  // Draw the route line and keep both locations in view
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    routeRef.current?.remove();
    routeRef.current = null;

    if (path && path.length > 1) {
      routeRef.current = L.polyline(path, { color: "#16a34a", weight: 5, opacity: 0.85 }).addTo(map);
      map.fitBounds(routeRef.current.getBounds(), { padding: [30, 30] });
    } else if (start && destination) {
      map.fitBounds(L.latLngBounds([start.lat, start.lon], [destination.lat, destination.lon]), { padding: [30, 30] });
    } else if (start || destination) {
      const p = (start || destination)!;
      map.setView([p.lat, p.lon], Math.max(map.getZoom(), 13));
    }
  }, [path, start, destination]);

  return (
    <div className="isolate relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-gray-200">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
