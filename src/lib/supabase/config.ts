export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** .env.local mein keys lagi hain? (nahi to app "demo mode" mein chalti hai) */
export function isSupabaseConfigured() {
  return (
    SUPABASE_URL.startsWith("http") &&
    SUPABASE_KEY.length > 10 &&
    !SUPABASE_URL.includes("YOUR-PROJECT-REF")
  );
}
