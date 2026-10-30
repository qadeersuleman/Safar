import type { Stop, Trip } from "./types";
import { AVG_SPEED_KMH } from "./constants";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatPKR(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

/** "HH:MM:SS" -> minutes since midnight */
export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** minutes -> "09:30 AM" (din se aage nikal jaye to +1 day) */
export function formatMinutes(total: number) {
  const dayShift = Math.floor(total / 1440);
  const mins = ((total % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}${dayShift > 0 ? " (+1)" : ""}`;
}

export function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/** Aaj ki date (Pakistan time) as YYYY-MM-DD */
export function todayPKT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
}

/** Abhi Pakistan mein kitne minute ho chuke (din ke) */
export function nowMinutesPKT() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return (h % 24) * 60 + m;
}

export function isValidDateString(s: string | undefined | null): s is string {
  return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + "T00:00:00").getTime());
}

/** Trip ke terminal se kitne km door hai yeh stop */
function offsetKm(direction: Trip["direction"], stop: Stop, maxKm: number) {
  return direction === "outbound" ? stop.km : maxKm - stop.km;
}

export function tripTimes(trip: Trip, from: Stop, to: Stop, maxKm: number) {
  const start = toMinutes(trip.start_time);
  const dep = start + Math.round((offsetKm(trip.direction, from, maxKm) / AVG_SPEED_KMH) * 60);
  const arr = start + Math.round((offsetKm(trip.direction, to, maxKm) / AVG_SPEED_KMH) * 60);
  return { dep, arr, duration: arr - dep };
}

export function calcFare(trip: Trip, from: Stop, to: Stop) {
  return Math.round(Math.abs(to.km - from.km) * Number(trip.rate_per_km));
}

export function directionFor(from: Stop, to: Stop): Trip["direction"] {
  return from.seq < to.seq ? "outbound" : "return";
}

/** Pakistani mobile: 03XXXXXXXXX ya +923XXXXXXXXX */
export const PK_PHONE_REGEX = /^(?:\+92|0092|92|0)?3\d{9}$/;

export function normalizePhone(raw: string) {
  const d = raw.replace(/[\s-]/g, "");
  if (/^\+?92/.test(d) || /^0092/.test(d)) return "0" + d.replace(/^(\+92|0092|92)/, "");
  return d;
}
