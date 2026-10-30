"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Armchair, Clock, Snowflake, Crown, Bus } from "lucide-react";
import type { BusType } from "@/lib/types";
import { cn, formatDuration, formatMinutes, formatPKR } from "@/lib/utils";

export type TripRow = {
  id: string;
  busName: string;
  busType: BusType;
  dep: number;
  arr: number;
  duration: number;
  fare: number;
  seatsLeft: number;
  href: string;
};

const typeStyle: Record<BusType, { icon: typeof Bus; cls: string }> = {
  Standard: { icon: Bus, cls: "border-ink-500 bg-ink-700 text-ink-200" },
  AC: { icon: Snowflake, cls: "border-sky/40 bg-sky/10 text-sky" },
  Business: { icon: Crown, cls: "border-brand-500/50 bg-brand-500/15 text-brand-300" },
};

export default function TripCard({ trip, index, from, to }: { trip: TripRow; index: number; from: string; to: string }) {
  const { icon: Icon, cls } = typeStyle[trip.busType];
  const soldOut = trip.seatsLeft <= 0;
  const low = trip.seatsLeft > 0 && trip.seatsLeft <= 8;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="card overflow-hidden p-5 transition-colors hover:border-brand-500/50 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border", cls)}>
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-bold leading-tight">{trip.busName}</h3>
            <span className={cn("mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider", cls)}>
              {trip.busType}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-extrabold text-brand-400 sm:text-3xl">{formatPKR(trip.fare)}</p>
          <p className="text-xs text-ink-400">per seat</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
        <div>
          <p className="font-display text-xl font-bold sm:text-2xl">{formatMinutes(trip.dep)}</p>
          <p className="text-sm text-ink-400">{from}</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-300">
            <Clock className="h-3.5 w-3.5" /> {formatDuration(trip.duration)}
          </span>
          <div className="relative h-[2px] w-full bg-ink-600">
            <span className="absolute -left-0.5 -top-[3px] h-2 w-2 rounded-full bg-brand-500" />
            <motion.span
              className="absolute -top-[5px] h-3 w-3 rounded-full bg-brand-400 shadow-glow"
              initial={{ left: "0%" }}
              animate={{ left: "96%" }}
              transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut" }}
            />
            <span className="absolute -right-0.5 -top-[3px] h-2 w-2 rounded-full bg-brand-500" />
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold sm:text-2xl">{formatMinutes(trip.arr)}</p>
          <p className="text-sm text-ink-400">{to}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-ink-600 pt-5">
        <p className={cn("flex items-center gap-2 text-sm font-semibold", soldOut ? "text-red-400" : low ? "text-brand-300" : "text-mint")}>
          <Armchair className="h-4 w-4" />
          {soldOut ? "Sold out" : `${trip.seatsLeft} seats left`}
        </p>
        {soldOut ? (
          <span className="btn-ghost btn-sm pointer-events-none opacity-50">Unavailable</span>
        ) : (
          <Link href={trip.href} className="btn-primary btn-sm w-full sm:w-auto">
            Select seats <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
