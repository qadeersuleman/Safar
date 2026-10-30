"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Map, Search, Ticket, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mobile-first bottom tab bar (md se upar hide) */
export default function BottomNav({ authed }: { authed: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/routes", label: "Routes", icon: Map },
    { href: "/search", label: "Book", icon: Search, center: true },
    { href: "/bookings", label: "Tickets", icon: Ticket },
    authed ? { href: "/profile", label: "Profile", icon: User } : { href: "/login", label: "Log in", icon: LogIn },
  ];

  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-ink-950/90 backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {items.map(({ href, label, icon: Icon, center }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                  center ? "-mt-7" : "h-14 w-full",
                  active ? "text-brand-400" : "text-ink-300",
                )}
              >
                {center ? (
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow ring-4 ring-ink-950"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.span>
                ) : (
                  <>
                    {active && (
                      <motion.span
                        layoutId="bottom-pill"
                        className="absolute inset-x-3 top-0 h-[3px] rounded-full bg-brand-500"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon className="h-5 w-5" />
                  </>
                )}
                <span className={center ? "text-brand-400" : ""}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
