"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bus, MapPin } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Stop } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Scroll karne par route ki line bharti hai aur bus ek stop se doosre tak jati hai (GSAP ScrollTrigger) */
export default function RouteTimeline({ stops }: { stops: Stop[] }) {
  const [dir, setDir] = useState<"outbound" | "return">("outbound");
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const busRef = useRef<HTMLDivElement>(null);

  const list = dir === "outbound" ? stops : [...stops].reverse();
  const maxKm = stops[stops.length - 1]?.km ?? 0;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ctx = gsap.context(() => {
      const track = wrap.querySelector<HTMLElement>("[data-track]");
      gsap.fromTo(
        progressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: track, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        },
      );
      gsap.fromTo(
        busRef.current,
        { top: "0%" },
        {
          top: "100%",
          ease: "none",
          scrollTrigger: { trigger: track, start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 65%",
          onEnter: () => el.setAttribute("data-active", "true"),
          onLeaveBack: () => el.removeAttribute("data-active"),
        });
        gsap.from(el.querySelector("[data-card]"), {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    }, wrap);

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [dir]);

  return (
    <section className="section relative overflow-hidden bg-ink-900/40">
      <div className="container-x" ref={wrapRef}>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">The route</span>
          <h2 className="heading-lg mt-4">
            One corridor. <span className="text-gradient">Six stops.</span> Both ways.
          </h2>
          <p className="mt-4 text-ink-300">
            Scroll to ride along. Buses run Sukkur to Obauro and straight back, stopping at every city on the way.
          </p>

          <div className="mx-auto mt-7 inline-flex rounded-full border border-white/10 bg-ink-800 p-1">
            {(["outbound", "return"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDir(d)}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  dir === d ? "text-white" : "text-ink-300 hover:text-white",
                )}
              >
                {dir === d && (
                  <motion.span
                    layoutId="dir-pill"
                    className="absolute inset-0 rounded-full bg-brand-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{d === "outbound" ? "Sukkur → Obauro" : "Obauro → Sukkur"}</span>
              </button>
            ))}
          </div>
        </div>

        <div data-track className="relative mx-auto mt-14 max-w-3xl">
          {/* rail */}
          <div className="absolute bottom-0 left-5 top-0 w-1 -translate-x-1/2 rounded-full bg-ink-600 md:left-1/2" />
          <div
            ref={progressRef}
            className="absolute bottom-0 left-5 top-0 w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-300 to-brand-600 shadow-glow md:left-1/2"
          />
          <div ref={busRef} className="absolute left-5 z-20 -translate-x-1/2 -translate-y-1/2 md:left-1/2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow ring-4 ring-ink-950">
              <Bus className="h-5 w-5" />
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.ol
              key={dir}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-10 py-2"
            >
              {list.map((s, i) => {
                const next = list[i + 1];
                const km = dir === "outbound" ? s.km : maxKm - s.km;
                const left = i % 2 === 0;
                return (
                  <li key={s.code} data-stop className="group relative pl-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                    {/* dot */}
                    <span className="absolute left-5 top-6 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-ink-500 bg-ink-950 transition-all duration-500 group-data-[active=true]:scale-125 group-data-[active=true]:border-brand-500 group-data-[active=true]:bg-brand-500 group-data-[active=true]:shadow-glow md:left-1/2" />

                    <div data-card className={cn("md:col-start-1", left ? "md:text-right" : "md:col-start-2")}>
                      <div className="card p-5 transition-colors duration-500 group-data-[active=true]:border-brand-500/50">
                        <div className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-400", left && "md:justify-end")}>
                          <MapPin className="h-3.5 w-3.5" />
                          {i === 0 ? "Start" : i === list.length - 1 ? "Terminal" : `Stop ${i}`} · {km} km
                        </div>
                        <h3 className="mt-2 text-2xl font-bold">{s.name}</h3>
                        {next && (
                          <Link
                            href={`/search?from=${s.code}&to=${next.code}`}
                            className={cn(
                              "mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-300 hover:text-brand-300",
                            )}
                          >
                            Book to {next.name} <ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
