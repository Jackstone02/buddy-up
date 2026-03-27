# Buddy Up — Founder Action Plan Implementation

## Context
The Founder Action Plan defines the app's purpose, user roles, required screens, safety/legal requirements, and a future feature roadmap. The codebase is already substantially built. This plan maps the founder's requirements against what exists, identifies the gaps, and outlines what needs to be done — including database stubs that future-proof V2 features so they can be added without breaking schema changes.

---

## What's Already Built (No Action Needed)

| Founder Requirement | Status |
|---|---|
| Welcome screen | ✅ `src/screens/auth/WelcomeScreen.tsx` |
| Sign up screen | ✅ `src/screens/auth/SignUpScreen.tsx` |
| Role selection at signup | ✅ Inline in SignUpScreen + `RoleSelectionScreen.tsx` |
| Profile setup (all 3 roles) | ✅ `ProfileSetupBeginner/Certified/InstructorScreen.tsx` |
| Buddy search (certified only) | ✅ `src/screens/buddy/FindBuddyScreen.tsx` |
| Instructor search (open to all) | ✅ `src/screens/instructor/FindInstructorScreen.tsx` |
| 1-on-1 chat | ✅ `src/screens/shared/MessagingScreen.tsx` |
| Safety disclaimer screen | ✅ `src/screens/shared/SafetyScreen.tsx` |
| Age 18+ gate at signup | ✅ Checkbox in SignUpScreen, blocks submit |
| Verification system (cert upload + badge) | ✅ `VerificationPendingScreen.tsx` + admin review |
| Report & block users | ✅ `ReportScreen.tsx` + `blocks` table |
| Role-based access control | ✅ Beginners cannot buddy-up, only find instructors |
| "Never Dive Alone" messaging | ✅ Tagline on WelcomeScreen + rules on SafetyScreen |
| Connection-only disclaimer | ✅ SafetyScreen rule #3 and disclaimer box |
| Emergency protocol note | ✅ SafetyScreen rule #4 |
| Admin verification management | ✅ `AdminVerificationsScreen.tsx` |

---

## MVP Gaps — What to Build Now

### 1. Formal Terms of Service Screen (Non-Negotiable Legal)
SafetyScreen has operational rules but no dedicated legal ToS the user formally agrees to.

**New file:** `src/screens/auth/TermsOfServiceScreen.tsx`
- Scrollable document with: full ToS, connection-only disclaimer, no-liability clause, emergency note (call 112/911), age requirement, conduct rules
- "Accept & Continue" button only activates after user scrolls to the bottom (`onScroll` + `contentSize` check)
- On accept: writes `tos_accepted_at = now()` to `profiles` row in Supabase

**Placement in auth flow:**
```
SignUp → ProfileSetup → TermsOfService → Safety → [Role Tabs]
```
Only shown once. If `tos_accepted_at` is already set, skip it.

**Files to touch:**
- `src/screens/auth/TermsOfServiceScreen.tsx` — new file
- `src/types/index.ts` — add `TermsOfService` to `RootStackParamList`
- `src/navigation/AppNavigator.tsx` — register screen
- `src/screens/auth/SignUpScreen.tsx` — add "View Terms" tappable link

### 2. ToS Checkbox at Signup
Add a second checkbox to SignUpScreen below the 18+ checkbox:
> "I agree to the [Terms of Service]" (tappable link opens ToS as modal)

Block "Create Account" if not checked. Also enforce for Google/Apple social signups (show ToS modal on first launch if `tos_accepted_at` is null).

**Files to touch:**
- `src/screens/auth/SignUpScreen.tsx` — add `tosAccepted` state + link

### 3. Schema: `tos_accepted_at` on profiles
```sql
alter table profiles add column if not exists tos_accepted_at timestamptz;
```

### 4. Remove Demo Mode (Pre-Launch)
Strip all `// DEMO MODE` blocks from ~15 screens and delete `src/lib/mockData.ts`. The WelcomeScreen has 4 demo buttons that must be removed before app store submission.

---

## Database Future-Proofing (V2 Tables — Stub Now, Build Later)

Add these tables to `schema.sql` now. They have no UI yet but the schema is in place so V2 features won't require breaking migrations or data backfills.

### Existing table additions

```sql
-- profiles: future payment + push notification support
alter table profiles add column if not exists tos_accepted_at        timestamptz;
alter table profiles add column if not exists stripe_customer_id     text;
alter table profiles add column if not exists push_token             text;

-- bookings: future payment support
alter table bookings add column if not exists payment_status         text default 'unpaid'
  check (payment_status in ('unpaid','paid','refunded'));
alter table bookings add column if not exists payment_intent_id      text;
alter table bookings add column if not exists amount_paid_cents      int;
```

### New stub tables

#### Dive Logs
```sql
create table if not exists dive_logs (
  id             uuid primary key default gen_random_uuid(),
  diver_id       uuid references profiles on delete cascade,
  buddy_id       uuid references profiles on delete set null,  -- who they dived with
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
alter table dive_logs enable row level security;
create policy "dive_logs: own only"
  on dive_logs for all to authenticated
  using (auth.uid() = diver_id) with check (auth.uid() = diver_id);
create index if not exists idx_dive_logs_diver on dive_logs(diver_id, log_date desc);
```

