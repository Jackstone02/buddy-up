# Buddyline — Product & Go-to-Market Strategy

---

## Market Opportunity

- **No dominant global app exists yet** for freediving buddy matching
- Current platforms suffer from: low user density, lack of trust/safety validation, and regional fragmentation
- Divers still rely on Facebook groups, WhatsApp/Telegram, and dive schools
- Platforms like Mapnea, BuoyBuddy, and Beluga exist but **none have reached critical mass**

**Why this is a high-opportunity niche:**
- Buddy system is mandatory in freediving (safety requirement)
- Travel-heavy users need buddies in new locations constantly
- Strong, tight-knit community culture

---

## Where Current Apps Fall Short

### 1. No Real Trust Layer
Users don't know a stranger's skill level, certifications, or safety habits.
> In a sport where a mistake can mean blackout, people won't meet strangers without trust.

### 2. Low Local Density (the biggest killer)
"3 users within 50 km" = useless. Classic chicken-and-egg problem: no users → no value → no users.

### 3. Too "Social Media", Not Action-Oriented
Most apps show feeds, profiles, and posts. Freedivers want:
> "Can I dive tomorrow morning with someone safe?"

### 4. No Real Safety Infrastructure
None of the current apps support buddy protocols, dive plans, or emergency readiness — **massive opportunity**.

---

## Brand

**Name:** Buddyline

**Tagline (pick one, use consistently):**
- "Never dive alone." ← strongest
- "Dive together. Dive safer."
- "Your freediving buddy, anywhere."

**Visual Identity:**

| Element | Value |
|---|---|
| Deep Blue | `#0B3C5D` — trust, depth |
| Teal | `#1CA7A6` — water, life |
| Off-white | `#F4F1EA` — clean, calm |

**Logo concept:** Minimal vertical dive line with two small circles (divers) at different depths.

**Strategic positioning:**
> Not "Freediving social app" — **"The safest way to find a freediving buddy anywhere"**

---

## Core Product Loop

The entire app revolves around this single loop:

```
1. Open app → See available divers nearby
2. Take action → Join or create a dive
3. Chat briefly
4. Dive in real life
5. Come back and repeat
```

> If the app doesn't push users into this loop within 30 seconds, we lose them.

---

## Feature Priority

### V1 — Must-Have (build now)
- Location-based diver map/list
- Create / join dive sessions
- 1:1 chat
- Basic profile (max depth + dive type)

**CUT for V1:**
- Dive logs
- Social feed / posts
- Likes / comments
- Complex stats / gamification badges
- Too many filters

### V2 — Differentiators
- Certification verification (AIDA, SSI, PADI)
- Buddy ratings after sessions (safety awareness, reliability, communication)
- Pre-dive safety checklist ("Lanyard?" / "Recovery breathing reviewed?")
- Dive plan sharing (depth, time, location)

### V3 — Scale
- Travel mode ("I'll be in Cebu April 10–15, find me a buddy")
- Dive school partnerships
- Events
- "I'm diving now" live status + emergency contact trigger

---

## UX Design Principles

### Home Screen (action-first)
**Bad:** Feed → empty states → too many options  
**Good:**
```
"Who can I dive with right now?"

Available Today:
- John (25m, line training) — 2 km away
- Maria (20m, fun dive) — 5 km away

[ Join ]  [ Message ]
```

### Create Dive Screen (< 10 seconds)
- Location (auto-filled)
- Time (ASAP / later)
- Max depth
- Dive type

That's it. One button: **"Post Dive"**

### Dive Session Screen
- Who's going
- Depth range
- Time + location
- Chat thread
- "Join session" / "Leave session"

> Replaces messy group chats.

### Profile (lean)
- Max depth
- Dive type
- Short bio (optional)

No social clutter. Trust comes from usage, not profiles.

---

## Onboarding Flow

```
Step 1: Intent
  → "What are you here to do?"
  → Find a buddy / Join a session / Explore dive spots

Step 2: Skill + Safety Profile
  → Max depth (slider)
  → Certification (optional for now)
  → Dive type: Line training / Fun dive / Spearfishing

Step 3: Location
  → Auto-detect
  → Show nearby divers instantly (value in < 10 seconds)

Step 4: Instant Action (DO NOT drop into a feed)
  → "3 divers are available near you today"
  → [ Join a session ]  [ Message a diver ]  [ Create a dive ]
```

---

## Landing Page Structure

