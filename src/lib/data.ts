import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { FALLBACK_STOPS, FALLBACK_TRIPS } from "@/lib/constants";
import type { Profile, Stop, Trip } from "@/lib/types";

/** Stops: DB se, warna dummy fallback */
export async function getStops(): Promise<Stop[]> {
  if (!isSupabaseConfigured()) return FALLBACK_STOPS;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("stops").select("id, code, name, seq, km").order("seq");
    if (error || !data?.length) return FALLBACK_STOPS;
    return data as Stop[];
  } catch {
    return FALLBACK_STOPS;
  }
}

export async function getTrips(direction: Trip["direction"]): Promise<Trip[]> {
  const fallback = FALLBACK_TRIPS.filter((t) => t.direction === direction);
  if (!isSupabaseConfigured()) return fallback;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("trips")
      .select("id, direction, start_time, bus_name, bus_type, total_seats, rate_per_km")
      .eq("direction", direction)
      .eq("active", true)
      .order("start_time");
    if (error || !data?.length) return fallback;
    return data.map((t) => ({ ...t, rate_per_km: Number(t.rate_per_km) })) as Trip[];
  } catch {
    return fallback;
  }
}

export async function getTrip(id: string): Promise<Trip | null> {
  if (!isSupabaseConfigured()) return FALLBACK_TRIPS.find((t) => t.id === id) ?? null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("trips")
      .select("id, direction, start_time, bus_name, bus_type, total_seats, rate_per_km")
      .eq("id", id)
      .maybeSingle();
    return data ? ({ ...data, rate_per_km: Number(data.rate_per_km) } as Trip) : null;
  } catch {
    return null;
  }
}

/** { tripId: bookedSeatsCount } */
export async function getAvailability(date: string): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_trip_availability", { p_date: date });
    const map: Record<string, number> = {};
    (data as { trip_id: string; taken: number }[] | null)?.forEach((r) => (map[r.trip_id] = r.taken));
    return map;
  } catch {
    return {};
  }
}

export async function getTakenSeats(tripId: string, date: string): Promise<number[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_taken_seats", { p_trip: tripId, p_date: date });
    return (data as number[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return { user: null, profile: null as Profile | null };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null as Profile | null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("id", user.id)
      .maybeSingle();
    return { user, profile: (profile as Profile | null) ?? null };
  } catch {
    return { user: null, profile: null as Profile | null };
  }
}
