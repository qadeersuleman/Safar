import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TicketList, { type RawBooking } from "@/components/booking/TicketList";
import { getCurrentUser, getStops } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "My tickets" };

export default async function BookingsPage() {
  let rows: RawBooking[] = [];
  const stops = await getStops();

  if (isSupabaseConfigured()) {
    const { user } = await getCurrentUser();
    if (!user) redirect("/login?next=/bookings");

    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select(
        "id, ticket_code, travel_date, seat_no, fare, status, created_at, from:stops!bookings_from_stop_fkey(name, km), to:stops!bookings_to_stop_fkey(name, km), trip:trips(bus_name, bus_type, start_time, direction)",
      )
      .order("travel_date", { ascending: false })
      .order("created_at", { ascending: false });
    rows = (data ?? []) as unknown as RawBooking[];
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <span className="eyebrow">E-tickets</span>
      <h1 className="mb-8 mt-3 text-3xl font-extrabold sm:text-5xl">My tickets</h1>
      <TicketList rows={rows} maxKm={stops[stops.length - 1].km} />
    </div>
  );
}