#### SOS / Live Location Sessions
```sql
create table if not exists sos_sessions (
  id           uuid primary key default gen_random_uuid(),
  diver_id     uuid references profiles on delete cascade,
  latitude     double precision,
  longitude    double precision,
  is_active    boolean default true,
  started_at   timestamptz default now(),
  ended_at     timestamptz,
  notes        text  -- e.g. "diving at Blue Hole, back by 3pm"
);
-- Watchers (people who can see the SOS location)
create table if not exists sos_watchers (
  sos_session_id  uuid references sos_sessions on delete cascade,
  watcher_id      uuid references profiles on delete cascade,
  primary key (sos_session_id, watcher_id)
);
alter table sos_sessions enable row level security;
alter table sos_watchers enable row level security;
create policy "sos_sessions: own or watcher"
  on sos_sessions for select to authenticated
  using (
    auth.uid() = diver_id or
    exists (select 1 from sos_watchers w where w.sos_session_id = id and w.watcher_id = auth.uid())
  );
create policy "sos_sessions: insert own"
  on sos_sessions for insert to authenticated
  with check (auth.uid() = diver_id);
create policy "sos_sessions: update own"
  on sos_sessions for update to authenticated
  using (auth.uid() = diver_id);
```

#### Group Dives
```sql
create table if not exists group_dives (
  id               uuid primary key default gen_random_uuid(),
  organizer_id     uuid references profiles on delete cascade,
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
create table if not exists group_dive_members (
  group_dive_id  uuid references group_dives on delete cascade,
  user_id        uuid references profiles on delete cascade,
  status         text default 'invited'
                 check (status in ('invited','confirmed','declined')),
  joined_at      timestamptz default now(),
  primary key (group_dive_id, user_id)
);
alter table group_dives enable row level security;
alter table group_dive_members enable row level security;
create policy "group_dives: read all authenticated"
  on group_dives for select to authenticated using (true);
create policy "group_dives: write own"
  on group_dives for all to authenticated
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);
create policy "group_dive_members: read own"
  on group_dive_members for select to authenticated
  using (auth.uid() = user_id or
         exists (select 1 from group_dives g where g.id = group_dive_id and g.organizer_id = auth.uid()));
create policy "group_dive_members: write own"
  on group_dive_members for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_group_dives_organizer on group_dives(organizer_id);
create index if not exists idx_group_dives_scheduled on group_dives(scheduled_at) where status = 'open';
```

#### Ratings
```sql
-- One rating per reviewer per booking (not open-ended)
create table if not exists ratings (
  id           uuid primary key default gen_random_uuid(),
  reviewer_id  uuid references profiles on delete cascade,
  reviewed_id  uuid references profiles on delete cascade,
  booking_id   uuid references bookings on delete set null,  -- ties rating to a real dive
  score        smallint not null check (score between 1 and 5),
  comment      text,
  created_at   timestamptz default now(),
  unique (reviewer_id, booking_id)  -- one rating per booking
);
alter table ratings enable row level security;
create policy "ratings: read all authenticated"
  on ratings for select to authenticated using (true);
create policy "ratings: insert own"
  on ratings for insert to authenticated
  with check (auth.uid() = reviewer_id);
create index if not exists idx_ratings_reviewed on ratings(reviewed_id);
create index if not exists idx_ratings_booking  on ratings(booking_id);
```

#### Dive Shop Locator
```sql
-- Admin-populated, publicly readable
create table if not exists dive_shops (
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
alter table dive_shops enable row level security;
create policy "dive_shops: read all authenticated"
  on dive_shops for select to authenticated using (true);
-- Insert/update restricted to admin (via service role or admin RLS check)
create index if not exists idx_dive_shops_location on dive_shops(latitude, longitude) where latitude is not null;
create index if not exists idx_dive_shops_city on dive_shops(city);
```

#### Marketplace (Peer-to-Peer Gear Shop)
Any user can open a shop, post listings, and sell gear to other users. Buyers browse, purchase, and leave reviews. Payments via Stripe in V2.

