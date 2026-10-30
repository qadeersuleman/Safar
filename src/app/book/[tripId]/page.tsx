import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BookingClient from "@/components/booking/BookingClient";
import { getCurrentUser, getStops, getTakenSeats, getTrip } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { calcFare, directionFor, isValidDateString, todayPKT, tripTimes } from "@/lib/utils";

export const metadata: Metadata = { title: "Select seats" };

type SP = { from?: string; to?: string; date?: string };

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<SP>;
}) {
  const { tripId } = await params;
  const sp = await searchParams;
  const demo = !isSupabaseConfigured();

  const [stops, trip, { user, profile }] = await Promise.all([getStops(), getTrip(tripId), getCurrentUser()]);
  if (!demo && !user) redirect(`/login?next=${encodeURIComponent(`/book/${tripId}?from=${sp.from}&to=${sp.to}&date=${sp.date}`)}`);

  const from = stops.find((s) => s.code === sp.from);
  const to = stops.find((s) => s.code === sp.to);
  if (!trip || !from || !to || from.id === to.id || !isValidDateString(sp.date) || sp.date < todayPKT()) notFound();
  if (trip.direction !== directionFor(from, to)) notFound();

  const taken = await getTakenSeats(trip.id, sp.date);
  const maxKm = stops[stops.length - 1].km;
  const { dep, arr } = tripTimes(trip, from, to, maxKm);

  return (
    <div className="container-x py-8 sm:py-12">
      <span className="eyebrow">Step 2 of 2</span>
      <h1 className="mb-8 mt-3 text-3xl font-extrabold sm:text-4xl">Select your seats</h1>
      <BookingClient
        trip={{ id: trip.id, busName: trip.bus_name, busType: trip.bus_type, totalSeats: trip.total_seats }}
        from={{ id: from.id, name: from.name }}
        to={{ id: to.id, name: to.name }}
        date={sp.date}
        dep={dep}
        arr={arr}
        farePerSeat={calcFare(trip, from, to)}
        taken={taken}
        passenger={user ? { name: profile?.full_name ?? "", phone: profile?.phone ?? "" } : null}
        demo={demo}
      />
    </div>
  );
}
