"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Navigation,
  Phone,
  Radio,
  Share2,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { StationStop, TrackedBus, calculateDistanceKm, calculateEtaMinutes } from "@/lib/tracking-data";
import { cn } from "@/lib/utils";

type Props = {
  activeBus: TrackedBus;
  allBuses: TrackedBus[];
  onSelectBus: (bus: TrackedBus) => void;
  userCoords: { lat: number; lng: number } | null;
  selectedStation: StationStop | null;
  onSelectStation: (station: StationStop | null) => void;
  stations: StationStop[];
  onCenterBus: () => void;
  onCenterUser: () => void;
  isGpsActive: boolean;
};

export default function BykeaRidePanel({
  activeBus,
  allBuses,
  onSelectBus,
  userCoords,
  selectedStation,
  onSelectStation,
  stations,
  onCenterBus,
  onCenterUser,
  isGpsActive,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Target reference coords: either selected station or user's real GPS coords
  const targetCoords = selectedStation ? selectedStation.coords : userCoords || activeBus.currentCoords;
  const targetName = selectedStation ? selectedStation.name : isGpsActive ? "Aapka Maqaam (Your Live GPS)" : "Sukkur Terminal";

  // Calculate real-time distance and ETA
  const distanceKm = calculateDistanceKm(activeBus.currentCoords, targetCoords);
  const etaMinutes = calculateEtaMinutes(distanceKm, activeBus.speedKmh);

  async function handleShare() {
    const text = `SafarGo Live Tracking: Bus ${activeBus.name} (${activeBus.code}) abhi ${distanceKm} km door hai aur taqreeban ${etaMinutes} mins mein pohnchegi!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SafarGo Live Bus Tracking",
          text,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback
      }
    } else {
      navigator.clipboard?.writeText(`${text} ${window.location.href}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="flex flex-col rounded-3xl border border-white/10 bg-ink-900/95 shadow-2xl backdrop-blur-2xl">
      {/* Bus Switcher Tabs (Bykea / Ride Fleet Switcher) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 p-3 no-scrollbar">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 pl-1">Buses:</span>
        {allBuses.map((bus) => {
          const isSelected = bus.id === activeBus.id;
          return (
            <button
              key={bus.id}
              onClick={() => onSelectBus(bus)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                isSelected
                  ? "bg-brand-500 text-white shadow-glow"
                  : "border border-white/10 bg-white/5 text-ink-300 hover:border-white/20 hover:text-white",
              )}
            >
              <Bus className="h-3.5 w-3.5" />
              <span>{bus.name}</span>
              <span className="rounded bg-black/30 px-1 py-0.5 text-[10px] font-mono">{bus.code}</span>
            </button>
          );
        })}
      </div>

      {/* Main ETA Header (Bykea style) */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                LIVE TRACING
              </span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-ink-300">
                Route: {activeBus.direction === "outbound" ? "Sukkur → Obauro" : "Obauro → Sukkur"}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {etaMinutes} <span className="text-base font-normal text-brand-300">mins mein pohnchegi</span>
              </h2>
            </div>
            <p className="text-xs text-ink-300">
              <span className="font-semibold text-white">{distanceKm} km door</span> • {targetName} tak ka faasla
            </p>
          </div>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-ink-300 hover:text-white sm:hidden"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-semibold text-ink-300">
            <span>Sukkur</span>
            <span className="text-brand-400 font-bold">{activeBus.nextStopName} (Next Stop)</span>
            <span>Obauro</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-1000 ease-out shadow-glow"
              style={{ width: `${Math.max(5, Math.min(100, activeBus.progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Collapsible Content */}
        {!collapsed && (
          <>
            {/* Captain & Vehicle Card (Bykea / Uber Driver Card) */}
            <div className="mt-4 rounded-2xl border border-white/10 bg-ink-950/70 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/20 to-amber-500/10 border border-brand-500/30 text-brand-300">
                    <User className="h-6 w-6" />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <ShieldCheck className="h-3 w-3" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-display text-sm font-bold text-white">{activeBus.captainName}</h4>
                      <span className="flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-bold text-amber-300">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {activeBus.captainRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-300">
                      <span>{activeBus.name} ({activeBus.type})</span>
                      <span>•</span>
                      <span>{activeBus.totalTrips} Safar</span>
                    </div>
                  </div>
                </div>

                {/* Pakistani License Plate Style */}
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-amber-300">SINDH</div>
                  <div className="font-mono text-xs font-bold text-white tracking-widest">{activeBus.plateNumber}</div>
                </div>
              </div>

              {/* Live telemetry row */}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                <div className="flex items-center gap-2 text-ink-300">
                  <Gauge className="h-4 w-4 text-brand-400" />
                  <span>Raftaar: <strong className="text-white">{activeBus.speedKmh} km/h</strong></span>
                </div>
                <div className="flex items-center gap-2 text-ink-300">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Aglee Manzil: <strong className="text-white">{activeBus.nextStopName}</strong></span>
                </div>
              </div>
            </div>

            {/* Target Location / GPS Picker */}
            <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5 text-xs">
              <div className="flex items-center gap-2 truncate text-ink-300">
                <Compass className="h-4 w-4 shrink-0 text-brand-400" />
                <span className="truncate">
                  {selectedStation ? `Stop: ${selectedStation.name}` : isGpsActive ? "📍 Live GPS Se Track Ho Raha Hai" : "📍 Stand by: Sukkur"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSelectStation(null)}
                  className={cn(
                    "rounded-lg px-2 py-1 text-[11px] font-semibold transition",
                    !selectedStation && isGpsActive
                      ? "bg-brand-500 text-white"
                      : "bg-white/10 text-ink-200 hover:bg-white/20",
                  )}
                >
                  My GPS
                </button>
                <select
                  value={selectedStation?.id || ""}
                  onChange={(e) => {
                    const st = stations.find((s) => s.id === e.target.value) || null;
                    onSelectStation(st);
                  }}
                  className="rounded-lg border border-white/15 bg-ink-950 px-2 py-1 text-[11px] text-white outline-none"
                >
                  <option value="">(Select Station)</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.km} km)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons (Call, Share, Center) */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={`tel:${activeBus.captainPhone}`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
              >
                <Phone className="h-4 w-4" />
                <span>Call Captain</span>
              </a>

              <button
                onClick={onCenterBus}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
              >
                <Bus className="h-4 w-4 text-brand-400" />
                <span>Bus Par Jayein</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-amber-400" />}
                <span>{copied ? "Copied!" : "Share Trace"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

