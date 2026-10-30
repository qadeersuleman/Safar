// SafarGo Live Bus Tracking & Coordinates

export type Coordinates = {
  lat: number;
  lng: number;
};

export type StationStop = {
  id: string;
  name: string;
  urduName: string;
  km: number;
  coords: Coordinates;
  terminal: string;
};

// 6 Stations on the N-5 Highway in Sindh
export const TRACKING_STATIONS: StationStop[] = [
  {
    id: "sukkur",
    name: "Sukkur",
    urduName: "سکھر",
    km: 0,
    coords: { lat: 27.7052, lng: 68.8574 },
    terminal: "Military Road / Sukkur Bypass Main Terminal",
  },
  {
    id: "pano-aqil",
    name: "Pano Aqil",
    urduName: "پنوعاقل",
    km: 32,
    coords: { lat: 27.8573, lng: 69.1121 },
    terminal: "Cantt Road / N-5 Highway Morh",
  },
  {
    id: "ghotki",
    name: "Ghotki",
    urduName: "گھوٹکی",
    km: 82,
    coords: { lat: 28.006, lng: 69.3161 },
    terminal: "Ghotki Bypass Bus Stand",
  },
  {
    id: "mirpur-mathelo",
    name: "Mirpur Mathelo",
    urduName: "میرپور ماتھیلو",
    km: 107,
    coords: { lat: 28.0227, lng: 69.5489 },
    terminal: "FFC Chowk / Main National Highway Stop",
  },
  {
    id: "daharki",
    name: "Daharki",
    urduName: "ڈھرکی",
    km: 127,
    coords: { lat: 28.0441, lng: 69.6756 },
    terminal: "Engro Morh / Station Road Stop",
  },
  {
    id: "obauro",
    name: "Obauro",
    urduName: "اوباڑو",
    km: 142,
    coords: { lat: 28.1672, lng: 69.7314 },
    terminal: "Sindh-Punjab Border Checkpost Terminal",
  },
];

// N-5 Highway route detailed polyline waypoints (Sukkur -> Obauro)
export const HIGHWAY_POLYLINE: Coordinates[] = [
  { lat: 27.7052, lng: 68.8574 }, // Sukkur Main
  { lat: 27.7312, lng: 68.9145 }, // Sukkur Bypass
  { lat: 27.7845, lng: 69.0123 }, // Rohri North N-5
  { lat: 27.8573, lng: 69.1121 }, // Pano Aqil Cantt
  { lat: 27.915, lng: 69.198 }, // Sangi
  { lat: 27.962, lng: 69.255 }, // Sarhad
  { lat: 28.006, lng: 69.3161 }, // Ghotki Bypass
  { lat: 28.014, lng: 69.432 }, // Khanpur Mahar morh
  { lat: 28.0227, lng: 69.5489 }, // Mirpur Mathelo FFC
  { lat: 28.038, lng: 69.615 }, // Reti
  { lat: 28.0441, lng: 69.6756 }, // Daharki Engro Morh
  { lat: 28.112, lng: 69.702 }, // Khairpur Gamboh
  { lat: 28.1672, lng: 69.7314 }, // Obauro Terminal
];

export type TrackedBus = {
  id: string;
  name: string;
  code: string;
  type: "Standard" | "AC" | "Business";
  plateNumber: string;
  captainName: string;
  captainPhone: string;
  captainRating: number;
  totalTrips: number;
  direction: "outbound" | "return"; // outbound: Sukkur -> Obauro, return: Obauro -> Sukkur
  speedKmh: number;
  progressPercent: number; // 0 to 100 along the route
  status: "on_highway" | "approaching_stop" | "boarding";
  nextStopName: string;
  currentCoords: Coordinates;
};

// Initial Active Dummy Buses Operating on Route
export const INITIAL_BUSES: TrackedBus[] = [
  {
    id: "SG-101",
    name: "Sindh Express",
    code: "SG-101",
    type: "Standard",
    plateNumber: "SND-8492",
    captainName: "Captain Aslam Khan",
    captainPhone: "0300-8472911",
    captainRating: 4.9,
    totalTrips: 1420,
    direction: "outbound",
    speedKmh: 54,
    progressPercent: 24, // Near Pano Aqil
    status: "on_highway",
    nextStopName: "Pano Aqil",
    currentCoords: { lat: 27.8573, lng: 69.1121 },
  },
  {
    id: "SG-204",
    name: "Indus AC Coach",
    code: "SG-204",
    type: "AC",
    plateNumber: "SND-2190",
    captainName: "Captain Tariq Mehmood",
    captainPhone: "0301-7629381",
    captainRating: 4.8,
    totalTrips: 2105,
    direction: "outbound",
    speedKmh: 62,
    progressPercent: 58, // Past Ghotki towards Mirpur Mathelo
    status: "on_highway",
    nextStopName: "Mirpur Mathelo",
    currentCoords: { lat: 28.014, lng: 69.432 },
  },
  {
    id: "SG-305",
    name: "Royal Business",
    code: "SG-305",
    type: "Business",
    plateNumber: "LHR-5512",
    captainName: "Captain Farhan Ali",
    captainPhone: "0303-9182374",
    captainRating: 5.0,
    totalTrips: 3420,
    direction: "outbound",
    speedKmh: 68,
    progressPercent: 88, // Near Daharki
    status: "approaching_stop",
    nextStopName: "Daharki",
    currentCoords: { lat: 28.0441, lng: 69.6756 },
  },
  {
    id: "SG-402",
    name: "Night Rider",
    code: "SG-402",
    type: "AC",
    plateNumber: "KHI-7723",
    captainName: "Captain Naveed Shah",
    captainPhone: "0302-3847192",
    captainRating: 4.9,
    totalTrips: 890,
    direction: "return", // Coming back towards Sukkur
    speedKmh: 58,
    progressPercent: 42, // En route towards Ghotki
    status: "on_highway",
    nextStopName: "Ghotki",
    currentCoords: { lat: 28.014, lng: 69.432 },
  },
];

// Great-circle Haversine Distance (Kilometers)
export function calculateDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Calculate ETA in minutes based on distance and speed
export function calculateEtaMinutes(distanceKm: number, speedKmh = 50): number {
  if (speedKmh <= 0) return 5;
  const mins = Math.round((distanceKm / speedKmh) * 60);
  return Math.max(1, mins);
}

// Interpolate coordinate along highway polyline based on percentage (0 - 100)
export function getCoordinateAtProgress(percent: number, polyline: Coordinates[] = HIGHWAY_POLYLINE): Coordinates {
  const clamped = Math.max(0, Math.min(100, percent));
  const totalSegments = polyline.length - 1;
  const scaled = (clamped / 100) * totalSegments;
  const index = Math.floor(scaled);
  const frac = scaled - index;

  if (index >= totalSegments) return polyline[totalSegments];

  const p1 = polyline[index];
  const p2 = polyline[index + 1];

  return {
    lat: p1.lat + (p2.lat - p1.lat) * frac,
    lng: p1.lng + (p2.lng - p1.lng) * frac,
  };
}

