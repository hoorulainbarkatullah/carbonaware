"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Loader2, X, AlertCircle } from "lucide-react";
import { GeoPoint, searchPlaces, reverseGeocode, formatCoords } from "@/lib/geo";

type Props = {
  label: string;
  placeholder: string;
  value: GeoPoint | null;
  onChange: (point: GeoPoint | null) => void;
  variant: "start" | "destination";
  // Warning set by the parent (e.g. map pick whose name lookup failed)
  externalNotice?: string | null;
};

const GEO_ERRORS: Record<number, string> = {
  1: "Location permission denied. Allow location access in your browser, or search for your area instead.",
  2: "Your current location is unavailable. Please search for your area or pick it on the map.",
  3: "Getting your location timed out. Please try again or search for your area.",
};

export default function LocationPicker({ label, placeholder, value, onChange, variant, externalNotice }: Props) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<GeoPoint[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const dotColor = variant === "start" ? "bg-emerald-500" : "bg-red-500";

  // Keep the text box in sync when the value changes from outside (search pick, map, reset).
  // If the value was cleared because the user is typing, their text no longer matches the old name, so keep it.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) setQuery(value.name);
    else if (query === prevValue?.name) setQuery("");
  }

  const trimmedQuery = query.trim();
  const shouldSearch = open && trimmedQuery.length >= 2 && trimmedQuery !== value?.name;

  // Debounced Peshawar place search
  useEffect(() => {
    if (!shouldSearch) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const found = await searchPlaces(trimmedQuery, controller.signal);
        setResults(found);
        if (found.length === 0) setError("No matching areas found in Peshawar. Try another name or pick on the map.");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults([]);
        setError("Location search is unavailable right now. Check your connection or pick on the map.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setSearching(false);
    };
  }, [shouldSearch, trimmedQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectPoint = (point: GeoPoint) => {
    setError(null);
    setNotice(null);
    setOpen(false);
    setResults([]);
    onChange(point);
  };

  const handleUseCurrentLocation = () => {
    setError(null);
    setNotice(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support location detection. Please search for your area instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const name = await reverseGeocode(lat, lon);
          selectPoint({ name, lat, lon });
        } catch {
          // Coordinates are still valid for routing; only the readable name failed
          selectPoint({ name: formatCoords(lat, lon), lat, lon });
          setNotice("Couldn't find a place name for your location, so coordinates are shown instead.");
        } finally {
          setLocating(false);
        }
      },
      (geoErr) => {
        setLocating(false);
        setError(GEO_ERRORS[geoErr.code] || "Could not get your current location. Please search for your area.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setNotice(null);
    onChange(null);
  };

  const shownNotice = notice || externalNotice;

  return (
    <div ref={wrapperRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="flex items-center gap-1.5 text-[10px] uppercase font-black text-gray-400">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {label}
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hover:text-emerald-700 disabled:opacity-60 transition cursor-pointer"
        >
          {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
          <span>{locating ? "Locating..." : "Use My Current Location"}</span>
        </button>
      </div>

      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={(e) => {
            setOpen(true);
            // Typing over a chosen place replaces it instead of appending to its name
            if (value) e.target.select();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && shouldSearch && results.length > 0) {
              e.preventDefault();
              selectPoint(results[0]);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {searching ? (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          ) : query ? (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-700 cursor-pointer" title="Clear location">
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </span>

        {shouldSearch && results.length > 0 && (
          <ul className="absolute z-[1100] mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg py-1">
            {results.map((r) => (
              <li key={`${r.name}-${r.lat}-${r.lon}`}>
                <button
                  type="button"
                  onClick={() => selectPoint(r)}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{r.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-[10px] font-bold text-red-600 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-px flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && shownNotice && (
        <p className="mt-1.5 text-[10px] font-bold text-amber-600 flex items-start gap-1">
          <AlertCircle className="w-3 h-3 mt-px flex-shrink-0" />
          <span>{shownNotice}</span>
        </p>
      )}
    </div>
  );
}
