import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FareMatrix from "@/components/routes/FareMatrix";
import Reveal from "@/components/ui/Reveal";
import { FALLBACK_TRIPS } from "@/lib/constants";
import { getStops, getTrips } from "@/lib/data";
import { formatMinutes, toMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "Routes & fares" };

export default async function RoutesPage() {
  const stops = await getStops();
  const [out, ret] = await Promise.all([getTrips("outbound"), getTrips("return")]);
  const all = [...out, ...ret].length ? [...out, ...ret] : FALLBACK_TRIPS;

  const rates = ["Standard", "AC", "Business"]
    .map((type) => {
      const t = all.find((x) => x.bus_type === type);
      return t ? { type, rate: Number(t.rate_per_km) } : null;
    })
    .filter(Boolean) as { type: string; rate: number }[];

  const first = stops[0];
  const last = stops[stops.length - 1];

  return (
    <div className="container-x py-8 sm:py-12">
      <Reveal>
        <span className="eyebrow">Plan ahead</span>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Routes, timings &amp; fares</h1>
        <p className="mt-3 max-w-2xl text-ink-300">
          {stops.map((s) => s.name).join(" → ")} and back. Fares are calculated per km between your boarding and drop-off stops.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Fare chart</h2>
        <FareMatrix stops={stops} rates={rates} />
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {[
          { title: `${first.name} → ${last.name}`, trips: out, code: [first.code, last.code] },
          { title: `${last.name} → ${first.name}`, trips: ret, code: [last.code, first.code] },
        ].map((col, i) => (
          <Reveal key={col.title} delay={i * 0.1}>
            <div className="card p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{col.title}</h2>
                <Link href={`/search?from=${col.code[0]}&to=${col.code[1]}`} className="flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300">
                  Book <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-ink-600/60">
                {col.trips.map((t) => (
                  <li key={t.id} className="flex items-center justify-between py-3.5">
                    <div>
                      <p className="font-display text-lg font-bold">{formatMinutes(toMinutes(t.start_time))}</p>
                      <p className="text-sm text-ink-400">{t.bus_name}</p>
                    </div>
                    <span className="rounded-full border border-ink-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-200">
                      {t.bus_type}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
