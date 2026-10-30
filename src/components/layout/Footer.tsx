import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900/60">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo variant="full" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
            Intercity bus tickets on the Sukkur – Pano Aqil – Ghotki – Mirpur Mathelo – Daharki – Obauro corridor.
            Pick a seat, pay the fare, travel stress-free.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-brand-400">Explore</h4>
          <ul className="space-y-3 text-sm text-ink-300">
            <li><Link className="hover:text-white" href="/search">Book a seat</Link></li>
            <li><Link className="hover:text-white" href="/routes">Routes &amp; fares</Link></li>
            <li><Link className="hover:text-white" href="/bookings">My tickets</Link></li>
            <li><Link className="hover:text-white" href="/profile">Profile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-brand-400">Contact</h4>
          <ul className="space-y-3 text-sm text-ink-300">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-400" /> 0300 0000000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-400" /> help@safargo.example</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-400" /> Sukkur, Sindh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} SafarGo — Your Journey, Just a Tap Away. Demo project: timings &amp; fares are dummy.
      </div>
    </footer>
  );
}
