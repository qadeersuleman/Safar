"use client";

import { motion } from "framer-motion";
import { BadgeCheck, Ticket, Zap } from "lucide-react";
import Logo from "@/components/ui/Logo";
import SafeImage from "@/components/ui/SafeImage";
import { IMAGES } from "@/lib/constants";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-2">
      {/* image side (desktop) */}
      <div className="relative hidden overflow-hidden lg:block">
        <SafeImage src={IMAGES.auth} alt="Travel" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700/80 via-ink-950/80 to-ink-950" />
        <div className="bg-grid absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="full" />
          <div>
            <h2 className="heading-lg max-w-md">Your seat is waiting.</h2>
            <ul className="mt-8 space-y-4">
              {[
                { icon: Ticket, t: "All your e-tickets in one place" },
                { icon: Zap, t: "Book in under a minute" },
                { icon: BadgeCheck, t: "Saved name & number, no retyping" },
              ].map(({ icon: Icon, t }, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-3 text-ink-100"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  {t}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-brand-500/15 blur-[100px]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-ink-300">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