```sql
-- Seller shop profiles (one per user, optional)
create table if not exists marketplace_shops (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles on delete cascade unique,
  shop_name    text not null,
  bio          text,
  logo_url     text,
  location     text,           -- city or region
  is_active    boolean default true,
  created_at   timestamptz default now()
);
alter table marketplace_shops enable row level security;
create policy "marketplace_shops: read active"
  on marketplace_shops for select to authenticated using (is_active = true);
create policy "marketplace_shops: write own"
  on marketplace_shops for all to authenticated
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Listings posted by sellers
create table if not exists marketplace_listings (
  id           uuid primary key default gen_random_uuid(),
  shop_id      uuid references marketplace_shops on delete cascade,
  seller_id    uuid references profiles on delete cascade,
  title        text not null,
  description  text,
  category     text check (category in ('fins','mask','wetsuit','computer','line','buoy','freediving_suit','speargun','other')),
  condition    text default 'used_good'
               check (condition in ('new','used_like_new','used_good','used_fair')),
  price_cents  int not null,          -- price in cents to avoid float rounding
  currency     text default 'USD',
  quantity     int default 1,
  image_urls   text[] default '{}',   -- array of Supabase Storage URLs
  status       text default 'active'
               check (status in ('active','sold','paused','removed')),
  created_at   timestamptz default now()
);
alter table marketplace_listings enable row level security;
create policy "marketplace_listings: read active"
  on marketplace_listings for select to authenticated using (status = 'active' or auth.uid() = seller_id);
create policy "marketplace_listings: write own"
  on marketplace_listings for all to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create index if not exists idx_listings_seller   on marketplace_listings(seller_id);
create index if not exists idx_listings_category on marketplace_listings(category) where status = 'active';
create index if not exists idx_listings_status   on marketplace_listings(status);

-- Orders (buyer purchases a listing)
create table if not exists marketplace_orders (
  id                  uuid primary key default gen_random_uuid(),
  listing_id          uuid references marketplace_listings on delete set null,
  buyer_id            uuid references profiles on delete cascade,
  seller_id           uuid references profiles on delete cascade,
  quantity            int default 1,
  total_cents         int not null,
  currency            text default 'USD',
  status              text default 'pending'
                      check (status in ('pending','paid','shipped','completed','cancelled','refunded')),
  payment_status      text default 'unpaid'
                      check (payment_status in ('unpaid','paid','refunded')),
  payment_intent_id   text,             -- Stripe PaymentIntent ID
  shipping_address    text,
  notes               text,
  created_at          timestamptz default now()
);
alter table marketplace_orders enable row level security;
create policy "marketplace_orders: read buyer or seller"
  on marketplace_orders for select to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "marketplace_orders: insert as buyer"
  on marketplace_orders for insert to authenticated
  with check (auth.uid() = buyer_id);
create policy "marketplace_orders: update buyer or seller"
  on marketplace_orders for update to authenticated
  using (auth.uid() = buyer_id or auth.uid() = seller_id);
create index if not exists idx_orders_buyer  on marketplace_orders(buyer_id, created_at desc);
create index if not exists idx_orders_seller on marketplace_orders(seller_id, created_at desc);

-- Seller reviews (buyer leaves review after completed order)
create table if not exists marketplace_reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid references marketplace_orders on delete cascade unique,  -- one review per order
  reviewer_id uuid references profiles on delete cascade,
  seller_id   uuid references profiles on delete cascade,
  score       smallint not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);
alter table marketplace_reviews enable row level security;
create policy "marketplace_reviews: read all authenticated"
  on marketplace_reviews for select to authenticated using (true);
create policy "marketplace_reviews: insert own"
  on marketplace_reviews for insert to authenticated
  with check (auth.uid() = reviewer_id);
create index if not exists idx_mkt_reviews_seller on marketplace_reviews(seller_id);
```

---

## Implementation Order

**MVP (do now):**
1. Add all `ALTER TABLE` and new stub table SQL to `schema.sql` — run in Supabase
2. Build `TermsOfServiceScreen.tsx`
3. Add ToS checkbox + link to `SignUpScreen.tsx`
4. Wire `TermsOfService` screen in `AppNavigator.tsx` and `types/index.ts`
5. Add ToS check in auth routing (skip if `tos_accepted_at` already set)
6. Strip demo mode when ready to go to production

**V2 (later — schema is ready):**
- Dive logs → UI for `dive_logs` table
- SOS → UI for `sos_sessions` + `sos_watchers` + push notifications via `push_token`
- Group dives → UI for `group_dives` + `group_dive_members`
- Ratings → UI for `ratings` (post-booking flow)
- Store locator → map screen reading `dive_shops`
- Marketplace → seller shop setup, listing creation with photo upload, browse/search listings, purchase flow, order tracking, seller reviews
- Payments → Stripe integration using `stripe_customer_id` on profiles + `payment_intent_id` on `marketplace_orders` and `bookings`

---

## Critical Files

| File | Change |
|---|---|
| `schema.sql` | Add all ALTER TABLE + new stub tables |
| `src/screens/auth/TermsOfServiceScreen.tsx` | New screen |
| `src/screens/auth/SignUpScreen.tsx` | Add ToS checkbox + link |
| `src/navigation/AppNavigator.tsx` | Register TermsOfService screen |
| `src/types/index.ts` | Add `TermsOfService` to `RootStackParamList` |

---

## Verification

1. Run updated `schema.sql` in Supabase — confirm all new tables exist with no errors
2. Fresh signup → ProfileSetup → ToS screen appears → scroll to bottom → accept → Safety → main app
3. Confirm `tos_accepted_at` is populated in Supabase `profiles` table
4. Second login → ToS screen should be skipped (already accepted)
5. Google/Apple sign-in → ToS modal shown on first launch if `tos_accepted_at` is null
6. Confirm `dive_logs`, `sos_sessions`, `group_dives`, `ratings`, `dive_shops`, `marketplace_shops`, `marketplace_listings`, `marketplace_orders`, `marketplace_reviews` tables exist in Supabase (empty, ready for V2)
