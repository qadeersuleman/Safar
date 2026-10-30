-- =====================================================================
-- SafarGo  -  Supabase schema (ek hi baar SQL Editor mein run karein)
-- Tables: profiles, stops, trips, bookings
-- Safe to re-run: sab kuch "if not exists" / "or replace" hai.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) PROFILES  (auth.users ke saath 1-to-1: name + number)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  phone      text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Signup par profile row khud ban jaye (name/phone signup form se aate hain)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 2) STOPS  (route: Sukkur > Pano Aqil > Ghotki > Mirpur Mathelo
--            > Daharki > Obauro, phir wapas)
-- ---------------------------------------------------------------------
create table if not exists public.stops (
  id   uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  seq  int  not null unique,   -- route ki tarteeb (0 = Sukkur)
  km   int  not null           -- Sukkur se approx faasla (dummy)
);

alter table public.stops enable row level security;
drop policy if exists "stops_public_read" on public.stops;
create policy "stops_public_read" on public.stops for select using (true);

insert into public.stops (code, name, seq, km) values
  ('sukkur',         'Sukkur',         0,   0),
  ('pano-aqil',      'Pano Aqil',      1,  32),
  ('ghotki',         'Ghotki',         2,  82),
  ('mirpur-mathelo', 'Mirpur Mathelo', 3, 107),
  ('daharki',        'Daharki',        4, 127),
  ('obauro',         'Obauro',         5, 142)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 3) TRIPS  (roz chalne wali bus timings, dono directions)
--    outbound = Sukkur -> Obauro,  return = Obauro -> Sukkur
-- ---------------------------------------------------------------------
create table if not exists public.trips (
  id           uuid primary key default gen_random_uuid(),
  direction    text not null check (direction in ('outbound', 'return')),
  start_time   time not null,                 -- terminal se rawangi (Sukkur ya Obauro)
  bus_name     text not null,
  bus_type     text not null check (bus_type in ('Standard', 'AC', 'Business')),
  total_seats  int  not null default 40,
  rate_per_km  numeric(6,2) not null,         -- fare = km * rate
  active       boolean not null default true
);

alter table public.trips enable row level security;
drop policy if exists "trips_public_read" on public.trips;
create policy "trips_public_read" on public.trips for select using (true);

-- seed sirf tab jab table khali ho
insert into public.trips (direction, start_time, bus_name, bus_type, total_seats, rate_per_km)
select * from (values
  ('outbound', '06:00'::time, 'Sindh Express',  'Standard', 40, 4.00),
  ('outbound', '09:30'::time, 'Indus AC Coach', 'AC',       40, 5.50),
  ('outbound', '14:00'::time, 'Royal Business', 'Business', 32, 7.50),
  ('outbound', '19:30'::time, 'Night Rider',    'AC',       40, 5.50),
  ('return',   '06:30'::time, 'Sindh Express',  'Standard', 40, 4.00),
  ('return',   '10:00'::time, 'Indus AC Coach', 'AC',       40, 5.50),
  ('return',   '15:00'::time, 'Royal Business', 'Business', 32, 7.50),
  ('return',   '20:00'::time, 'Night Rider',    'AC',       40, 5.50)
) as v(direction, start_time, bus_name, bus_type, total_seats, rate_per_km)
where not exists (select 1 from public.trips);

-- ---------------------------------------------------------------------
-- 4) BOOKINGS  (1 row = 1 seat; ek booking ki sab seats ka ticket_code same)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  ticket_code text not null,
  user_id     uuid not null references auth.users (id) on delete cascade,
  trip_id     uuid not null references public.trips (id),
  travel_date date not null,
  from_stop   uuid not null references public.stops (id),
  to_stop     uuid not null references public.stops (id),
  seat_no     int  not null,
  fare        int  not null,
  status      text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at  timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings (user_id, travel_date desc);
create index if not exists bookings_code_idx on public.bookings (ticket_code);

-- double booking rokne ke liye: ek seat, ek trip, ek date = sirf ek confirmed booking
create unique index if not exists bookings_unique_seat
  on public.bookings (trip_id, travel_date, seat_no)
  where status = 'confirmed';

