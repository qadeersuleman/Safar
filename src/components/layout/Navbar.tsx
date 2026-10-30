"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LogOut, Ticket, User } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Props = { user: { name: string; email: string } | null };

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/routes", label: "Routes & Fares" },
  { href: "/search", label: "Book a Seat" },
  { href: "/bookings", label: "My Tickets" },
];

export default function Navbar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 16));

  async function logout() {
    setBusy(true);
    try {
      await createClient().auth.signOut();
    } finally {
      setBusy(false);
      setOpen(false);
      router.push("/");
      router.refresh();
    }
  }

  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled ? "border-white/10 bg-ink-950/80 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-3 sm:h-[72px]">
        <Logo priority />

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-ink-300 hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Account menu"
                aria-expanded={open}
                className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:border-brand-500/60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-display text-base font-bold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[110px] truncate text-sm font-semibold sm:block">
                  {user.name.split(" ")[0] || "Account"}
                </span>
              </button>

              <AnimatePresence>
                {open && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-14 z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-2 shadow-card"
                    >
                      <div className="border-b border-white/10 px-3 pb-3 pt-2">
                        <p className="truncate font-display font-semibold">{user.name || "Traveller"}</p>
                        <p className="truncate text-xs text-ink-400">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="mt-1 flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-white/5"
                      >
                        <User className="h-4 w-4 text-brand-400" /> My Profile
                      </Link>
                      <Link
                        href="/bookings"
                        onClick={() => setOpen(false)}
                        className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-white/5"
                      >
                        <Ticket className="h-4 w-4 text-brand-400" /> My Tickets
                      </Link>
                      <button
                        onClick={logout}
                        disabled={busy}
                        className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" /> {busy ? "Logging out…" : "Log out"}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary btn-sm hidden sm:inline-flex">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
