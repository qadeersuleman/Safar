"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Stop } from "@/lib/types";
import { cn, formatPKR } from "@/lib/utils";

type Rate = { type: string; rate: number };

export default function FareMatrix({ stops, rates }: { stops: Stop[]; rates: Rate[] }) {
  const [active, setActive] = useState(rates[0]?.type ?? "Standard");
  const rate = rates.find((r) => r.type === active)?.rate ?? 4;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {rates.map((r) => (
          <button
            key={r.type}
            onClick={() => setActive(r.type)}
            className={cn(
              "relative rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
              active === r.type ? "border-brand-500 text-white" : "border-ink-600 text-ink-300 hover:text-white",
            )}
          >
            {active === r.type && (
              <motion.span layoutId="fare-pill" className="absolute inset-0 rounded-full bg-brand-500" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">
              {r.type} · Rs {r.rate}/km
            </span>
          </button>
        ))}
      </div>

      <div className="no-scrollbar card mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-center text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-ink-800 p-3 text-left text-xs uppercase tracking-wider text-ink-400">From \ To</th>
              {stops.map((s) => (
                <th key={s.code} className="p-3 text-xs font-bold uppercase tracking-wider text-brand-300">
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stops.map((a) => (
              <tr key={a.code} className="border-t border-ink-600/60">
                <th className="sticky left-0 whitespace-nowrap bg-ink-800 p-3 text-left font-bold">{a.name}</th>
                {stops.map((b) => (
                  <td key={b.code} className={cn("p-3 font-semibold", a.code === b.code ? "text-ink-600" : "text-ink-100")}>
                    {a.code === b.code ? "—" : formatPKR(Math.abs(a.km - b.km) * rate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