alter table public.bookings enable row level security;
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);
-- NOTE: insert/update ke liye koi policy nahi: booking sirf neeche wale functions se hoti hai.

-- ---------------------------------------------------------------------
-- 5) FUNCTIONS (RPC)
-- ---------------------------------------------------------------------

-- Booked seats (sab users ke) - sirf seat numbers, koi personal data nahi
create or replace function public.get_taken_seats(p_trip uuid, p_date date)
returns int[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(seat_no order by seat_no), '{}')
  from public.bookings
  where trip_id = p_trip and travel_date = p_date and status = 'confirmed';
$$;

-- Ek din ki sab trips ka booked count (search results ke liye)
create or replace function public.get_trip_availability(p_date date)
returns table (trip_id uuid, taken int)
language sql
stable
security definer
set search_path = public
as $$
  select trip_id, count(*)::int
  from public.bookings
  where travel_date = p_date and status = 'confirmed'
  group by trip_id;
$$;

-- Ticket book karna: fare server par calculate hota hai (client par bharosa nahi)
create or replace function public.book_tickets(
  p_trip  uuid,
  p_date  date,
  p_from  uuid,
  p_to    uuid,
  p_seats int[]
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_trip public.trips%rowtype;
  v_from public.stops%rowtype;
  v_to   public.stops%rowtype;
  v_fare int;
  v_code text;
  v_seat int;
begin
  if v_uid is null then
    raise exception 'Pehle login karein';
  end if;

  if p_seats is null or coalesce(array_length(p_seats, 1), 0) not between 1 and 4 then
    raise exception 'Ek booking mein 1 se 4 seats select karein';
  end if;

  if p_date < (now() at time zone 'Asia/Karachi')::date then
    raise exception 'Guzri hui date par booking nahi ho sakti';
  end if;

  select * into v_trip from public.trips where id = p_trip and active;
  if not found then raise exception 'Trip nahi mili'; end if;

  select * into v_from from public.stops where id = p_from;
  select * into v_to   from public.stops where id = p_to;
  if v_from.id is null or v_to.id is null or v_from.id = v_to.id then
    raise exception 'Boarding aur drop-off alag hone chahiye';
  end if;

  if (v_trip.direction = 'outbound' and v_from.seq >= v_to.seq)
     or (v_trip.direction = 'return' and v_from.seq <= v_to.seq) then
    raise exception 'Yeh trip is direction mein nahi chalti';
  end if;

  v_fare := round(abs(v_to.km - v_from.km) * v_trip.rate_per_km);
  v_code := 'SG' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  foreach v_seat in array p_seats loop
    if v_seat < 1 or v_seat > v_trip.total_seats then
      raise exception 'Seat % durust nahi hai', v_seat;
    end if;
    begin
      insert into public.bookings
        (ticket_code, user_id, trip_id, travel_date, from_stop, to_stop, seat_no, fare)
      values
        (v_code, v_uid, p_trip, p_date, p_from, p_to, v_seat, v_fare);
    exception when unique_violation then
      raise exception 'Seat % pehle hi book ho chuki hai', v_seat;
    end;
  end loop;

  return v_code;
end;
$$;

-- Ticket cancel (sirf apni, aur sirf aaj/aane wali date ki)
create or replace function public.cancel_tickets(p_code text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Pehle login karein';
  end if;

  update public.bookings
     set status = 'cancelled'
   where ticket_code = p_code
     and user_id = auth.uid()
     and status = 'confirmed'
     and travel_date >= (now() at time zone 'Asia/Karachi')::date;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Sirf login user functions chala sakein; anon ko sirf seat-info dekhna allowed
revoke all on function public.book_tickets(uuid, date, uuid, uuid, int[]) from public, anon;
revoke all on function public.cancel_tickets(text) from public, anon;
grant execute on function public.book_tickets(uuid, date, uuid, uuid, int[]) to authenticated;
grant execute on function public.cancel_tickets(text) to authenticated;
grant execute on function public.get_taken_seats(uuid, date) to anon, authenticated;
grant execute on function public.get_trip_availability(date) to anon, authenticated;
