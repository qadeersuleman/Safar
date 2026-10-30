"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Armchair, Bus, ShieldCheck, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SafeImage from "@/components/ui/SafeImage";
import SearchCard from "@/components/search/SearchCard";
import { IMAGES } from "@/lib/constants";
import type { Stop } from "@/lib/types";

const line1 = "Your journey,".split(" ");
const line2 = "just a tap away.".split(" ");

const wordVariant = {
  hidden: { opacity: 0, y: 40, rotateX: -50 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: 0.25 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero({ stops }: { stops: Stop[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 18,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(glowRef.current, {
        yPercent: -30,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden">
      {/* background image + overlays */}
      <div ref={bgRef} className="absolute inset-0 -z-30 will-change-transform">
        <SafeImage src={IMAGES.hero} alt="Open road at golden hour" className="h-full w-full" priority />
      </div>
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-ink-950/85 via-ink-950/70 to-ink-950" />
      <div className="bg-grid absolute inset-0 -z-20" />
      <div
        ref={glowRef}
        className="absolute -right-24 top-10 -z-10 h-80 w-80 animate-float rounded-full bg-brand-500/30 blur-[110px] sm:h-[28rem] sm:w-[28rem]"
      />
      <div className="absolute -left-24 bottom-24 -z-10 h-64 w-64 rounded-full bg-brand-700/30 blur-[100px]" />

      <div className="container-x pb-32 pt-10 sm:pt-20 lg:pt-24">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow"
        >
          <Bus className="h-3.5 w-3.5" /> Sukkur ⇄ Obauro · Daily buses
        </motion.span>

        <h1 className="heading-xl mt-5 max-w-3xl [perspective:800px]" aria-label="Your journey, just a tap away.">
          <span className="block" aria-hidden>
            {line1.map((w, i) => (
              <motion.span key={w} custom={i} variants={wordVariant} initial="hidden" animate="show" className="mr-3 inline-block origin-bottom">
                {w}
              </motion.span>
            ))}
          </span>
          <span className="block" aria-hidden>
            {line2.map((w, i) => (
              <motion.span
                key={w}
                custom={i + line1.length}
                variants={wordVariant}
                initial="hidden"
                animate="show"
                className="text-gradient mr-3 inline-block origin-bottom"
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-5 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg"
        >
          Book comfortable buses across Sukkur, Pano Aqil, Ghotki, Mirpur Mathelo, Daharki &amp; Obauro. Pick your seat,
          see the fare, get your e-ticket in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-5xl"
        >
          <SearchCard stops={stops} />
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink-200"
        >
          {[
            { icon: Zap, t: "Instant e-ticket" },
            { icon: Armchair, t: "Choose your seat" },
            { icon: ShieldCheck, t: "Secure booking" },
          ].map(({ icon: Icon, t }) => (
            <li key={t} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-brand-400" /> {t}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* animated road */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden" aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-10 bg-ink-900" />
        <div className="road-dash animate-road absolute inset-x-0 bottom-4 h-1" />
        <div className="absolute bottom-6 animate-drive">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
            <Bus className="h-6 w-6" />
          </span>
        </div>
      </div>
    </section>
  );
}
