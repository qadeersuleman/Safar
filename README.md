# SafarGo — Online Bus Booking (Next.js + Supabase)

Route: **Sukkur → Pano Aqil → Ghotki → Mirpur Mathelo → Daharki → Obauro → wapas**

Stack: Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion + GSAP ScrollTrigger · Supabase (Auth + Postgres + RLS) · React Hook Form + Zod

## Step 1 — Run locally

1. Node.js 18.18+ (better 20/22) install karein: https://nodejs.org
2. Zip extract karein, folder mein terminal kholein:
   ```bash
   npm install
   cp .env.example .env.local      # Windows: copy .env.example .env.local
   npm run dev
   ```
3. Browser mein http://localhost:3000 kholein.
   Bina Supabase ke bhi site "demo mode" mein chalti hai (search, seat map). Login/booking ke liye Step 2-4 karein.

## Step 2 — Supabase project banayein

1. https://supabase.com → **New project** (name: safargo, ek strong DB password, region: nearest).
2. Project ready hone par **Project Settings → API** kholein aur copy karein:
   - **Project URL**
   - **anon public key** (naye dashboard mein "Publishable key")
3. `.env.local` mein paste karein:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

## Step 3 — Database tables banayein

1. Supabase dashboard → **SQL Editor → New query**.
2. `supabase/schema.sql` ka poora content paste karein → **Run**.

Isse yeh sab ban jata hai (RLS ON ke saath):

| Table | Kaam |
|---|---|
| `profiles` | id, full_name, phone (signup par trigger khud row banata hai) |
| `stops` | 6 cities + km (seeded) |
| `trips` | 8 daily bus timings, dono directions (seeded) |
| `bookings` | ticket_code, user, trip, date, from/to, seat_no, fare, status |

Functions: `book_tickets` (fare server par calculate, double-booking unique index se band), `cancel_tickets`, `get_taken_seats`, `get_trip_availability`.

## Step 4 — Auth settings

- **Authentication → Providers → Email**: enabled rakhein.
- Development mein jaldi test ke liye **Confirm email OFF** kar dein. Agar ON rakhein to signup ke baad "Check your email" screen aati hai; confirmation link ke liye **Authentication → URL Configuration → Site URL** = `http://localhost:3000` rakhein.

## Step 5 — Test karein

1. `/signup` → naam, mobile (03xx xxxxxxx), email, password.
2. Supabase → **Table Editor → profiles** mein aapki row nazar aayegi.
3. Home par search → trip select → seats → **Confirm** → `bookings` table mein rows aayengi.
4. `/bookings` mein ticket, cancel; `/profile` mein name/number edit; menu se logout.

## Deploy (Vercel)

GitHub par push karein → vercel.com par import → Environment Variables mein dono `NEXT_PUBLIC_SUPABASE_*` add karein → Deploy. Phir Supabase **Site URL** ko apne Vercel domain par set karein.

## Folder guide

```
src/app/            pages (/, /search, /book/[tripId], /bookings, /profile, /routes, /login, /signup)
src/components/     UI, home sections (GSAP/Framer), forms, seat picker, tickets
src/lib/supabase/   browser/server clients + middleware (session refresh + protected routes)
src/lib/data.ts     DB reads (DB na ho to dummy fallback)
supabase/schema.sql sab tables, RLS, functions, seed
public/brand/       aapke logos (transparent versions)
```

## Customize

- Timings/fares/stops: Supabase Table Editor mein `trips` / `stops` edit karein (`rate_per_km`, `start_time`).
- Primary colour: `tailwind.config.ts` → `brand`.
- Images: `src/lib/constants.ts` → `IMAGES` (URLs). Link fail ho to gradient fallback dikhta hai.

## Notes

- Dummy project: payment nahi hai; fares/timings/km approximate hain.
- Seat availability poori trip par hoti hai (segment-wise nahi) — simple rakha gaya hai.
