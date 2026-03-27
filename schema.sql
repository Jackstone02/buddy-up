-- ============================================================
-- Buddy Up — Supabase Schema
-- Schema: buddy_up
--
-- HOW TO RUN:
-- 1. Paste entire file into Supabase SQL Editor and run.
-- 2. Safe to re-run: uses IF NOT EXISTS, OR REPLACE, DROP IF EXISTS.
-- ============================================================

-- ============================================================
-- SCHEMA SETUP
-- ============================================================

create schema if not exists buddy_up;

-- Grant access to Supabase built-in roles
grant usage on schema buddy_up to anon, authenticated, service_role;

-- Auto-grant permissions on any future tables created in this schema
alter default privileges in schema buddy_up
  grant all on tables to authenticated, service_role;
alter default privileges in schema buddy_up
  grant select on tables to anon;
alter default privileges in schema buddy_up
  grant all on sequences to authenticated, service_role;

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- CORE TABLES (MVP)
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
-- Extends auth.users. Auto-created via trigger on signup.
create table if not exists buddy_up.profiles (
  id                  uuid primary key references auth.users on delete cascade,
  role                text check (role in ('beginner','certified','instructor','admin')),
  display_name        text,
  city_region         text,
  bio                 text default '',
  avatar_url          text,
  age_confirmed       boolean default false,
  tos_accepted_at     timestamptz,
  verification_status text default 'none'
                      check (verification_status in ('none','pending','verified','rejected')),
  available_to_dive   boolean default false,
  latitude            double precision,
  longitude           double precision,
  -- V2: payments & push notifications (stubbed, no UI yet)
  stripe_customer_id  text,
  push_token          text,
  created_at          timestamptz default now()
);

-- Auto-create stub profile row whenever a user registers
create or replace function buddy_up.handle_new_user()
returns trigger language plpgsql security definer
set search_path = buddy_up
as $$
begin
  insert into buddy_up.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure buddy_up.handle_new_user();

-- ─── certified_profiles ─────────────────────────────────────
create table if not exists buddy_up.certified_profiles (
  id                uuid primary key references buddy_up.profiles on delete cascade,
  cert_level        text,
  agency            text,
  years_experience  int default 0,
  disciplines       text[] default '{}',
  cert_card_url     text
);

-- ─── instructor_profiles ────────────────────────────────────
create table if not exists buddy_up.instructor_profiles (
  id                uuid primary key references buddy_up.profiles on delete cascade,
  teaching_location text,
  agencies          text[] default '{}',
  certs_offered     text[] default '{}',
  years_teaching    int default 0,
  credentials_url   text
);

-- ─── lesson_types ───────────────────────────────────────────
create table if not exists buddy_up.lesson_types (
  id                uuid primary key default gen_random_uuid(),
  instructor_id     uuid references buddy_up.profiles on delete cascade,
  name              text not null,
  duration_minutes  int default 60,
  skill_level       text default 'beginner'
                    check (skill_level in ('beginner','intermediate','advanced')),
  session_format    text default 'open_water'
                    check (session_format in ('pool','open_water','theory')),
  price             int default 0,
  max_participants  int default 1
);

-- ─── availability_slots ──────────────────────────────────────
create table if not exists buddy_up.availability_slots (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid references buddy_up.profiles on delete cascade,
  slot_date     date not null,
  start_time    time not null,
  end_time      time not null,
  is_booked     boolean default false
);

-- ─── bookings ────────────────────────────────────────────────
create table if not exists buddy_up.bookings (
  id                   uuid primary key default gen_random_uuid(),
  customer_id          uuid references buddy_up.profiles on delete cascade,
  instructor_id        uuid references buddy_up.profiles on delete cascade,
  lesson_type_id       uuid references buddy_up.lesson_types on delete set null,
  availability_slot_id uuid references buddy_up.availability_slots on delete set null,
  booking_date         date not null,
  start_time           time not null,
  participants_count   int default 1,
  notes                text,
  status               text default 'pending'
                       check (status in ('pending','confirmed','completed','cancelled')),
  -- V2: payment fields (stubbed, no UI yet)
  payment_status       text default 'unpaid'
                       check (payment_status in ('unpaid','paid','refunded')),
  payment_intent_id    text,
  amount_paid_cents    int,
  created_at           timestamptz default now()
);

