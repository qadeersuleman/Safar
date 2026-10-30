"use client";

import { useEffect, useRef, useState } from "react";
import { Bus, Compass, MapPin, Navigation2, RefreshCw } from "lucide-react";
import {
  Coordinates,
  HIGHWAY_POLYLINE,
  StationStop,
  TRACKING_STATIONS,
  TrackedBus,
} from "@/lib/tracking-data";

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: any;
  }
}

// Uber / Bykea Dark Map Styling for Google Maps
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#101014" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#101014" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3f4f6" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1f2128" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#16181e" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#373b47" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#22252e" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#242731" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0a0d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3e4352" }],
  },
];

type Props = {
  buses: TrackedBus[];
  activeBus: TrackedBus;
  onSelectBus: (bus: TrackedBus) => void;
  userCoords: Coordinates | null;
  stations: StationStop[];
  selectedStation: StationStop | null;
  centerTarget: { type: "bus" | "user"; timestamp: number } | null;
};

export default function TrackingMap({
  buses,
  activeBus,
  onSelectBus,
  userCoords,
  stations,
  selectedStation,
  centerTarget,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapEngine, setMapEngine] = useState<"google" | "vector">("google");
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // References to keep Google Maps objects
  const mapInstanceRef = useRef<any>(null);
  const busMarkersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const beamPolylineRef = useRef<any>(null);
  const stationMarkersRef = useRef<any[]>([]);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      "";

    if (!apiKey) {
      setMapEngine("vector");
      return;
    }

    if (window.google?.maps) {
      setGoogleLoaded(true);
      return;
    }

    // Check if script is already present
    const existing = document.getElementById("google-maps-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      script.onerror = () => setMapEngine("vector");
      document.head.appendChild(script);
    } else {
      existing.addEventListener("load", () => setGoogleLoaded(true));
      existing.addEventListener("error", () => setMapEngine("vector"));
    }

    // Global error listener for Google Maps auth issues
    (window as any).gm_authFailure = () => {
      setMapEngine("vector");
    };
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (mapEngine !== "google" || !googleLoaded || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    try {
      const center = activeBus.currentCoords || { lat: 27.95, lng: 69.3 };
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 10,
        styles: DARK_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Draw highway route polyline
      routePolylineRef.current = new window.google.maps.Polyline({
        path: HIGHWAY_POLYLINE,
        geodesic: true,
        strokeColor: "#ff6a00",
        strokeOpacity: 0.85,
        strokeWeight: 5,
        map,
      });

      // Draw dashed beam between active bus and user
      beamPolylineRef.current = new window.google.maps.Polyline({
        path: [activeBus.currentCoords, userCoords || activeBus.currentCoords],
        strokeColor: "#38bdf8",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map,
      });

      // Add Station Markers
      stations.forEach((st) => {
        const marker = new window.google.maps.Marker({
          position: st.coords,
          map,
          title: `${st.name} Station (${st.km} km)`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "#ffd9b3",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ff6a00",
          },
        });
        stationMarkersRef.current.push(marker);
      });
    } catch (e) {
      setMapEngine("vector");
    }
  }, [googleLoaded, mapEngine, stations]);

  // Update Markers when activeBus, buses or userCoords change
  useEffect(() => {
    if (mapEngine !== "google" || !mapInstanceRef.current || !window.google?.maps) return;

    const map = mapInstanceRef.current;

    // 1. Update User Marker
    if (userCoords) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new window.google.maps.Marker({
          position: userCoords,
          map,
          title: "Aapki Live Location (You are here)",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#38bdf8",
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: "#ffffff",
          },
        });
      } else {
        userMarkerRef.current.setPosition(userCoords);
      }
    }

    // 2. Update Beam line from active bus to user/target
    if (beamPolylineRef.current) {
      const target = userCoords || stations[0].coords;
      beamPolylineRef.current.setPath([activeBus.currentCoords, target]);
    }

    // 3. Update Bus Markers
    buses.forEach((bus) => {
      const isActive = bus.id === activeBus.id;
      let marker = busMarkersRef.current.get(bus.id);

      if (!marker) {
        marker = new window.google.maps.Marker({
          position: bus.currentCoords,
          map,
          title: `${bus.name} (${bus.code})`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: isActive ? 6 : 4.5,
            fillColor: isActive ? "#ff6a00" : "#a1a1aa",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            rotation: bus.direction === "outbound" ? 45 : 225,
          },
        });

        marker.addListener("click", () => onSelectBus(bus));
        busMarkersRef.current.set(bus.id, marker);
      } else {
        marker.setPosition(bus.currentCoords);
        marker.setIcon({
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: isActive ? 6.5 : 4.5,
          fillColor: isActive ? "#ff6a00" : "#71717a",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
          rotation: bus.direction === "outbound" ? 45 : 225,
        });
      }
    });
  }, [buses, activeBus, userCoords, mapEngine]);

  // Center Target handler
  useEffect(() => {
    if (!centerTarget || !mapInstanceRef.current) return;
    if (centerTarget.type === "bus") {
      mapInstanceRef.current.panTo(activeBus.currentCoords);
      mapInstanceRef.current.setZoom(12);
    } else if (centerTarget.type === "user" && userCoords) {
      mapInstanceRef.current.panTo(userCoords);
      mapInstanceRef.current.setZoom(13);
    }
  }, [centerTarget, activeBus, userCoords]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-ink-950 shadow-2xl">
      {/* Google Map Div */}
      <div
        ref={mapContainerRef}
        className={`h-full w-full ${mapEngine === "google" ? "block" : "hidden"}`}
      />

      {/* High-Definition Interactive Vector Radar Map (Fallback & Offline Mode) */}
      {mapEngine === "vector" && (
        <VectorRadarMap
          buses={buses}
          activeBus={activeBus}
          onSelectBus={onSelectBus}
          userCoords={userCoords}
          stations={stations}
          selectedStation={selectedStation}
        />
      )}

      {/* Floating Status & Map Mode Toggle */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/85 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl shadow-lg">
        <span className="flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span>{mapEngine === "google" ? "Google Maps Live" : "SafarGo Radar Map"}</span>
        <button
          onClick={() => setMapEngine((m) => (m === "google" ? "vector" : "google"))}
          className="ml-2 rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-ink-300 transition hover:bg-white/20 hover:text-white"
        >
          Switch to {mapEngine === "google" ? "Radar View" : "Google Map"}
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/85 px-3 py-2 text-[11px] text-ink-200 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-500 shadow-glow" />
          <span>Active Bus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky" />
          <span>You (Live GPS)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full border border-sand bg-sand" />
          <span>Stations</span>
        </div>
      </div>
    </div>
  );
}

