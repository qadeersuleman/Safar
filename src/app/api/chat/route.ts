import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_STOPS, FALLBACK_TRIPS } from "@/lib/constants";

// SafarGo Knowledge Base for Gemini AI
const SAFARGO_SYSTEM_INSTRUCTION = `
Aap SafarGo (سفرگو) ke AI Travel Assistant hain. SafarGo Sindh ka official digital bus booking & tracking platform hai.
Aapka lehja nihayat muaddab (polite), helpful aur seedha saadha hona chahiye.
Aap Urdu, Roman Urdu aur English teeno zabaano mein baat cheet kar sakte hain (jis zabaan mein user sawaal kare, usi mein jawab dein).

SAFARGO SYSTEM KI POORI DETAIL:
1. ROUTE (N-5 Highway, Sindh):
   Sukkur (0 km) -> Pano Aqil (32 km) -> Ghotki (82 km) -> Mirpur Mathelo (107 km) -> Daharki (127 km) -> Obauro (142 km)
   Wapas route: Obauro se Sukkur tak same stops.

2. STOPS & BUS TERMINALS:
   - Sukkur: Military Road / Sukkur Bypass Main Terminal
   - Pano Aqil: Cantt Road / N-5 Highway Morh
   - Ghotki: Ghotki Bypass Bus Stand
   - Mirpur Mathelo: FFC Chowk / Main National Highway Stop
   - Daharki: Engro Morh / Station Road Stop
   - Obauro: Sindh-Punjab Border Checkpost Terminal

3. BUS SERVICES & FARES (Rate per KM):
   - Standard Bus: Rs 4 / km (Clean, Budget friendly, Non-AC)
   - AC Coach: Rs 5.5 / km (Full AC, Reclining seats, USB charging)
   - Royal Business: Rs 7.5 / km (Luxury business seats, Free snacks & water, Priority boarding)
   Kiraya calculate karne ka tareeqa: Fasal (Distance in km) * Rate per km.
   Examples:
   - Sukkur to Obauro (142 km): Standard: Rs 568 | AC: Rs 781 | Business: Rs 1,065
   - Sukkur to Ghotki (82 km): Standard: Rs 328 | AC: Rs 451 | Business: Rs 615
   - Ghotki to Daharki (45 km): Standard: Rs 180 | AC: Rs 248 | Business: Rs 338
   - Pano Aqil to Mirpur Mathelo (75 km): Standard: Rs 300 | AC: Rs 413 | Business: Rs 563

4. DAILY BUS SCHEDULES:
   Outbound (Sukkur -> Obauro):
   - 06:00 AM - Sindh Express (Standard)
   - 09:30 AM - Indus AC Coach (AC)
   - 02:00 PM - Royal Business (Business)
   - 07:30 PM - Night Rider (AC)

   Return (Obauro -> Sukkur):
   - 06:30 AM - Sindh Express (Standard)
   - 10:00 AM - Indus AC Coach (AC)
   - 03:00 PM - Royal Business (Business)
   - 08:00 PM - Night Rider (AC)

5. KEY FEATURES OF SAFARGO:
   - Live Bus Tracking (Bykea / Uber style): Real-time map par bus ki location, speed, captain name aur ETA (kitna time lagega) dekh sakte hain. User '/track' page par jaye.
   - Seat Selection: Interactive seat map se apni marzi ki seat choose karein. User '/search' par ja kar trip select kare.
   - My Tickets: Sabhi confirmed e-tickets '/bookings' page par QR code aur seat number ke sath available hote hain.

HIDAYAAT:
- Jawab mukhtasar (concise) aur asaan rakhein. Lambi unnecessary tehreer na likhein.
- Jahan munasib ho bullet points aur emojis use karein.
- Agar koi booking ya tracking ka pooche to unhe website ke sections (/search, /track, /routes, /bookings) suggest karein.
`;

