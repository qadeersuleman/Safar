import { DatabaseZap } from "lucide-react";

/** Sirf tab dikhta hai jab .env.local mein Supabase keys nahi hain */
export default function SetupBanner() {
  return (
    <div className="relative z-40 border-b border-brand-500/30 bg-brand-500/10 text-sm text-brand-100">
      <div className="container-x flex items-start gap-3 py-2.5">
        <DatabaseZap className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
        <p>
          <b>Demo mode:</b> Supabase connect nahi hai. Search chal rahi hai, lekin login / booking ke liye{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">.env.local</code> mein keys lagayein (README dekhein).
        </p>
      </div>
    </div>
  );
}
