import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, SearchX } from "lucide-react";
import SearchCard from "@/components/search/SearchCard";
import TripCard, { type TripRow } from "@/components/search/TripCard";
import Reveal from "@/components/ui/Reveal";
import { getAvailability, getStops, getTrips } from "@/lib/data";
import { calcFare, directionFor, formatDate, isValidDateString, nowMinutesPKT, todayPKT, tripTimes } from "@/lib/utils";

export const metadata: Metadata = { title: "Search buses" };

type SP = { from?: string; to?: string; date?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const stops = await getStops();
  const from = stops.find((s) => s.code === sp.from);
  const to = stops.find((s) => s.code === sp.to);
  const today = todayPKT();
  const date = isValidDateString(sp.date) ? sp.date : today;
  const hasQuery = !!(sp.from || sp.to);
  const valid = !!from && !!to && from.id !== to.id && date >= today;

  let rows: TripRow[] = [];
  if (valid && from && to) {
    const dir = directionFor(from, to);
    const maxKm = stops[stops.length - 1].km;
    const [trips, taken] = await Promise.all([getTrips(dir), getAvailability(date)]);
    const nowMin = nowMinutesPKT();

    rows = trips
      .map((t) => {
        const times = tripTimes(t, from, to, maxKm);
        return {
          id: t.id,
          busName: t.bus_name,
          busType: t.bus_type,
          dep: times.dep,
          arr: times.arr,
          duration: times.duration,
          fare: calcFare(t, from, to),
          seatsLeft: t.total_seats - (taken[t.id] ?? 0),
          href: `/book/${t.id}?from=${from.code}&to=${to.code}&date=${date}`,
        } satisfies TripRow;
      })
      // aaj ki date par guzri hui rawangiyan hide
      .filter((r) => date !== today || r.dep > nowMin)
      .sort((a, b) => a.dep - b.dep);
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <Reveal>
        <span className="eyebrow">Find your bus</span>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
          {valid && from && to ? (
            <>
              {from.name} <ArrowRight className="mx-1 inline h-7 w-7 text-brand-500 sm:h-10 sm:w-10" /> {to.name}
            </>
          ) : (
            "Where to next?"
          )}
        </h1>
        {valid && (
          <p className="mt-3 flex items-center gap-2 text-ink-300">
            <CalendarDays className="h-4 w-4 text-brand-400" /> {formatDate(date)}
          </p>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <SearchCard stops={stops} defaultFrom={from?.code} defaultTo={to?.code} defaultDate={date} />
      </Reveal>

      <div className="mt-10">
        {valid ? (
          rows.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-ink-300">{rows.length} buses available</p>
              {rows.map((r, i) => (
                <TripCard key={r.id} trip={r} index={i} from={from!.name} to={to!.name} />
              ))}
            </div>
          ) : (
            <Empty title="No more buses today" text="All departures for today have left. Try tomorrow." />
          )
        ) : hasQuery ? (
          <Empty title="Check your search" text="Pick two different cities and a valid date, then search again." />
        ) : (
          <div>
            <h2 className="mb-4 text-lg font-bold text-ink-200">Popular searches</h2>
            <div className="flex flex-wrap gap-3">
              {[
                ["sukkur", "ghotki"],
                ["sukkur", "obauro"],
                ["ghotki", "daharki"],
                ["obauro", "sukkur"],
              ].map(([a, b]) => {
                const A = stops.find((s) => s.code === a);
                const B = stops.find((s) => s.code === b);
                if (!A || !B) return null;
                return (
                  <Link
                    key={a + b}
                    href={`/search?from=${a}&to=${b}&date=${today}`}
                    className="rounded-full border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-semibold text-ink-100 transition hover:border-brand-500 hover:text-brand-300"
                  >
                    {A.name} → {B.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
        <SearchX className="h-8 w-8" />
      </span>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-ink-300">{text}</p>
    </div>
  );
}
