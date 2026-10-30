"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Search, Ticket, XCircle } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate, formatMinutes, formatPKR, toMinutes, todayPKT } from "@/lib/utils";

export type RawBooking = {
  id: string;
  ticket_code: string;
  travel_date: string;
  seat_no: number;
  fare: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  from: { name: string; km: number } | null;
  to: { name: string; km: number } | null;
  trip: { bus_name: string; bus_type: string; start_time: string; direction: "outbound" | "return" } | null;
};

type Group = {
  code: string;
  date: string;
  status: "confirmed" | "cancelled";
  from: string;
  to: string;
  bus: string;
  type: string;
  dep: number | null;
  seats: number[];
  total: number;
  created: string;
};

function group(rows: RawBooking[], maxKm: number): Group[] {
  const map = new Map<string, Group>();
  for (const r of rows) {
    let g = map.get(r.ticket_code);
    if (!g) {
      let dep: number | null = null;
      if (r.trip && r.from) {
        const off = r.trip.direction === "outbound" ? r.from.km : maxKm - r.from.km;
        dep = toMinutes(r.trip.start_time) + Math.round((off / 50) * 60);
      }
      g = {
        code: r.ticket_code,
        date: r.travel_date,
        status: r.status,
        from: r.from?.name ?? "—",
        to: r.to?.name ?? "—",
        bus: r.trip?.bus_name ?? "Bus",
        type: r.trip?.bus_type ?? "",
        dep,
        seats: [],
        total: 0,
        created: r.created_at,
      };
      map.set(r.ticket_code, g);
    }
    g.seats.push(r.seat_no);
    g.total += r.fare;
  }
  return [...map.values()].map((g) => ({ ...g, seats: g.seats.sort((a, b) => a - b) }));
}

export default function TicketList({ rows, maxKm }: { rows: RawBooking[]; maxKm: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const today = todayPKT();
  const groups = useMemo(() => group(rows, maxKm), [rows, maxKm]);
  const upcoming = groups.filter((g) => g.status === "confirmed" && g.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const history = groups.filter((g) => !(g.status === "confirmed" && g.date >= today)).sort((a, b) => b.date.localeCompare(a.date));
  const list = tab === "upcoming" ? upcoming : history;

  async function cancel(code: string) {
    setBusy(code);
    setError(null);
    const { error } = await createClient().rpc("cancel_tickets", { p_code: code });
    setBusy(null);
    setConfirming(null);
    if (error) setError(error.message);
    else router.refresh();
  }

  return (
    <div>
      <div className="inline-flex rounded-full border border-white/10 bg-ink-800 p-1">
        {(
          [
            ["upcoming", `Upcoming (${upcoming.length})`],
            ["history", `History (${history.length})`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn("relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors", tab === k ? "text-white" : "text-ink-300")}
          >
            {tab === k && (
              <motion.span layoutId="ticket-tab" className="absolute inset-0 rounded-full bg-brand-500" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5">
        <FormAlert message={error} />
      </div>

      {list.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
            <Ticket className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold">{tab === "upcoming" ? "No upcoming trips" : "Nothing here yet"}</h2>
          <p className="mt-2 max-w-sm text-ink-300">Your booked tickets will show up here.</p>
          <Link href="/search" className="btn-primary mt-6">
            <Search className="h-5 w-5" /> Find a bus
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {list.map((g, i) => {
              const cancelled = g.status === "cancelled";
              const canCancel = g.status === "confirmed" && g.date >= today;
              return (
                <motion.article
                  layout
                  key={g.code}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className={cn("card ticket-notch relative overflow-hidden", cancelled && "opacity-60")}
                  style={{ ["--notch-top" as string]: "58%" }}
                >
                  <div className="bg-gradient-to-br from-brand-600/30 to-transparent p-5 sm:p-6">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-brand-300">
                        {g.bus} · {g.type}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1",
                          cancelled ? "bg-red-500/15 text-red-300" : g.date < today ? "bg-ink-600 text-ink-300" : "bg-mint/15 text-mint",
                        )}
                      >
                        {cancelled ? "Cancelled" : g.date < today ? "Completed" : "Confirmed"}
                      </span>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <p className="font-display text-2xl font-extrabold sm:text-3xl">{g.from}</p>
                      <ArrowRight className="h-6 w-6 shrink-0 text-brand-500" />
                      <p className="text-right font-display text-2xl font-extrabold sm:text-3xl">{g.to}</p>
                    </div>
                    <p className="mt-3 text-sm text-ink-300">
                      {formatDate(g.date)}
                      {g.dep !== null && <> · Departs {formatMinutes(g.dep)}</>}
                    </p>
                  </div>

                  <div className="border-t-2 border-dashed border-ink-600 p-5 sm:p-6">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-ink-400">Seats</p>
                        <p className="mt-1 font-bold">{g.seats.join(", ")}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-ink-400">Total</p>
                        <p className="mt-1 font-bold text-brand-400">{formatPKR(g.total)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-ink-400">Code</p>
                        <p className="mt-1 font-display font-bold tracking-wider">{g.code}</p>
                      </div>
                    </div>

                    <div
                      aria-hidden
                      className="mt-5 h-10 rounded-md opacity-80"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg,#f4f4f5 0 2px,transparent 2px 5px,#f4f4f5 5px 6px,transparent 6px 10px,#f4f4f5 10px 13px,transparent 13px 16px)",
                      }}
                    />

                    {canCancel && (
                      <div className="mt-5">
                        {confirming === g.code ? (
                          <div className="flex gap-3">
                            <button onClick={() => cancel(g.code)} disabled={busy === g.code} className="btn btn-sm flex-1 bg-red-500 text-white hover:bg-red-400">
                              {busy === g.code ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, cancel"}
                            </button>
                            <button onClick={() => setConfirming(null)} className="btn-ghost btn-sm flex-1">
                              Keep ticket
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirming(g.code)} className="btn-ghost btn-sm w-full text-red-300 hover:border-red-500/50">
                            <XCircle className="h-4 w-4" /> Cancel ticket
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
