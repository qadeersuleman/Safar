"use client";

import { motion } from "framer-motion";
import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  taken: number[];
  selected: number[];
  max: number;
  onToggle: (seat: number) => void;
};

export default function SeatPicker({ total, taken, selected, max, onToggle }: Props) {
  const rows = Math.ceil(total / 4);

  const seat = (n: number) => {
    if (n > total) return <span key={n} className="h-12 w-12" />;
    const isTaken = taken.includes(n);
    const isSel = selected.includes(n);
    const blocked = !isSel && selected.length >= max;
    return (
      <motion.button
        key={n}
        type="button"
        disabled={isTaken}
        aria-pressed={isSel}
        aria-label={`Seat ${n}${isTaken ? " (booked)" : ""}`}
        onClick={() => onToggle(n)}
        whileTap={{ scale: 0.88 }}
        animate={isSel ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-colors",
          isTaken && "cursor-not-allowed border-ink-600 bg-ink-700 text-ink-500 line-through",
          isSel && "border-brand-500 bg-brand-500 text-white shadow-glow",
          !isTaken && !isSel && "border-ink-500 bg-ink-800 text-ink-100 hover:border-brand-500",
          blocked && "opacity-50",
        )}
      >
        {n}
      </motion.button>
    );
  };

  return (
    <div>
      <div className="mx-auto w-full max-w-[320px] rounded-[36px] border-2 border-ink-600 bg-ink-900 px-5 pb-6 pt-4">
        <div className="mb-5 flex items-center justify-between border-b border-dashed border-ink-600 pb-4 text-xs font-semibold text-ink-400">
          <span>FRONT</span>
          <span className="flex items-center gap-1.5">
            <CircleDot className="h-4 w-4 text-brand-400" /> Driver
          </span>
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center justify-between">
              <div className="flex gap-2.5">{[r * 4 + 1, r * 4 + 2].map(seat)}</div>
              <div className="flex gap-2.5">{[r * 4 + 3, r * 4 + 4].map(seat)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink-300">
        <Legend cls="border-ink-500 bg-ink-800" label="Available" />
        <Legend cls="border-brand-500 bg-brand-500" label="Selected" />
        <Legend cls="border-ink-600 bg-ink-700" label="Booked" />
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn("h-4 w-4 rounded-md border-2", cls)} /> {label}
    </span>
  );
}