```
HERO
  "Never dive alone."
  Find trusted freediving buddies near you — fast, simple, and safe.
  [ Get Early Access ]  [ Join a Dive ]

PROBLEM
  Finding a reliable freediving buddy is harder than it should be.
  • Group chats are messy
  • Skill levels are unclear
  • Safety is never guaranteed

SOLUTION
  See nearby freedivers
  Match by depth & experience
  Plan dives in seconds
  Build trust with every session

HOW IT WORKS
  1. Set your depth and experience
  2. Find divers near your location
  3. Join or create a dive session
  4. Dive together safely

TRUST SECTION
  Built for safety-first diving.
  ✓ Verified certifications
  ✓ Buddy ratings after every session
  ✓ Clear dive plans before you enter the water

LOCAL CTA (Cebu launch)
  "Launching in Cebu. Be one of the first to find a consistent dive buddy in your area."
  [ Join the First 100 Divers ]
```

---

## Launch Strategy — Hyperlocal First

> We don't need more features than competitors. We need 10 active divers at one beach using it every week. That beats 10,000 global signups.

**Target location:** Start with ONE — **Moalboal**

Then expand to: Panglao → Dauin → Mactan → Cebu

**Week-by-week plan:**

| Week | Focus |
|---|---|
| 1–2 | Personally onboard 10–20 divers, create dives daily to seed activity |
| 3 | Ensure at least 1 dive posted per day — always something happening |
| 4 | Add instructors as "trusted/verified" users |

**Tactics:**
- Partner with dive schools
- Onboard instructors personally — if instructors use it, others will trust it
- Seed dive sessions manually if needed

> **Success metric:** Two strangers successfully dive together using the app. Everything else is just UI.

---

## Growth Loop

After every dive, prompt:

> "How was your buddy?"
> - Safe
> - On time
> - Would dive again

This builds: **Trust → Retention → Reputation system**

---

## Trust Architecture (the moat)

**Avoid:** Likes, followers, influencer vibes  
**Build:** Completed dives together, trusted buddy score, instructor-verified badge

**Reputation > social metrics**

---

## Competitive Positioning Summary

| Dimension | Competitors | Buddyline |
|---|---|---|
| Trust | None | Cert verification + buddy ratings |
| Core action | Browse profiles | Create/join dive sessions |
| Density strategy | Global scatter | Hyperlocal dominance |
| Safety | Minimal | Pre-dive checklist + dive plan + live status |
| Positioning | "Social app for divers" | "Safest way to find a freediving buddy" |

---

## Gap Analysis — What the Current App Needs to Change

This section maps the strategy document against the actual codebase. It covers what's already aligned, what needs to be changed, and what's missing entirely.

---

### What's Already Aligned (no changes needed)

| Strategy requirement | Current state |
|---|---|
| No social feed, likes, posts | Confirmed — zero social elements anywhere |
| Location-based diver map | `FindScreen.tsx` has full map + list toggle |
| 1:1 chat | `MessagingScreen.tsx` exists |
| Discipline-based filtering | Multi-select chip filters in `FindBuddyScreen` and `FindScreen` |
| Verification system (cert + review) | Cert card upload + admin review flow is built |
| Safety-first messaging | Safety screen, disclaimers on multiple screens |
| "Never Dive Alone" tagline | Already present everywhere |

---

### Critical Gap — Session Model vs Request Model

**This is the biggest structural mismatch.**

**What the strategy calls for:**
> "Moalboal — 7am — line training — 20–30m — need 1 buddy"
> Users can: Join / Request / Auto-match

Open sessions that anyone nearby can see and join.

**What is currently built:**
The app uses a **person-to-person request model**. A certified diver finds a specific buddy on the list, then sends them a private dive request. There is no concept of a publicly posted dive session that others can browse and join.

**Current flow:**
```
FindBuddy → tap specific person → DiveRequestForm (to that person) → they accept/decline
```

**Strategy flow:**
```
Home → see today's open sessions → Join any session OR post your own
```

**What needs to change:**

#### New: `dive_sessions` table (Supabase)
```sql
create table dive_sessions (
  id             uuid primary key default gen_random_uuid(),
  creator_id     uuid references profiles on delete cascade,
  location_name  text not null,
  latitude       double precision,
  longitude      double precision,
  scheduled_at   timestamptz not null,
  max_depth_m    int,
  dive_type      text check (dive_type in ('line_training','fun_dive','spearfishing','pool','dynamic','static')),
  spots_needed   int default 1,
  notes          text,
  status         text default 'open' check (status in ('open','full','cancelled','completed')),
  created_at     timestamptz default now()
);

create table dive_session_members (
  session_id  uuid references dive_sessions on delete cascade,
  user_id     uuid references profiles on delete cascade,
  joined_at   timestamptz default now(),
  primary key (session_id, user_id)
);
```

