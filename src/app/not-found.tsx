import Link from "next/link";
import { Bus } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70svh] flex-col items-center justify-center text-center">
      <div className="relative mb-8 h-24 w-full max-w-sm overflow-hidden">
        <div className="absolute inset-x-0 bottom-3 h-1 road-dash animate-road" />
        <div className="absolute bottom-4 animate-drive">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-glow">
            <Bus className="h-7 w-7" />
          </span>
        </div>
      </div>
      <p className="font-display text-7xl font-extrabold text-gradient">404</p>
      <h1 className="mt-3 text-2xl font-bold">Yeh rasta nahi mila</h1>
      <p className="mt-2 max-w-sm text-ink-300">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </section>
  );
}