-- ─── messages ───────────────────────────────────────────────
create table if not exists buddy_up.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references buddy_up.profiles on delete cascade,
  receiver_id uuid references buddy_up.profiles on delete cascade,
  content     text not null,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

-- ─── reports ────────────────────────────────────────────────
create table if not exists buddy_up.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references buddy_up.profiles on delete cascade,
  reported_id  uuid references buddy_up.profiles on delete cascade,
  reason       text,
  details      text,
  status       text default 'open' check (status in ('open','resolved')),
  created_at   timestamptz default now()
);

-- ─── blocks ─────────────────────────────────────────────────
create table if not exists buddy_up.blocks (
  blocker_id  uuid references buddy_up.profiles on delete cascade,
  blocked_id  uuid references buddy_up.profiles on delete cascade,
  created_at  timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- ============================================================
-- V2 TABLES (stubbed — schema ready, no UI yet)
-- ============================================================

-- ─── dive_logs ───────────────────────────────────────────────
create table if not exists buddy_up.dive_logs (
  id             uuid primary key default gen_random_uuid(),
  diver_id       uuid references buddy_up.profiles on delete cascade,
  buddy_id       uuid references buddy_up.profiles on delete set null,
  log_date       date not null,
  location_name  text,
  latitude       double precision,
  longitude      double precision,
  max_depth_m    numeric(5,1),
  duration_min   int,
  discipline     text check (discipline in ('pool','depth','dynamic','static','spearfishing','other')),
  notes          text,
  created_at     timestamptz default now()
);

-- ─── sos_sessions ────────────────────────────────────────────
-- Live location share during a dive. Realtime-enabled.
create table if not exists buddy_up.sos_sessions (
  id          uuid primary key default gen_random_uuid(),
  diver_id    uuid references buddy_up.profiles on delete cascade,
  latitude    double precision,
  longitude   double precision,
  is_active   boolean default true,
  started_at  timestamptz default now(),
  ended_at    timestamptz,
  notes       text
);

create table if not exists buddy_up.sos_watchers (
  sos_session_id  uuid references buddy_up.sos_sessions on delete cascade,
  watcher_id      uuid references buddy_up.profiles on delete cascade,
  primary key (sos_session_id, watcher_id)
);

-- ─── group_dives ─────────────────────────────────────────────
create table if not exists buddy_up.group_dives (
  id               uuid primary key default gen_random_uuid(),
  organizer_id     uuid references buddy_up.profiles on delete cascade,
  title            text not null,
  description      text,
  location_name    text,
  latitude         double precision,
  longitude        double precision,
  scheduled_at     timestamptz not null,
  max_participants int default 8,
  status           text default 'open'
                   check (status in ('open','full','cancelled','completed')),
  created_at       timestamptz default now()
);

create table if not exists buddy_up.group_dive_members (
  group_dive_id  uuid references buddy_up.group_dives on delete cascade,
  user_id        uuid references buddy_up.profiles on delete cascade,
  status         text default 'invited'
                 check (status in ('invited','confirmed','declined')),
  joined_at      timestamptz default now(),
  primary key (group_dive_id, user_id)
);

-- ─── ratings ─────────────────────────────────────────────────
-- Tied to a booking — one rating per booking, prevents fabrication.
create table if not exists buddy_up.ratings (
  id           uuid primary key default gen_random_uuid(),
  reviewer_id  uuid references buddy_up.profiles on delete cascade,
  reviewed_id  uuid references buddy_up.profiles on delete cascade,
  booking_id   uuid references buddy_up.bookings on delete set null,
  score        smallint not null check (score between 1 and 5),
  comment      text,
  created_at   timestamptz default now(),
  unique (reviewer_id, booking_id)
);

-- ─── dive_shops ──────────────────────────────────────────────
-- Admin-populated physical dive shop locator. Write via service_role only.
create table if not exists buddy_up.dive_shops (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  address      text,
  city         text,
  country      text,
  latitude     double precision,
  longitude    double precision,
  phone        text,
  website      text,
  description  text,
  verified     boolean default false,
  created_at   timestamptz default now()
);

-- ─── marketplace_shops ───────────────────────────────────────
-- Any user can open one seller shop (unique per user).
create table if not exists buddy_up.marketplace_shops (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references buddy_up.profiles on delete cascade unique,
  shop_name  text not null,
  bio        text,
  logo_url   text,
  location   text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ─── marketplace_listings ────────────────────────────────────
-- price_cents = integer cents (e.g. 2500 = $25.00, avoids float rounding).
-- image_urls = array of Supabase Storage URLs.
create table if not exists buddy_up.marketplace_listings (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid references buddy_up.marketplace_shops on delete cascade,
  seller_id    uuid references buddy_up.profiles on delete cascade,
  title        text not null,
  description  text,
  category     text check (category in (
                 'fins','mask','wetsuit','computer','line',
                 'buoy','freediving_suit','speargun','other'
               )),
  condition    text default 'used_good'
               check (condition in ('new','used_like_new','used_good','used_fair')),
  price_cents  int not null,
  currency     text default 'USD',
  quantity     int default 1,
  image_urls   text[] default '{}',
  status       text default 'active'
               check (status in ('active','sold','paused','removed')),
  created_at   timestamptz default now()
);

-- ─── marketplace_orders ──────────────────────────────────────
-- payment_intent_id wired to Stripe in V2.
create table if not exists buddy_up.marketplace_orders (
  id                uuid primary key default gen_random_uuid(),
  listing_id        uuid references buddy_up.marketplace_listings on delete set null,
  buyer_id          uuid references buddy_up.profiles on delete cascade,
  seller_id         uuid references buddy_up.profiles on delete cascade,
  quantity          int default 1,
  total_cents       int not null,
  currency          text default 'USD',
  status            text default 'pending'
                    check (status in ('pending','paid','shipped','completed','cancelled','refunded')),
  payment_status    text default 'unpaid'
                    check (payment_status in ('unpaid','paid','refunded')),
  payment_intent_id text,
  shipping_address  text,
  notes             text,
  created_at        timestamptz default now()
);

-- ─── marketplace_reviews ─────────────────────────────────────
-- unique(order_id) = one review per completed order, no spam.
create table if not exists buddy_up.marketplace_reviews (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references buddy_up.marketplace_orders on delete cascade unique,
  reviewer_id  uuid references buddy_up.profiles on delete cascade,
  seller_id    uuid references buddy_up.profiles on delete cascade,
  score        smallint not null check (score between 1 and 5),
  comment      text,
  created_at   timestamptz default now()
);

-- ============================================================
-- REALTIME
-- Wrapped in DO blocks so re-runs don't fail if already added.
-- ============================================================

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'buddy_up' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table buddy_up.messages;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'buddy_up' and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table buddy_up.bookings;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'buddy_up' and tablename = 'sos_sessions'
  ) then
    alter publication supabase_realtime add table buddy_up.sos_sessions;
  end if;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- Drop policies first so this file is safe to re-run.
-- ============================================================

-- ─── profiles ───────────────────────────────────────────────
alter table buddy_up.profiles enable row level security;

drop policy if exists "profiles: read by authenticated"  on buddy_up.profiles;
drop policy if exists "profiles: insert own"             on buddy_up.profiles;
drop policy if exists "profiles: write own row"          on buddy_up.profiles;

create policy "profiles: read by authenticated"
  on buddy_up.profiles for select
  to authenticated using (true);

-- Needed for OAuth edge cases where trigger fires after app upsert
create policy "profiles: insert own"
  on buddy_up.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles: write own row"
  on buddy_up.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── certified_profiles ─────────────────────────────────────
alter table buddy_up.certified_profiles enable row level security;

drop policy if exists "certified_profiles: read by authenticated" on buddy_up.certified_profiles;
drop policy if exists "certified_profiles: write own row"         on buddy_up.certified_profiles;

create policy "certified_profiles: read by authenticated"
  on buddy_up.certified_profiles for select
  to authenticated using (true);

create policy "certified_profiles: write own row"
  on buddy_up.certified_profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── instructor_profiles ────────────────────────────────────
alter table buddy_up.instructor_profiles enable row level security;

drop policy if exists "instructor_profiles: read by authenticated" on buddy_up.instructor_profiles;
drop policy if exists "instructor_profiles: write own row"         on buddy_up.instructor_profiles;

create policy "instructor_profiles: read by authenticated"
  on buddy_up.instructor_profiles for select
  to authenticated using (true);

create policy "instructor_profiles: write own row"
  on buddy_up.instructor_profiles for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── messages ───────────────────────────────────────────────
alter table buddy_up.messages enable row level security;

drop policy if exists "messages: read own"           on buddy_up.messages;
drop policy if exists "messages: insert as sender"   on buddy_up.messages;
drop policy if exists "messages: update own received" on buddy_up.messages;

create policy "messages: read own"
  on buddy_up.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages: insert as sender"
  on buddy_up.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "messages: update own received"
  on buddy_up.messages for update
  to authenticated
  using (auth.uid() = receiver_id);

-- ─── reports ────────────────────────────────────────────────
alter table buddy_up.reports enable row level security;

drop policy if exists "reports: insert by authenticated" on buddy_up.reports;

create policy "reports: insert by authenticated"
  on buddy_up.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- ─── blocks ─────────────────────────────────────────────────
alter table buddy_up.blocks enable row level security;

drop policy if exists "blocks: manage own" on buddy_up.blocks;

create policy "blocks: manage own"
  on buddy_up.blocks for all
  to authenticated
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- ─── lesson_types ───────────────────────────────────────────
alter table buddy_up.lesson_types enable row level security;

drop policy if exists "lesson_types: read by authenticated" on buddy_up.lesson_types;
drop policy if exists "lesson_types: write own"             on buddy_up.lesson_types;

create policy "lesson_types: read by authenticated"
  on buddy_up.lesson_types for select
  to authenticated using (true);

create policy "lesson_types: write own"
  on buddy_up.lesson_types for all
  to authenticated
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- ─── availability_slots ──────────────────────────────────────
alter table buddy_up.availability_slots enable row level security;

drop policy if exists "availability_slots: read by authenticated" on buddy_up.availability_slots;
drop policy if exists "availability_slots: write own"             on buddy_up.availability_slots;

create policy "availability_slots: read by authenticated"
  on buddy_up.availability_slots for select
  to authenticated using (true);

create policy "availability_slots: write own"
  on buddy_up.availability_slots for all
  to authenticated
  using (auth.uid() = instructor_id)
  with check (auth.uid() = instructor_id);

-- ─── bookings ────────────────────────────────────────────────
alter table buddy_up.bookings enable row level security;

drop policy if exists "bookings: read own"        on buddy_up.bookings;
drop policy if exists "bookings: insert as customer" on buddy_up.bookings;
drop policy if exists "bookings: update own"      on buddy_up.bookings;

create policy "bookings: read own"
  on buddy_up.bookings for select
  to authenticated
  using (auth.uid() = customer_id or auth.uid() = instructor_id);

create policy "bookings: insert as customer"
  on buddy_up.bookings for insert
  to authenticated
  with check (auth.uid() = customer_id);

create policy "bookings: update own"
  on buddy_up.bookings for update
  to authenticated
  using (auth.uid() = customer_id or auth.uid() = instructor_id);

-- ─── dive_logs ───────────────────────────────────────────────
alter table buddy_up.dive_logs enable row level security;

drop policy if exists "dive_logs: own only" on buddy_up.dive_logs;

create policy "dive_logs: own only"
  on buddy_up.dive_logs for all
  to authenticated
  using (auth.uid() = diver_id)
  with check (auth.uid() = diver_id);

-- ─── sos_sessions ────────────────────────────────────────────
alter table buddy_up.sos_sessions enable row level security;

drop policy if exists "sos_sessions: own or watcher" on buddy_up.sos_sessions;
drop policy if exists "sos_sessions: insert own"     on buddy_up.sos_sessions;
drop policy if exists "sos_sessions: update own"     on buddy_up.sos_sessions;

create policy "sos_sessions: own or watcher"
  on buddy_up.sos_sessions for select
  to authenticated
  using (
    auth.uid() = diver_id or
    exists (
      select 1 from buddy_up.sos_watchers w
      where w.sos_session_id = id and w.watcher_id = auth.uid()
    )
  );

create policy "sos_sessions: insert own"
  on buddy_up.sos_sessions for insert
  to authenticated
  with check (auth.uid() = diver_id);

create policy "sos_sessions: update own"
  on buddy_up.sos_sessions for update
  to authenticated
  using (auth.uid() = diver_id);

-- ─── sos_watchers ────────────────────────────────────────────
alter table buddy_up.sos_watchers enable row level security;

drop policy if exists "sos_watchers: diver manages"  on buddy_up.sos_watchers;
drop policy if exists "sos_watchers: watcher reads own" on buddy_up.sos_watchers;

create policy "sos_watchers: diver manages"
  on buddy_up.sos_watchers for all
  to authenticated
  using (
    exists (
      select 1 from buddy_up.sos_sessions s
      where s.id = sos_session_id and s.diver_id = auth.uid()
    )
  );

create policy "sos_watchers: watcher reads own"
  on buddy_up.sos_watchers for select
  to authenticated
  using (auth.uid() = watcher_id);

-- ─── group_dives ─────────────────────────────────────────────
alter table buddy_up.group_dives enable row level security;

drop policy if exists "group_dives: read all authenticated" on buddy_up.group_dives;
drop policy if exists "group_dives: write own"              on buddy_up.group_dives;

create policy "group_dives: read all authenticated"
  on buddy_up.group_dives for select
  to authenticated using (true);

create policy "group_dives: write own"
  on buddy_up.group_dives for all
  to authenticated
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

-- ─── group_dive_members ──────────────────────────────────────
alter table buddy_up.group_dive_members enable row level security;

drop policy if exists "group_dive_members: read own or organizer" on buddy_up.group_dive_members;
drop policy if exists "group_dive_members: write own"             on buddy_up.group_dive_members;

create policy "group_dive_members: read own or organizer"
  on buddy_up.group_dive_members for select
  to authenticated
  using (
    auth.uid() = user_id or
    exists (
      select 1 from buddy_up.group_dives g
      where g.id = group_dive_id and g.organizer_id = auth.uid()
    )
  );

create policy "group_dive_members: write own"
  on buddy_up.group_dive_members for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── ratings ─────────────────────────────────────────────────
alter table buddy_up.ratings enable row level security;

drop policy if exists "ratings: read all authenticated" on buddy_up.ratings;
drop policy if exists "ratings: insert own"             on buddy_up.ratings;

create policy "ratings: read all authenticated"
  on buddy_up.ratings for select
  to authenticated using (true);

create policy "ratings: insert own"
  on buddy_up.ratings for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

-- ─── dive_shops ──────────────────────────────────────────────
-- Write access via service_role only (admin populates via Supabase dashboard).
alter table buddy_up.dive_shops enable row level security;

drop policy if exists "dive_shops: read all authenticated" on buddy_up.dive_shops;

create policy "dive_shops: read all authenticated"
  on buddy_up.dive_shops for select
  to authenticated using (true);

-- ─── marketplace_shops ───────────────────────────────────────
alter table buddy_up.marketplace_shops enable row level security;

drop policy if exists "marketplace_shops: read active" on buddy_up.marketplace_shops;
drop policy if exists "marketplace_shops: write own"   on buddy_up.marketplace_shops;

create policy "marketplace_shops: read active"
  on buddy_up.marketplace_shops for select
  to authenticated
  using (is_active = true);

create policy "marketplace_shops: write own"
  on buddy_up.marketplace_shops for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─── marketplace_listings ────────────────────────────────────
alter table buddy_up.marketplace_listings enable row level security;

drop policy if exists "marketplace_listings: read active or own" on buddy_up.marketplace_listings;
drop policy if exists "marketplace_listings: write own"          on buddy_up.marketplace_listings;

create policy "marketplace_listings: read active or own"
  on buddy_up.marketplace_listings for select
  to authenticated
  using (status = 'active' or auth.uid() = seller_id);

create policy "marketplace_listings: write own"
  on buddy_up.marketplace_listings for all
  to authenticated
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

-- ─── marketplace_orders ──────────────────────────────────────
alter table buddy_up.marketplace_orders enable row level security;

drop policy if exists "marketplace_orders: read buyer or seller"  on buddy_up.marketplace_orders;
drop policy if exists "marketplace_orders: insert as buyer"       on buddy_up.marketplace_orders;
drop policy if exists "marketplace_orders: update buyer or seller" on buddy_up.marketplace_orders;

create policy "marketplace_orders: read buyer or seller"
  on buddy_up.marketplace_orders for select
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "marketplace_orders: insert as buyer"
  on buddy_up.marketplace_orders for insert
  to authenticated
  with check (auth.uid() = buyer_id);

create policy "marketplace_orders: update buyer or seller"
  on buddy_up.marketplace_orders for update
  to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- ─── marketplace_reviews ─────────────────────────────────────
alter table buddy_up.marketplace_reviews enable row level security;

drop policy if exists "marketplace_reviews: read all authenticated" on buddy_up.marketplace_reviews;
drop policy if exists "marketplace_reviews: insert own"             on buddy_up.marketplace_reviews;

create policy "marketplace_reviews: read all authenticated"
  on buddy_up.marketplace_reviews for select
  to authenticated using (true);

create policy "marketplace_reviews: insert own"
  on buddy_up.marketplace_reviews for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

-- ============================================================
-- STORAGE BUCKETS
-- Uncomment and run separately if not configuring via Dashboard.
-- ============================================================
-- insert into storage.buckets (id, name, public) values
--   ('buddy-up', 'buddy-up', true)
-- on conflict do nothing;
--
-- Folder structure inside the 'buddy-up' bucket:
--   avatars/         → profile photos        (path: avatars/{user_id})
--   certs/           → cert card uploads     (path: certs/{user_id})
--   credentials/     → instructor credentials (path: credentials/{user_id})
--   marketplace/     → listing photos        (path: marketplace/{user_id}/{listing_id})
--   shop-logos/      → shop logos            (path: shop-logos/{user_id})
--
-- Storage RLS: set in Dashboard > Storage > buddy-up > Policies
-- Rule: authenticated users can upload only to paths starting with their user ID.

-- ============================================================
-- INDEXES
-- ============================================================

-- profiles
create index if not exists idx_profiles_role         on buddy_up.profiles(role);
create index if not exists idx_profiles_verification  on buddy_up.profiles(verification_status);
create index if not exists idx_profiles_city          on buddy_up.profiles(city_region);
create index if not exists idx_profiles_available     on buddy_up.profiles(available_to_dive) where available_to_dive = true;
create index if not exists idx_profiles_location      on buddy_up.profiles(latitude, longitude) where latitude is not null;

-- messages
create index if not exists idx_messages_receiver      on buddy_up.messages(receiver_id, created_at desc);
create index if not exists idx_messages_sender        on buddy_up.messages(sender_id, created_at desc);

-- lesson_types / slots / bookings
create index if not exists idx_lesson_types_instructor on buddy_up.lesson_types(instructor_id);
create index if not exists idx_slots_instructor_date   on buddy_up.availability_slots(instructor_id, slot_date);
create index if not exists idx_bookings_customer       on buddy_up.bookings(customer_id, booking_date);
create index if not exists idx_bookings_instructor     on buddy_up.bookings(instructor_id, booking_date);

-- dive_logs
create index if not exists idx_dive_logs_diver         on buddy_up.dive_logs(diver_id, log_date desc);

-- group_dives
create index if not exists idx_group_dives_organizer   on buddy_up.group_dives(organizer_id);
create index if not exists idx_group_dives_scheduled   on buddy_up.group_dives(scheduled_at) where status = 'open';

-- ratings
create index if not exists idx_ratings_reviewed        on buddy_up.ratings(reviewed_id);
create index if not exists idx_ratings_booking         on buddy_up.ratings(booking_id);

-- dive_shops
create index if not exists idx_dive_shops_location     on buddy_up.dive_shops(latitude, longitude) where latitude is not null;
create index if not exists idx_dive_shops_city         on buddy_up.dive_shops(city);

-- marketplace
create index if not exists idx_listings_seller         on buddy_up.marketplace_listings(seller_id);
create index if not exists idx_listings_category       on buddy_up.marketplace_listings(category) where status = 'active';
create index if not exists idx_listings_status         on buddy_up.marketplace_listings(status);
create index if not exists idx_orders_buyer            on buddy_up.marketplace_orders(buyer_id, created_at desc);
create index if not exists idx_orders_seller           on buddy_up.marketplace_orders(seller_id, created_at desc);
create index if not exists idx_mkt_reviews_seller      on buddy_up.marketplace_reviews(seller_id);
