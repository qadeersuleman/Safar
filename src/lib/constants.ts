import type { Stop, Trip } from "./types";

// Fallback (dummy) data: Supabase na ho tab bhi UI chalti rahe.
// Supabase connect hone par DB wala data use hota hai (supabase/schema.sql).
export const FALLBACK_STOPS: Stop[] = [
  { id: "s0", code: "sukkur", name: "Sukkur", seq: 0, km: 0 },
  { id: "s1", code: "pano-aqil", name: "Pano Aqil", seq: 1, km: 32 },
  { id: "s2", code: "ghotki", name: "Ghotki", seq: 2, km: 82 },
  { id: "s3", code: "mirpur-mathelo", name: "Mirpur Mathelo", seq: 3, km: 107 },
  { id: "s4", code: "daharki", name: "Daharki", seq: 4, km: 127 },
  { id: "s5", code: "obauro", name: "Obauro", seq: 5, km: 142 },
];

export const FALLBACK_TRIPS: Trip[] = [
  { id: "demo-o1", direction: "outbound", start_time: "06:00:00", bus_name: "Sindh Express", bus_type: "Standard", total_seats: 40, rate_per_km: 4 },
  { id: "demo-o2", direction: "outbound", start_time: "09:30:00", bus_name: "Indus AC Coach", bus_type: "AC", total_seats: 40, rate_per_km: 5.5 },
  { id: "demo-o3", direction: "outbound", start_time: "14:00:00", bus_name: "Royal Business", bus_type: "Business", total_seats: 32, rate_per_km: 7.5 },
  { id: "demo-o4", direction: "outbound", start_time: "19:30:00", bus_name: "Night Rider", bus_type: "AC", total_seats: 40, rate_per_km: 5.5 },
  { id: "demo-r1", direction: "return", start_time: "06:30:00", bus_name: "Sindh Express", bus_type: "Standard", total_seats: 40, rate_per_km: 4 },
  { id: "demo-r2", direction: "return", start_time: "10:00:00", bus_name: "Indus AC Coach", bus_type: "AC", total_seats: 40, rate_per_km: 5.5 },
  { id: "demo-r3", direction: "return", start_time: "15:00:00", bus_name: "Royal Business", bus_type: "Business", total_seats: 32, rate_per_km: 7.5 },
  { id: "demo-r4", direction: "return", start_time: "20:00:00", bus_name: "Night Rider", bus_type: "AC", total_seats: 40, rate_per_km: 5.5 },
];

export const AVG_SPEED_KMH = 50;

// Image URLs (Unsplash / pravatar). Koi link na chale to SafeImage gradient dikha deta hai.
export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1800&q=70",
  standard: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=70",
  ac: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=70",
  business: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=70",
  road: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=70",
  cta: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1600&q=70",
  auth: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=70",
  avatars: [
    "https://i.pravatar.cc/120?img=12",
    "https://i.pravatar.cc/120?img=47",
    "https://i.pravatar.cc/120?img=33",
  ],
};

export const BUS_TYPE_INFO: Record<string, { tagline: string; perks: string[]; image: string }> = {
  Standard: {
    tagline: "Simple, budget-friendly rides",
    perks: ["Everyday comfort", "Fresh-air windows", "Lowest fares"],
    image: IMAGES.standard,
  },
  AC: {
    tagline: "Cool, calm & comfortable",
    perks: ["Full AC", "Reclining seats", "USB charging"],
    image: IMAGES.ac,
  },
  Business: {
    tagline: "Premium first-class feel",
    perks: ["Extra legroom", "Snacks & water", "Priority boarding"],
    image: IMAGES.business,
  },
};