// Smart Local Fallback in case external Gemini API call is unavailable
function generateSmartFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("kiraya") || q.includes("fare") || q.includes("ticket") || q.includes("price") || q.includes("rate")) {
    return `**SafarGo Bus Fares (کرایہ جات):**\n\n• **Standard Bus:** Rs 4 / km\n• **Indus AC Coach:** Rs 5.5 / km\n• **Royal Business:** Rs 7.5 / km\n\n**Ahem Safar:**\n- Sukkur se Obauro: Standard Rs 568 | AC Rs 781 | Business Rs 1,065\n- Sukkur se Ghotki: Standard Rs 328 | AC Rs 451 | Business Rs 615\n- Ghotki se Daharki: Standard Rs 180 | AC Rs 248 | Business Rs 338\n\nAap website par **Routes & Fares** page dekh sakte hain ya direct **Book a Seat** se book kar sakte hain.`;
  }

  if (q.includes("time") || q.includes("timing") || q.includes("schedule") || q.includes("kab") || q.includes("rawana")) {
    return `**SafarGo Rozana Bus Timings:**\n\n**Sukkur se Obauro:**\n• 06:00 AM — Sindh Express (Standard)\n• 09:30 AM — Indus AC Coach (AC)\n• 02:00 PM — Royal Business (Business)\n• 07:30 PM — Night Rider (AC)\n\n**Obauro se Sukkur (Wapsi):**\n• 06:30 AM, 10:00 AM, 03:00 PM, 08:00 PM\n\nHar bus har station par rukti hai. Total safar taqreeban 2 ghante 50 minute ka hai.`;
  }

  if (q.includes("track") || q.includes("trace") || q.includes("live") || q.includes("kahan") || q.includes("location") || q.includes("map")) {
    return `**Live Bus Tracking (Bykea Style):**\n\nAap SafarGo ki buses ko real-time map par trace kar sakte hain!\n• **Live Map:** Bus is waqt kahan pohnchi hai aur kis speed par chal rahi hai.\n• **ETA:** Aapke stop tak pohnchne mein kitna waqt lagega.\n• **Captain Details:** Driver ka naam, number plate aur phone number.\n\nLive tracking dekhne ke liye menu mein **Live Tracking** (/track) par click karein!`;
  }

  if (q.includes("book") || q.includes("seat") || q.includes("tariqa") || q.includes("tareeqa") || q.includes("how to")) {
    return `**Ticket Book Karne Ka Tareeqa:**\n\n1. **Book a Seat** (/search) par jayein.\n2. Rawangi (From) aur Manzil (To) select karein aur date choose karein.\n3. Apni pasandeeda bus (AC / Standard / Business) aur seat select karein.\n4. Apna naam aur mobile number confirm karein.\n5. Aapka ticket turant **My Tickets** (/bookings) mein generate ho jayega!`;
  }

  if (q.includes("stop") || q.includes("station") || q.includes("shehar") || q.includes("city") || q.includes("cities")) {
    return `**SafarGo Route Stations (6 Stations):**\n\n1. **Sukkur** (0 km) — Military Road Bypass\n2. **Pano Aqil** (32 km) — Cantt Highway Morh\n3. **Ghotki** (82 km) — Bypass Bus Stand\n4. **Mirpur Mathelo** (107 km) — FFC Chowk\n5. **Daharki** (127 km) — Engro Morh\n6. **Obauro** (142 km) — Sindh-Punjab Border Checkpost\n\nYeh poora route N-5 National Highway par waqia hai.`;
  }

  return `SafarGo mein khush-aamdeed! Main aapki travel assistance ke liye hazir hoon.\n\nAap mujh se:\n• **Bus Timings & Schedules**\n• **Kiraya & Fares (Sukkur ta Obauro)**\n• **Seat Booking ka tareeqa**\n• **Live Bus Tracking (/track)**\nke bare mein pooch sakte hain. Main aapki kya madad kar sakta hoon?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    const lastUserMessage = messages
      .filter((m: { role: string; content: string }) => m.role === "user")
      .pop()?.content || "";

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      // Return smart knowledge base response if no API key is set
      return NextResponse.json({
        reply: generateSmartFallback(lastUserMessage),
        source: "fallback",
      });
    }

    // Try Gemini API models (gemini-1.5-flash, gemini-2.0-flash, or gemini-2.5-flash)
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Format conversation history for Gemini
        const formattedContents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SAFARGO_SYSTEM_INSTRUCTION }],
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          if (text) {
            return NextResponse.json({ reply: text, source: "gemini", model });
          }
        }
      } catch (err) {
        // Try next model if this one fails
        continue;
      }
    }

    // If Gemini fails or times out, provide helpful smart fallback
    return NextResponse.json({
      reply: generateSmartFallback(lastUserMessage),
      source: "fallback",
    });
  } catch (error: any) {
    return NextResponse.json(
      { reply: "Maazrat, rabta nahi ho saka. Barah-e-karam dobara koshish karein.", error: error?.message },
      { status: 500 }
    );
  }
}