// Interactive Vector Canvas Radar Map Component
function VectorRadarMap({
  buses,
  activeBus,
  onSelectBus,
  userCoords,
  stations,
  selectedStation,
}: {
  buses: TrackedBus[];
  activeBus: TrackedBus;
  onSelectBus: (bus: TrackedBus) => void;
  userCoords: Coordinates | null;
  stations: StationStop[];
  selectedStation: StationStop | null;
}) {
  // Normalize coordinates into percentage SVG canvas coordinates (lat: 27.65 -> 28.25, lng: 68.8 -> 69.8)
  const minLat = 27.65;
  const maxLat = 28.25;
  const minLng = 68.8;
  const maxLng = 69.8;

  function toSvgCoords(c: Coordinates) {
    const x = ((c.lng - minLng) / (maxLng - minLng)) * 800 + 50;
    const y = (1 - (c.lat - minLat) / (maxLat - minLat)) * 500 + 40;
    return { x, y };
  }

  const polylinePoints = HIGHWAY_POLYLINE.map(toSvgCoords)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const activeBusSvg = toSvgCoords(activeBus.currentCoords);
  const userSvg = userCoords ? toSvgCoords(userCoords) : null;

  return (
    <div className="relative h-full w-full bg-ink-950 flex flex-col items-center justify-center p-4 select-none">
      <svg
        viewBox="0 0 900 580"
        className="h-full w-full max-h-[700px] overflow-visible"
      >
        <defs>
          <radialGradient id="radarPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff6a00" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff6a00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff7f2a" />
            <stop offset="50%" stopColor="#ff6a00" />
            <stop offset="100%" stopColor="#ffa05f" />
          </linearGradient>
        </defs>

        {/* Highway Outline & Glow */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#ff6a00"
          strokeWidth="10"
          strokeOpacity="0.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="url(#roadGlow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dashed Tracking Beam to User */}
        {userSvg && (
          <line
            x1={activeBusSvg.x}
            y1={activeBusSvg.y}
            x2={userSvg.x}
            y2={userSvg.y}
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeOpacity="0.8"
          />
        )}

        {/* Station Stops */}
        {stations.map((st) => {
          const pt = toSvgCoords(st.coords);
          const isSelected = selectedStation?.id === st.id;
          return (
            <g key={st.id} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 8 : 5}
                fill={isSelected ? "#ff6a00" : "#ffffff"}
                stroke="#101014"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fill="#d4d4d8"
                fontSize="12"
                fontWeight="bold"
                className="font-display"
              >
                {st.name}
              </text>
              <text
                x={pt.x}
                y={pt.y + 18}
                textAnchor="middle"
                fill="#71717a"
                fontSize="10"
              >
                {st.km} km
              </text>
            </g>
          );
        })}

        {/* User GPS Pin */}
        {userSvg && (
          <g transform={`translate(${userSvg.x}, ${userSvg.y})`}>
            <circle r="18" fill="#38bdf8" opacity="0.25">
              <animate attributeName="r" values="10;25;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
            <text
              y="-14"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="11"
              fontWeight="bold"
            >
              You (Live GPS)
            </text>
          </g>
        )}

        {/* Buses Pins */}
        {buses.map((bus) => {
          const pt = toSvgCoords(bus.currentCoords);
          const isActive = bus.id === activeBus.id;
          return (
            <g
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              transform={`translate(${pt.x}, ${pt.y})`}
              className="cursor-pointer transition-transform hover:scale-125"
            >
              {isActive && (
                <circle r="22" fill="#ff6a00" opacity="0.3">
                  <animate attributeName="r" values="14;28;14" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <rect
                x="-14"
                y="-14"
                width="28"
                height="28"
                rx="8"
                fill={isActive ? "#ff6a00" : "#2b2b31"}
                stroke="#ffffff"
                strokeWidth={isActive ? "2" : "1"}
              />
              <text
                y="4"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="bold"
              >
                🚌
              </text>
              <text
                y="24"
                textAnchor="middle"
                fill={isActive ? "#ff9a3c" : "#a1a1aa"}
                fontSize="11"
                fontWeight="bold"
              >
                {bus.name}
              </text>
              <text
                y="35"
                textAnchor="middle"
                fill="#71717a"
                fontSize="9"
              >
                {bus.speedKmh} km/h
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