#### New screens needed:
- **`CreateSessionScreen.tsx`** — replaces `DiveRequestFormScreen` as the primary creation action. Fields: Location (auto-filled), Time (ASAP / pick time), Max depth, Dive type. One button: "Post Dive". Target: under 10 seconds to complete.
- **`SessionDetailScreen.tsx`** — replaces `DiveRequestDetailScreen`. Shows: who's going, depth, time, location, chat thread. Buttons: "Join session" / "Leave session".
- **`SessionsListScreen.tsx`** — replaces `MyDiveRequestsScreen`. Shows open sessions near you today, not a personal request inbox.

#### Screens to retire or repurpose:
- `DiveRequestFormScreen.tsx` — retire (replaced by `CreateSessionScreen`)
- `DiveRequestDetailScreen.tsx` — retire (replaced by `SessionDetailScreen`)
- `MyDiveRequestsScreen.tsx` — retire (replaced by `SessionsListScreen`)

---

### Home Screen — Needs to Show Sessions, Not Just Users

**Current (`HomeCertifiedScreen.tsx`):**
- Shows a list of **users** who are "available to dive"
- Has an availability toggle (I'm available / not available)
- "See all" links to FindBuddy

**What strategy requires:**
> "Available Today" — show actual **dive sessions** posted near you, not just users
> Buttons: Join / Message / Create Dive

**Changes needed to `HomeCertifiedScreen.tsx`:**
- Replace "Available Now" user list with a **"Sessions Today"** list fed from `dive_sessions` table
- Each card shows: location, time, depth, dive type, spots left, creator name
- "Create Dive" button (prominent, primary CTA) → `CreateSessionScreen`
- Keep the availability toggle (still useful signal for instant matching)
- Remove "See all → FindBuddy" as the primary action — sessions are the primary action now

---

### Profile — Max Depth Field Missing

**Strategy says:** Basic profile should include `max depth` as a core trust signal.

**Current certified profile fields:** city, cert level, agency, years experience, disciplines, bio, cert card photo.

**Max depth is not collected anywhere.**

**Changes needed:**

`ProfileSetupCertifiedScreen.tsx` — add a max depth field (number input, in meters):
```
Max depth (m): [____]
```

`ProfileEditScreen.tsx` — same addition.

`certified_profiles` table in Supabase:
```sql
alter table certified_profiles add column if not exists max_depth_m int;
```

`FindBuddyScreen.tsx` / `HomeCertifiedScreen.tsx` — show max depth on buddy cards (e.g. "Alex Reyes · AIDA 3 · 35m").

---

### Onboarding — Intent Step Missing

**Strategy says Step 1 of onboarding:**
> "What are you here to do?"
> - Find a buddy
> - Join a session
> - Explore dive spots
> Personalizes experience immediately.

**Current onboarding:**
```
SignUp → RoleSelection (Beginner / Certified / Instructor) → ProfileSetup → Safety → Tabs
```

The role selection is close to this but framed around identity ("what are you?") not intent ("what do you want to do today?"). The strategy wants action-oriented framing from the very first step.

**Consider:** Either rename `RoleSelectionScreen` copy to be intent-framed, or add a lightweight intent step before role selection that then routes to the right setup flow.

**Low-effort fix:** Update the copy in `RoleSelectionScreen.tsx` from role labels to action labels:
- "Beginner" → "I want to find an instructor" / "I'm learning"
- "Certified" → "I want to find a dive buddy"
- "Instructor" → "I offer instruction"

---

### Tab Names — "Schedule" Should Reflect Sessions

**Current tabs (Certified):** Home · Find · Schedule · Messages · Profile

"Schedule" (`MyActivityScreen`) sounds like a personal calendar. Per the strategy, this tab should be the user's **dive session activity** — sessions they've joined, created, or completed.

**Suggested rename:** "Schedule" → "My Dives"

Also reconsider the Find tab: currently defaults to instructor search for certified users. Given the strategy's focus on **buddy matching as the core loop**, the Find tab should default to buddy/session search, not instructor search.

---

### Demo Mode — Remove Before Launch

Already noted in [PLAN.md](PLAN.md) but worth repeating here in priority order:

- `WelcomeScreen.tsx` — 4 demo buttons must be removed
- `src/lib/mockData.ts` — delete entire file
- All `isDemoMode()` guards and `DEMO_BUDDIES` / `DEMO_INSTRUCTORS` references across ~15 screens — replace with real Supabase calls
- `SplashScreen.tsx` — remove demo user routing logic

---

### Summary Table

| Area | Status | Action needed |
|---|---|---|
| Session model (open join) | ✅ Done | `CreateSessionScreen`, `SessionDetailScreen`, `SessionsListScreen` built and wired in AppNavigator |
| Home screen shows sessions | ✅ Done | `HomeCertifiedScreen` now fetches from `dive_sessions` table |
| Max depth on profile | ✅ Done | `max_depth_m` field in `ProfileSetupCertifiedScreen` and `ProfileEditScreen` |
| Onboarding intent framing | ✅ Done | `RoleSelectionScreen` uses "What brings you here?" with action-framed options |
| Tab label "Schedule" | ✅ Done | `CertifiedTabs` title already set to "My Dives" |
| Demo mode | ✅ Done | `mockData.ts` deleted; demo code removed |
| Social elements | None | Nothing to remove — already clean |
| Tagline / safety messaging | Aligned | No changes needed |
| Map + list view | Aligned | No changes needed |
| Verification system | Aligned | No changes needed |
| Chat | Aligned | No changes needed |

---

## Rebrand Checklist — "Buddy Up" → "Buddyline"

The entire codebase currently uses "Buddy Up" branding. Below is every file that needs to change, grouped by category.

> **Note on tagline:** "Never Dive Alone" is already the Buddyline tagline — keep it everywhere.

---

### 1. App Config (do these first — they affect builds)

#### `app.json`
| Field | Current | Change to |
|---|---|---|
| `name` | `"Buddy Up"` | `"Buddyline"` |
| `slug` | `"buddy-up"` | `"buddyline"` |
| `scheme` (array) | `["buddyup", "com.buddyup.app"]` | `["buddyline", "com.buddyline.app"]` |
| `ios.bundleIdentifier` | `"com.thebuddyup.app"` | `"com.buddyline.app"` |
| `android.package` | `"com.thebuddyup.app"` | `"com.buddyline.app"` |

#### `package.json`
| Field | Current | Change to |
|---|---|---|
| `name` | `"buddy-up"` | `"buddyline"` |

---

### 2. Auth Screens

#### `src/screens/auth/WelcomeScreen.tsx`
- App title text: `"Buddy Up"` → `"Buddyline"`

#### `src/screens/auth/SplashScreen.tsx`
- AsyncStorage key: `@buddyup:safetyAccepted` → `@buddyline:safetyAccepted`

#### `src/screens/auth/SignInScreen.tsx`
- AsyncStorage key: `@buddyup:safetyAccepted` → `@buddyline:safetyAccepted`

#### `src/screens/auth/ForgotPasswordScreen.tsx`
- Redirect URL: `/buddy-up/password-reset.html` → `/buddyline/password-reset.html`
- (Also rename the actual `password-reset.html` file — see HTML section below)

#### `src/screens/auth/TermsOfServiceScreen.tsx`
- Any "Buddy Up" name references → `"Buddyline"`

---

### 3. Profile Screens

#### `src/screens/profile/ProfileSetupInstructorScreen.tsx`
- Supabase storage bucket: `"buddy-up"` → `"buddyline"`

#### `src/screens/profile/ProfileSetupCertifiedScreen.tsx`
- Supabase storage bucket: `"buddy-up"` → `"buddyline"`

#### `src/screens/profile/ProfileEditScreen.tsx`
- Supabase storage bucket: `"buddy-up"` → `"buddyline"` (4 occurrences)

#### `src/screens/profile/VerificationPendingScreen.tsx`
- AsyncStorage key: `@buddyup:safetyAccepted` → `@buddyline:safetyAccepted`

---

### 4. Shared Screens

#### `src/screens/shared/SettingsScreen.tsx`
- AsyncStorage key: `@buddyup:safetyAccepted` → `@buddyline:safetyAccepted`
- Display text: `"Buddy Up — Never Dive Alone"` → `"Buddyline — Never Dive Alone"`

#### `src/screens/shared/SafetyScreen.tsx`
- AsyncStorage key: `@buddyup:safetyAccepted` → `@buddyline:safetyAccepted`

---

### 5. Lib / Infrastructure

#### `src/lib/googleAuth.ts`
- Redirect URI: `com.buddyup.app://auth/callback` → `com.buddyline.app://auth/callback`
- (Must also update this URI in Google Cloud Console OAuth settings)

#### `src/lib/supabase.ts`
- Schema reference: `buddy_up` → `buddyline`
- **Warning:** This also requires renaming the schema in Supabase — see Infrastructure section below.

---

### 6. HTML & Public Files

These files are served externally (email links, web pages) — update content and consider renaming:

| File | What to change |
|---|---|
| `password-reset.html` | Any "Buddy Up" text → "Buddyline" |
| `email-confirmation.html` | Any "Buddy Up" text → "Buddyline" |
| `email-confirmation-template.html` | Any "Buddy Up" text → "Buddyline" |
| `email-reset-password-template.html` | Any "Buddy Up" text → "Buddyline" |
| `delete-account.html` | Any "Buddy Up" text → "Buddyline" |
| `privacy-policy.html` | Any "Buddy Up" text → "Buddyline" |
| `index.html` | Any "Buddy Up" text → "Buddyline" |

---

### 7. Infrastructure (Supabase — do carefully)

These are backend changes that affect live data. Do them in a maintenance window or before any real users are onboarded.

| Item | Current | Change to | Notes |
|---|---|---|---|
| Storage bucket | `buddy-up` | `buddyline` | Create new bucket, migrate existing files, update all code references |
| DB schema | `buddy_up` | `buddyline` | Rename via Supabase SQL: `ALTER SCHEMA buddy_up RENAME TO buddyline;` |

> **If users already exist:** AsyncStorage keys use `@buddyup:` prefix. A migration shim may be needed on app launch to copy old key values to new key names, then delete the old ones.

---

### 8. External Services to Update

| Service | What to update |
|---|---|
| Google Cloud Console | OAuth redirect URI: `com.buddyup.app://` → `com.buddyline.app://` |
| Apple Developer Portal | Bundle ID: `com.thebuddyup.app` → `com.buddyline.app` |
| Google Play Console | Package name: `com.thebuddyup.app` → `com.buddyline.app` (new app listing required) |
| Supabase Auth settings | Redirect URLs / allowed origins |
| EAS (Expo) | Update `eas.json` if it references old bundle IDs |

---

### 9. Files That Do NOT Need Changes

| File | Reason |
|---|---|
| `src/lib/mockData.ts` | Will be deleted before production (demo mode removal) |
| `schema.sql` | Schema name change is done in Supabase directly; update the file after |
| `PLAN.md` | Technical plan document — not user-facing |
| Tagline "Never Dive Alone" | Already the Buddyline tagline — keep everywhere |

---

### Change Order (recommended)

```
1. Supabase — rename schema + create new storage bucket
2. app.json + package.json — app identity
3. src/lib/googleAuth.ts — auth redirect URI
4. src/lib/supabase.ts — schema reference
5. All AsyncStorage keys (@buddyup: → @buddyline:)
6. All storage bucket references (buddy-up → buddyline)
7. WelcomeScreen + SettingsScreen — visible name text
8. HTML files — email templates and web pages
9. Update external services (Google, Apple, EAS)
10. Test full auth flow end-to-end
```

---

## Folder & SQL Infrastructure Rename

### Local Folder

The project folder `d:/NEWPROJECT2/buddy-up/` can be renamed to `d:/NEWPROJECT2/buddyline/`. This is cosmetic — no code references it at runtime. Safe to do at any time.

---

### SQL Schema Rename (`buddy_up` → `buddyline`)

The schema name `buddy_up` is used **150+ times** across `schema.sql` and is set in `src/lib/supabase.ts`.

**Step 1 — Run once in Supabase SQL editor:**
```sql
ALTER SCHEMA buddy_up RENAME TO buddyline;
```
All tables, functions, indexes, and policies move automatically. No data is lost.

**Step 2 — `src/lib/supabase.ts` line 15:**
```ts
// before
schema: 'buddy_up',

// after
schema: 'buddyline',
```

**Step 3 — `schema.sql` local file (find & replace all):**

| Find | Replace |
|---|---|
| `buddy_up.` | `buddyline.` |
| `schema buddy_up` | `schema buddyline` |
| `create schema if not exists buddy_up` | `create schema if not exists buddyline` |
| `search_path = buddy_up` | `search_path = buddyline` |
| `schemaname = 'buddy_up'` | `schemaname = 'buddyline'` |
| `-- Schema: buddy_up` | `-- Schema: buddyline` |

**Table names themselves do NOT need to change** — `profiles`, `messages`, `bookings`, etc. are generic and fine.

---

### Storage Bucket Rename (`buddy-up` → `buddyline`)

Supabase does not support renaming buckets. Steps:

1. Create new bucket named `buddyline` in Supabase Storage dashboard
2. Migrate any existing uploaded files (cert cards, credentials) to the new bucket
3. Update all bucket references in code (already listed in the Rebrand Checklist above)
4. Delete old `buddy-up` bucket after confirming all files are migrated

---

### Password Reset URL

The forgot password redirect is currently hardcoded to:
```
https://jackstone02.github.io/buddy-up/password-reset.html
```
This needs to update to the new domain/path once the repo or hosting is renamed:
```
https://jackstone02.github.io/buddyline/password-reset.html
```
**File:** `src/screens/auth/ForgotPasswordScreen.tsx`

Also update the GitHub Pages repo name from `buddy-up` to `buddyline` to match.

---

## Full Implementation Audit — Bugs & Incomplete Features

A complete audit of every file in the codebase. These are issues beyond the strategic gaps — broken UX, missing features, and inconsistencies that need fixing before launch.

---

### 1. Tagline Inconsistency

Two different taglines are used in the app and they contradict each other:

| Location | Current text | Fix |
|---|---|---|
| `SignUpScreen.tsx` | `"Join the freediving safety community"` | → `"Never dive alone."` |
| `SignInScreen.tsx` | `"Sign in to continue diving safely"` | → `"Never dive alone."` or remove |
| `WelcomeScreen.tsx` | `"NEVER DIVE ALONE"` | Keep as-is |
| `SplashScreen.tsx` | `"Never Dive Alone"` | Keep as-is |
| `SettingsScreen.tsx` | `"Buddy Up — Never Dive Alone"` | → `"Buddyline — Never Dive Alone"` |

Pick one tagline and use it consistently everywhere.

---

### 2. Date Input in Dive Request Form — Broken UX

**File:** `src/screens/buddy/DiveRequestFormScreen.tsx`

The dive date is collected via a **plain text input** (`YYYY-MM-DD` format). This is error-prone and bad UX. A native date picker was referenced in imports but never integrated.

**Fix:** Replace the text input with a proper date picker (e.g. `@react-native-community/datetimepicker` or Expo's `DateTimePicker`). Validation should be against the picker value, not raw string parsing.

---

### 3. Avatar & Cert Card Upload — Incomplete

**Files:** `ProfileSetupCertifiedScreen.tsx`, `ProfileSetupInstructorScreen.tsx`, `ProfileEditScreen.tsx`

- `cert_card_url` and `credentials_url` exist in the DB schema and types
- Cert card upload UI exists in certified/instructor setup
- **But:** Profile photo (`avatar_url`) has **no upload UI anywhere** — there is no way for a user to set a profile picture
- The `UserAvatar` component falls back to initials because `avatar_url` is always null

**Fix:** Add a photo picker + Supabase Storage upload in `ProfileEditScreen.tsx` for `avatar_url`. Use the same upload pattern already in the cert card upload.

---

### 4. No Way to Unblock a User

**File:** `src/screens/shared/ReportScreen.tsx`

Users can block others (triggered from ReportScreen). The `blocks` table exists and is used to filter search results. However, there is **no UI anywhere to unblock** a user.

**Fix:** Add an "Unblocked Users" list in Settings (or Profile) that reads from the `blocks` table and allows removal.

---

### 5. No Real-Time Updates for Dive Requests or Bookings

**File:** `src/screens/shared/MessagingScreen.tsx` has a working Postgres real-time subscription.

**Missing:** `MyDiveRequestsScreen`, `DiveRequestDetailScreen`, `MyBookingsScreen`, `BookingDetailScreen`, and `InstructorBookingDetailScreen` all fetch data once on mount. If another user accepts/declines a request or updates a booking status, the screen won't update until the user manually pulls to refresh (and some screens don't even have pull-to-refresh).

**Fix:** Add `supabase.channel()` real-time subscriptions in:
- `DiveRequestDetailScreen.tsx` — listen for status changes on the current request
- `MyDiveRequestsScreen.tsx` — listen for new/updated requests
- `BookingDetailScreen.tsx` — listen for status changes on the current booking
- `InstructorBookingDetailScreen.tsx` — same

---

### 6. Availability Slot Management — Incomplete

**File:** `src/screens/instructor/AvailabilityScreen.tsx`

The schema has an `availability_slots` table with `slot_date`, `start_time`, `end_time`, `is_booked`. The booking form (`BookingFormScreen.tsx`) reads these slots to show available times to customers.

**Issue:** There is no complete UI for instructors to **create or delete** availability slots. Without slots, customers can't book lessons.

**Fix:** Build a full slot CRUD UI in `AvailabilityScreen.tsx`:
- Add slot (date + start time + end time picker)
- Delete slot (only if not booked)
- View existing slots in a calendar or list

---

### 7. Admin Verification Rejection — No Notification Flow

**File:** `src/screens/admin/AdminVerificationsScreen.tsx`

The "Reject" button exists but there is no:
- Rejection reason input
- Notification or email sent to the rejected user
- Way for the user to re-submit or understand why they were rejected

**Fix:**
- Add a rejection reason modal (dropdown + optional text)
- Write the reason to a `rejection_reason` column on `profiles` (add to schema)
- Show the reason to the user on `VerificationPendingScreen.tsx` if `verification_status = 'rejected'`

---

### 8. Report Status — Admin Has No Workflow

**File:** `src/screens/admin/AdminOverviewScreen.tsx` / `AdminUserDetailScreen.tsx`

Reports are inserted with `status: 'open'` and stored in the `reports` table. However, there is no admin UI to:
- View the list of open reports
- Mark a report as reviewed/resolved
- Take action (warn user, ban user)

**Fix:** Add a "Reports" tab to `AdminTabs.tsx` with a screen that lists open reports and allows status updates.

---

### 9. Booking Completion — No Trigger

**Files:** `InstructorBookingDetailScreen.tsx`, `BookingDetailScreen.tsx`

Booking statuses: `pending → confirmed → completed → cancelled`.

There is no visible action that transitions a booking from `confirmed` to `completed`. It's unclear who triggers it (instructor? customer? automatic after the date passes?).

**Fix:** Add a "Mark as Completed" button in `InstructorBookingDetailScreen.tsx`, visible only when status is `confirmed` and the booking date has passed.

---

### 10. RoleChangeScreen — Data Loss Warning Not Enforced

**File:** `src/screens/profile/RoleChangeScreen.tsx`

The UI warns that "Changing your role will reset your profile data," but it's unclear if the old role's profile table row (`certified_profiles` or `instructor_profiles`) is actually deleted or orphaned on role change.

**Fix:** Confirm that role change logic:
1. Deletes the old role's profile row (`certified_profiles` or `instructor_profiles`)
2. Resets `verification_status` to `null` or `pending` on the `profiles` row
3. Resets `available_to_dive` to `false`

---

### 11. Safety Acceptance Stored Locally Only

**Files:** `SafetyScreen.tsx`, `SplashScreen.tsx`, `SignInScreen.tsx`

`@buddyline:safetyAccepted` is stored in **AsyncStorage** (device-local). If a user installs the app on a new device or clears app data, they'll be shown the safety screen again — which is fine. But it means there's no server-side record of safety acceptance separate from `tos_accepted_at`.

**Note:** This is acceptable if `tos_accepted_at` (in Supabase `profiles`) is the authoritative legal record. Just make sure the safety screen acceptance also writes `tos_accepted_at` to Supabase if not already set.

---

### 12. No Post-Dive Rating Flow

After a dive request is accepted and the dive presumably happens, there is **no prompt or mechanism** to rate the buddy. The `ratings` table exists in the schema (stub from PLAN.md) but has no UI anywhere.

**This is a V2 feature per the strategy, but note it here:** The trigger point for the rating prompt should be when a dive request moves to a "completed" status — which also doesn't exist yet (requests only go to `accepted`, never `completed`).

**Fix (when building V2 ratings):**
1. Add `completed` and `cancelled` to the `dive_requests` status enum
2. After status → `completed`, prompt both users: "How was your buddy?"
3. Write to `ratings` table

---

### 13. Disciplines Stored as Array — Inconsistent Type Handling

The `disciplines` field on `certified_profiles` is stored as a PostgreSQL array (`text[]`). In some screens it's handled as an array, in others as a comma-separated string. This inconsistency can cause display bugs.

**Fix:** Standardize all discipline reads/writes to treat the field as `string[]` and only join to string for display. Audit every screen that touches `disciplines`.

---

### 14. No Latitude/Longitude Collected at Profile Setup

The `profiles` table has `latitude` and `longitude` columns used for the map view and distance filtering in `FindScreen.tsx`. However, profile setup screens only ask for `city_region` (text). Coordinates are only populated if/when the user grants location permission during a session.

**Issue:** Users who never grant location permission will never appear on the map and won't show up in distance-filtered searches.

**Fix:** During profile setup (after location text is entered), prompt once for location permission and store the coordinates. Alternatively, geocode the `city_region` text to coordinates on the server side.

---

### 15. `eas.json` — May Need Bundle ID Update

**File:** `eas.json`

If `eas.json` contains hardcoded bundle identifiers or project references matching `com.thebuddyup.app` or the old EAS project ID, these must be updated alongside `app.json`.

**Action:** Open `eas.json` and verify all `bundleIdentifier`, `applicationId`, and `projectId` fields match the new Buddyline values.

---

### Complete Audit Summary Table

| # | File(s) | Issue | Priority | Status |
|---|---|---|---|---|
| 1 | `SignUpScreen`, `SignInScreen` | Tagline inconsistency | High | ✅ Both now say "Never dive alone." |
| 2 | `DiveRequestFormScreen` | Date input is plain text | High | ✅ `CreateSessionScreen` (new primary flow) uses `DateTimePicker`; old request form is legacy |
| 3 | `ProfileEditScreen`, all setup screens | No avatar upload UI | High | ✅ Avatar upload implemented in `ProfileEditScreen` |
| 4 | `SettingsScreen` | No unblock UI | Medium | ✅ Blocked Users section with Unblock button in `SettingsScreen` |
| 5 | `DiveRequestDetailScreen`, `BookingDetailScreen`, `InstructorBookingDetailScreen` | No real-time subscriptions | High | ✅ All three have `supabase.channel()` subscriptions |
| 6 | `AvailabilityScreen` | Instructors can't create/delete availability slots | High | ✅ Full slot CRUD with DateTimePicker — add, delete, calendar view |
| 7 | `AdminVerificationsScreen`, `VerificationPendingScreen` | No rejection reason or notification to user | Medium | ✅ Rejection reason modal in admin; reason displayed on `VerificationPendingScreen` |
| 8 | `AdminOverviewScreen` / `AdminTabs` | No admin report review workflow | Medium | ✅ `AdminReportsScreen` built with Open/Resolved tabs, resolve modal, admin actions; wired into `AdminTabs` |
| 9 | `InstructorBookingDetailScreen` | No "Mark as Completed" action | Medium | ✅ "Mark as Completed" button when status is `confirmed` |
| 10 | `RoleChangeScreen` | Old role data orphaned on role change | Medium | ✅ Deletes old `certified_profiles` / `instructor_profiles` row before switching |
| 11 | `SafetyScreen` | Doesn't write `tos_accepted_at` to Supabase | Low | ✅ Fixed — now writes to `profiles` on acceptance |
| 12 | `DiveRequestDetailScreen` | No `completed` status → no post-dive rating | V2 | Deferred to V2 |
| 13 | All screens using `disciplines` | Array vs string inconsistency | Medium | ✅ All screens treat `disciplines` as `string[]` consistently |
| 14 | All profile setup screens | No coordinates collected | High | ✅ Both setup screens call `getCurrentCoords()` and store lat/lng |
| 15 | `eas.json` | May contain old bundle IDs | High | ✅ No hardcoded bundle IDs in `eas.json` |
| 16 | `ForgotPasswordScreen` | Redirect URL points to old GitHub Pages path | High | ✅ Updated to `/buddyline/password-reset.html` |
| 17 | `mockData.ts` + ~15 screens | Demo mode must be fully removed | High | ✅ `mockData.ts` deleted; demo mode removed |
| 18 | Session model (open join) | Person-to-person request model only | Critical | ✅ `CreateSessionScreen`, `SessionDetailScreen`, `SessionsListScreen` built and wired |
| 19 | `HomeCertifiedScreen` | Shows available users, not dive sessions | Critical | ✅ Fetches from `dive_sessions` table |
| 20 | `certified_profiles` + setup/edit screens | Max depth field missing | High | ✅ `max_depth_m` in both `ProfileSetupCertifiedScreen` and `ProfileEditScreen` |
| 21 | `RoleSelectionScreen` | Identity-framed copy | Low | ✅ Already action-framed: "What brings you here?", "I'm Learning", "I Dive Independently", "I Teach Freediving" |
| 22 | `CertifiedTabs` tab label | "Schedule" → "My Dives" | Low | ✅ `title: 'My Dives'` set |
| 23 | `schema.sql` + Supabase | Schema `buddy_up` → `buddyline` | High | ✅ `schema.sql` fully uses `buddyline`; run `ALTER SCHEMA buddy_up RENAME TO buddyline` in Supabase |
| 24 | `supabase.ts` | `schema: 'buddy_up'` → `schema: 'buddyline'` | High | ✅ Already `schema: 'buddyline'` |
| 25 | Supabase Storage | Bucket `buddy-up` → `buddyline` | High | ✅ `buddyline` bucket created in Supabase dashboard |
| 26 | `app.json`, `package.json` | App name, slug, bundle IDs, schemes | High | ✅ Fully updated to Buddyline |
| 27 | `googleAuth.ts` + Google Cloud Console | OAuth redirect URI | High | ✅ Code uses `com.buddyline.app://auth/callback`; update Google Cloud Console manually |
| 28 | All screens with `@buddyup:` key | AsyncStorage key rename | High | ✅ All keys use `@buddyline:safetyAccepted` |
| 29 | Storage bucket name in code | `"buddy-up"` bucket references | High | ✅ All code uses `"buddyline"` bucket |
| 30 | Branding text in source + HTML | "Buddy Up" text remaining | High | ✅ All source and HTML files updated to Buddyline |
