import Link from "next/link";
import { ArrowRight, Check, CreditCard, Search, Armchair, Star, Wind, Zap, Coffee } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import CountUp from "@/components/home/CountUp";
import { BUS_TYPE_INFO, IMAGES } from "@/lib/constants";
import type { Stop } from "@/lib/types";
import { formatPKR } from "@/lib/utils";

export function StopsMarquee({ stops }: { stops: Stop[] }) {
  const items = [...stops, ...stops.slice().reverse()];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-ink-900 py-5" aria-hidden>
      <div className="flex w-max animate-marquee gap-10">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-2xl font-bold text-ink-500 sm:text-3xl">
            {s.name}
            <span className="h-2 w-2 rounded-full bg-brand-500" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Stats({ stops }: { stops: Stop[] }) {
  const totalKm = stops[stops.length - 1]?.km ?? 142;
  const data = [
    { to: stops.length, suffix: "", label: "Cities connected" },
    { to: 8, suffix: "", label: "Daily departures" },
    { to: totalKm, suffix: " km", label: "Route length" },
    { to: 4.9, suffix: "★", label: "Traveller rating", decimals: 1 },
  ];
  return (
    <section className="container-x -mt-1 py-12 sm:py-16">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.map((d, i) => (
          <Reveal key={d.label} delay={i * 0.08}>
            <div className="card p-5 text-center sm:p-7">
              <p className="font-display text-4xl font-extrabold text-gradient sm:text-5xl">
                <CountUp to={d.to} suffix={d.suffix} decimals={d.decimals ?? 0} />
              </p>
              <p className="mt-2 text-sm text-ink-300">{d.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const perkIcons = [Wind, Zap, Coffee];

export function BusTypes() {
  const types = ["Standard", "AC", "Business"] as const;
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Our fleet</span>
          <h2 className="heading-lg mt-4">
            Pick the ride that <span className="text-gradient">fits you</span>
          </h2>
          <p className="mt-4 text-ink-300">Three comfort levels on every route, so you only pay for what you need.</p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {types.map((t, i) => {
            const info = BUS_TYPE_INFO[t];
            return (
              <Reveal key={t} delay={i * 0.12}>
                <article className="card group overflow-hidden transition duration-500 hover:-translate-y-2 hover:border-brand-500/50">
                  <div className="relative h-52 overflow-hidden">
                    <SafeImage
                      src={info.image}
                      alt={`${t} bus`}
                      className="h-full w-full"
                      imgClassName="transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      {t}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">{info.tagline}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {info.perks.map((p, k) => {
                        const Icon = perkIcons[k % perkIcons.length];
                        return (
                          <li key={p} className="flex items-center gap-3 text-sm text-ink-200">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            {p}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: Search, title: "Search", text: "Choose where you are going and the date you travel." },
    { icon: Armchair, title: "Pick a seat", text: "See the live seat map and select up to 4 seats." },
    { icon: CreditCard, title: "Confirm", text: "Fare is calculated automatically. Your e-ticket is ready instantly." },
  ];
  return (
    <section className="section bg-ink-900/40">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">How it works</span>
          <h2 className="heading-lg mt-4">
            Booked in <span className="text-gradient">three taps</span>
          </h2>
        </Reveal>
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden border-t-2 border-dashed border-brand-500/30 md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.12}>
              <div className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-brand-500/30 bg-ink-800 text-brand-400 shadow-glow">
                  <s.icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-ink-300">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PopularFares({ stops, rate }: { stops: Stop[]; rate: number }) {
  const by = Object.fromEntries(stops.map((s) => [s.code, s]));
  const pairs: [string, string][] = [
    ["sukkur", "ghotki"],
    ["sukkur", "daharki"],
    ["ghotki", "mirpur-mathelo"],
    ["obauro", "sukkur"],
    ["daharki", "pano-aqil"],
    ["mirpur-mathelo", "obauro"],
  ].filter(([a, b]) => by[a] && by[b]) as [string, string][];

  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Popular trips</span>
          <h2 className="heading-lg mt-4">
            Fares that make <span className="text-gradient">sense</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pairs.map(([a, b], i) => {
            const km = Math.abs(by[b].km - by[a].km);
            return (
              <Reveal key={a + b} delay={(i % 3) * 0.1}>
                <Link
                  href={`/search?from=${a}&to=${b}`}
                  className="card group flex items-center justify-between gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-500/50"
                >
                  <div>
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold">
                      {by[a].name} <ArrowRight className="h-4 w-4 text-brand-400" /> {by[b].name}
                    </p>
                    <p className="mt-1 text-sm text-ink-400">{km} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-400">from</p>
                    <p className="font-display text-xl font-extrabold text-brand-400">{formatPKR(km * rate)}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const reviews = [
  { name: "Ahmed Raza", city: "Sukkur", text: "Booked my seat from the bus stand queue in 30 seconds. The seat map is brilliant.", img: IMAGES.avatars[0] },
  { name: "Sana Khatoon", city: "Ghotki", text: "Clear fares, clean buses and the ticket was ready instantly. Traveling to Daharki is so easy now.", img: IMAGES.avatars[1] },
  { name: "Imran Memon", city: "Mirpur Mathelo", text: "I travel every week. Cancelling and rebooking takes a single tap. Love the dark design too!", img: IMAGES.avatars[2] },
];

export function Testimonials() {
  return (
    <section className="section bg-ink-900/40">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Travellers say</span>
          <h2 className="heading-lg mt-4">
            Loved on <span className="text-gradient">every mile</span>
          </h2>
        </Reveal>
      </div>
      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 md:mx-auto md:max-w-6xl md:grid md:grid-cols-3 md:overflow-visible lg:px-8">
        {reviews.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.1} className="w-[84%] shrink-0 snap-center sm:w-[60%] md:w-auto">
            <figure className="card h-full p-6">
              <div className="flex gap-1 text-brand-400">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-base leading-relaxed text-ink-100">“{r.text}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <SafeImage src={r.img} alt={r.name} className="h-12 w-12 rounded-full" />
                <div>
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-ink-400">{r.city}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="container-x section">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[32px] border border-brand-500/30 p-8 text-center sm:p-14">
          <SafeImage src={IMAGES.cta} alt="Road trip" className="absolute inset-0 -z-20" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700/90 via-ink-950/85 to-ink-950" />
          <h2 className="heading-lg mx-auto max-w-2xl">Ready for your next safar?</h2>
          <p className="mx-auto mt-4 max-w-lg text-ink-200">
            Create a free account to save your details, book faster and keep every ticket in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary">
              Create free account
            </Link>
            <Link href="/search" className="btn-ghost">
              <Check className="h-5 w-5 text-brand-400" /> Search buses
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
