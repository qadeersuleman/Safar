"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Check, Loader2, Phone, Ticket, User } from "lucide-react";
import SeatPicker from "@/components/booking/SeatPicker";
import FormAlert from "@/components/ui/FormAlert";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatMinutes, formatPKR } from "@/lib/utils";

const MAX_SEATS = 4;

type Props = {
  trip: { id: string; busName: string; busType: string; totalSeats: number };
  from: { id: string; name: string };
  to: { id: string; name: string };
  date: string;
  dep: number;
  arr: number;
  farePerSeat: number;
  taken: number[];
  passenger: { name: string; phone: string } | null;
  demo: boolean;
};

export default function BookingClient({ trip, from, to, date, dep, arr, farePerSeat, taken: initialTaken, passenger, demo }: Props) {
  const router = useRouter();
  const [taken, setTaken] = useState(initialTaken);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const total = selected.length * farePerSeat;

  function toggle(n: number) {
    setError(null);
    setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : s.length >= MAX_SEATS ? s : [...s, n].sort((a, b) => a - b)));
    if (!selected.includes(n) && selected.length >= MAX_SEATS) setError(`You can book up to ${MAX_SEATS} seats at a time.`);
  }

  async function confirm() {
    setError(null);
    if (selected.length === 0) {
      setError("Please select at least one seat.");
      return;
    }
    if (demo) {
      setError("Demo mode: connect Supabase (see README) to confirm real bookings.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("book_tickets", {
      p_trip: trip.id,
      p_date: date,
      p_from: from.id,
      p_to: to.id,
      p_seats: selected,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      // seat map refresh (kisi aur ne seat le li ho sakti hai)
      const { data: t } = await supabase.rpc("get_taken_seats", { p_trip: trip.id, p_date: date });
      if (Array.isArray(t)) {
        setTaken(t as number[]);
        setSelected((s) => s.filter((x) => !(t as number[]).includes(x)));
      }
      return;
    }
    setCode(data as string);
    router.refresh();
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="card p-5 sm:p-8">
          <h2 className="text-xl font-bold">Choose your seats</h2>
          <p className="mb-6 mt-1 text-sm text-ink-300">Tap a seat to select it. Up to {MAX_SEATS} seats per booking.</p>
          <SeatPicker total={trip.totalSeats} taken={taken} selected={selected} max={MAX_SEATS} onToggle={toggle} />
        </div>

        <aside className="card p-5 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Trip summary</h2>
            <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-300">
              {trip.busType}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-300">{trip.busName}</p>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-ink-900 p-4">
            <div>
              <p className="font-display text-lg font-bold">{from.name}</p>
              <p className="text-sm text-ink-400">{formatMinutes(dep)}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-brand-500" />
            <div className="text-right">
              <p className="font-display text-lg font-bold">{to.name}</p>
              <p className="text-sm text-ink-400">{formatMinutes(arr)}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3 text-ink-200">
              <CalendarDays className="h-4 w-4 text-brand-400" /> {formatDate(date)}
            </li>
            {passenger && (
              <>
                <li className="flex items-center gap-3 text-ink-200">
                  <User className="h-4 w-4 text-brand-400" /> {passenger.name || "Passenger"}
                </li>
                {passenger.phone && (
                  <li className="flex items-center gap-3 text-ink-200">
                    <Phone className="h-4 w-4 text-brand-400" /> {passenger.phone}
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="mt-5 border-t border-dashed border-ink-600 pt-5">
            <div className="flex items-center justify-between text-sm text-ink-300">
              <span>Seats</span>
              <span className="flex flex-wrap justify-end gap-1.5">
                <AnimatePresence>
                  {selected.length === 0 && <span className="text-ink-400">None selected</span>}
                  {selected.map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="rounded-lg bg-brand-500 px-2 py-0.5 text-xs font-bold text-white"
                    >
                      {s}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-ink-300">
              <span>Fare per seat</span>
              <span>{formatPKR(farePerSeat)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <motion.span
                key={total}
                initial={{ scale: 1.2, color: "#ff7f2a" }}
                animate={{ scale: 1, color: "#ffffff" }}
                className="font-display text-3xl font-extrabold"
              >
                {formatPKR(total)}
              </motion.span>
            </div>
          </div>

          <div className="mt-5">
            <FormAlert message={error} />
          </div>

          <button onClick={confirm} disabled={loading} className="btn-primary mt-5 w-full">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ticket className="h-5 w-5" />}
            {loading ? "Booking…" : selected.length ? `Confirm ${selected.length} seat${selected.length > 1 ? "s" : ""}` : "Select seats"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-400">Demo project: no online payment is taken. You can cancel from My Tickets.</p>
        </aside>
      </div>

      {/* success overlay */}
      <AnimatePresence>
        {code && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="card w-full max-w-sm p-8 text-center"
            >
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, damping: 12 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/15 text-mint"
              >
                <Check className="h-10 w-10" strokeWidth={3} />
              </motion.span>
              <h2 className="mt-5 text-2xl font-extrabold">Booking confirmed!</h2>
              <p className="mt-2 text-sm text-ink-300">
                {from.name} → {to.name} · {formatDate(date)}
              </p>
              <div className="mt-5 rounded-2xl border border-dashed border-brand-500/50 bg-brand-500/10 py-4">
                <p className="text-xs uppercase tracking-widest text-ink-400">Ticket code</p>
                <p className="font-display text-3xl font-extrabold tracking-widest text-brand-400">{code}</p>
              </div>
              <Link href="/bookings" className="btn-primary mt-6 w-full">
                View my tickets
              </Link>
              <Link href="/" className="mt-3 block text-sm font-semibold text-ink-300 hover:text-white">
                Back to home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
