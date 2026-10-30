"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Radio } from "lucide-react";
import BykeaRidePanel from "@/components/tracking/BykeaRidePanel";
import TrackingMap from "@/components/tracking/TrackingMap";
import {
  Coordinates,
  INITIAL_BUSES,
  StationStop,
  TRACKING_STATIONS,
  TrackedBus,
  getCoordinateAtProgress,
} from "@/lib/tracking-data";

function TrackPageContent() {
  const searchParams = useSearchParams();
  const busQuery = searchParams.get("bus");

  const [buses, setBuses] = useState<TrackedBus[]>(INITIAL_BUSES);
  const [activeBusId, setActiveBusId] = useState<string>(busQuery || INITIAL_BUSES[0].id);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<StationStop | null>(null);
  const [centerTarget, setCenterTarget] = useState<{ type: "bus" | "user"; timestamp: number } | null>(null);

  const activeBus = buses.find((b) => b.id === activeBusId) || buses[0];

  // Request & Watch Real-Time User GPS Location (Like Bykea / Uber)
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGpsActive(true);
        setGpsError(null);
      },
      (err) => {
        // Fallback default: Sukkur terminal
        setGpsError(err.message || "Location access denied");
        setIsGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Real-Time Bus Movement Simulation Loop (Advances buses along highway)
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          let nextProgress = bus.progressPercent;
          const step = (bus.speedKmh / 3600) * 2 * 0.8; // progress step per tick

          if (bus.direction === "outbound") {
            nextProgress = bus.progressPercent + step;
            if (nextProgress >= 100) nextProgress = 0; // loops back to Sukkur
          } else {
            nextProgress = bus.progressPercent - step;
            if (nextProgress <= 0) nextProgress = 100; // loops back to Obauro
          }

          const newCoords = getCoordinateAtProgress(nextProgress);

          // Calculate next stop based on progress
          let nextStop = "Obauro";
          if (nextProgress < 25) nextStop = "Pano Aqil";
          else if (nextProgress < 55) nextStop = "Ghotki";
          else if (nextProgress < 75) nextStop = "Mirpur Mathelo";
          else if (nextProgress < 90) nextStop = "Daharki";

          return {
            ...bus,
            progressPercent: nextProgress,
            currentCoords: newCoords,
            nextStopName: nextStop,
          };
        }),
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-ink-950 p-2 sm:p-4 md:p-6">
      {/* Top Floating Header */}
      <div className="container-x mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-ink-900 text-white transition hover:border-brand-500 hover:bg-ink-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-display text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              <span>SafarGo Live Radar</span>
              <span className="flex items-center gap-1 rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-semibold text-brand-300">
                <Radio className="h-3 w-3 animate-pulse text-brand-400" /> Bykea Style
              </span>
            </h1>
            <p className="text-xs text-ink-300">
              Sindh N-5 Corridor • Real-time Bus & User Location Tracking
            </p>
          </div>
        </div>

        {/* GPS Live Status Indicator */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/90 px-3 py-1.5 text-xs text-white backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isGpsActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
              }`}
            />
            <span className="font-semibold">
              {isGpsActive ? "GPS Active (Live)" : "GPS Standby (Using Station)"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Bykea Bottom/Side Sheet */}
      <div className="container-x relative grid grid-cols-1 lg:grid-cols-12 gap-4 h-[78vh] sm:h-[82vh]">
        {/* Interactive Map (Takes 7 cols on desktop, full height on mobile) */}
        <div className="relative lg:col-span-7 xl:col-span-8 h-[48%] lg:h-full w-full">
          <TrackingMap
            buses={buses}
            activeBus={activeBus}
            onSelectBus={(bus) => setActiveBusId(bus.id)}
            userCoords={userCoords}
            stations={TRACKING_STATIONS}
            selectedStation={selectedStation}
            centerTarget={centerTarget}
          />
        </div>

        {/* Bykea / Uber Style Live Telemetry & Captain Panel */}
        <div className="lg:col-span-5 xl:col-span-4 h-[52%] lg:h-full overflow-y-auto no-scrollbar">
          <BykeaRidePanel
            activeBus={activeBus}
            allBuses={buses}
            onSelectBus={(bus) => {
              setActiveBusId(bus.id);
              setCenterTarget({ type: "bus", timestamp: Date.now() });
            }}
            userCoords={userCoords}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            stations={TRACKING_STATIONS}
            onCenterBus={() => setCenterTarget({ type: "bus", timestamp: Date.now() })}
            onCenterUser={() => setCenterTarget({ type: "user", timestamp: Date.now() })}
            isGpsActive={isGpsActive}
          />
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center bg-ink-950">
          <div className="flex items-center gap-3 text-brand-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-display font-semibold text-white">Loading SafarGo Live Radar...</span>
          </div>
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
