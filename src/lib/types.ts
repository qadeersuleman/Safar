export type Stop = {
  id: string;
  code: string;
  name: string;
  seq: number;
  km: number;
};

export type BusType = "Standard" | "AC" | "Business";

export type Trip = {
  id: string;
  direction: "outbound" | "return";
  start_time: string; // "HH:MM:SS"
  bus_name: string;
  bus_type: BusType;
  total_seats: number;
  rate_per_km: number;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
};

export type BookingRow = {
  id: string;
  ticket_code: string;
  travel_date: string;
  seat_no: number;
  fare: number;
  status: "confirmed" | "cancelled";
  created_at: string;
  from: { name: string } | null;
  to: { name: string } | null;
  trip: Pick<Trip, "bus_name" | "bus_type" | "start_time" | "direction"> | null;
};
