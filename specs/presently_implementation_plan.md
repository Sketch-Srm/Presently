# Presently PWA — Detailed Implementation Plan

> **Stack**: Next.js 14 (App Router) · Supabase (Postgres + Auth + RLS) · Vanilla CSS · Web NFC API · PWA

---

## Phase 0 — Project Bootstrap

### 0.1 Scaffold Next.js App
```bash
npx create-next-app@latest ./ --app --ts --no-tailwind --eslint --src-dir=false --import-alias="@/*"
```

### 0.2 Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install next-pwa   # minimal SW for installability only
```

### 0.3 Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-only
```

### 0.4 Folder Structure
```
app/
  (auth)/
    login/page.tsx
    layout.tsx
  (member)/
    dashboard/page.tsx
    sessions/page.tsx
    profile/page.tsx
    layout.tsx
  (admin)/
    dashboard/page.tsx
    members/
      page.tsx
      [id]/page.tsx
      new/page.tsx
      register-card/page.tsx
    domains/
      page.tsx
      [id]/page.tsx
    sessions/
      page.tsx
      new/page.tsx
      [id]/
        page.tsx
        attendance/page.tsx   ← HERO SCREEN
    reports/
      page.tsx
      member/[id]/page.tsx
      session/[id]/page.tsx
      domain/[id]/page.tsx
    settings/page.tsx
    layout.tsx
  layout.tsx          ← root layout (fonts, global CSS)
  globals.css
components/
  ui/
    Button.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
    Toast.tsx
    Badge.tsx
    Spinner.tsx
    Avatar.tsx
    TabBar.tsx
    BottomNav.tsx
  logo/
    LogoMark.tsx      ← SVG chrome "S" ribbon
    LogoAssembly.tsx  ← animated intro sequence
    RibbonFold.tsx    ← check-in success animation
    RibbonSpin.tsx    ← NFC scanning loader
  attendance/
    NFCScanner.tsx    ← "use client"
    ManualSearch.tsx  ← "use client"
    AttendanceCounter.tsx
    MemberRow.tsx
  reports/
    AttendanceTable.tsx
    CSVExportButton.tsx
    DomainChart.tsx
lib/
  supabase/
    client.ts         ← browser client
    server.ts         ← server component client
    middleware.ts     ← SSR session sync
  types.ts            ← all DB types
  utils.ts
middleware.ts         ← route protection
public/
  manifest.json
  icons/              ← 192x192, 512x512, maskable
  sw.js               ← minimal install-only service worker
```

---

## Phase 1 — Design System & Global CSS

### 1.1 Google Fonts
In `app/layout.tsx` import:
- **Space Grotesk** — display/headers (bold, tight tracking)
- **Inter** — body/UI text
- **JetBrains Mono** — `student_id`, `card_serial`, timestamps

### 1.2 CSS Custom Properties (`app/globals.css`)
```css
:root {
  /* Color tokens */
  --bg-void: #0A0A0B;
  --bg-surface: #141416;
  --chrome-light: #E8E8EA;
  --chrome-mid: #9CA0A6;
  --chrome-dark: #4A4D52;
  --accent-signal: #7DD8FF;
  --state-present: #6FCF97;
  --state-absent: #E85D5D;
  --state-late: #F2C94C;
  --state-excused: #9CA0A6;

  /* Metallic gradient (reusable) */
  --gradient-chrome: linear-gradient(135deg, #E8E8EA18, #9CA0A60A, #4A4D5218);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing / Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Transitions */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { background: var(--bg-void); color: var(--chrome-light); font-family: var(--font-body); }
```

### 1.3 Reusable Component Styles
Define CSS classes for:
- `.btn` — metallic gradient border, sharp corners (6-8px radius), 44px min-height
- `.btn-primary` — `--accent-signal` tinted fill
- `.btn-ghost` — transparent, chrome border
- `.card` — `--bg-surface` background, chrome-dark 1px border, `var(--gradient-chrome)` overlay
- `.input` — dark surface, chrome-dark border, monospace for ID fields
- `.badge-present/late/absent/excused` — semantic status colors

---

## Phase 2 — Logo & Signature Animations

### 2.1 LogoMark SVG (`components/logo/LogoMark.tsx`)
- Hand-craft (or recreate) the chrome isometric "S" ribbon as a clean SVG path
- Export at `viewBox="0 0 100 100"` so it scales perfectly
- Apply a `linearGradient` fill: chrome-light → chrome-mid → chrome-dark (matches the 3D bevel look)
- Use as: favicon, PWA icons, inline UI element

### 2.2 Logo Assembly Animation (`components/logo/LogoAssembly.tsx`)
- **Trigger**: first page load only (check `sessionStorage` flag so it doesn't replay on navigation)
- **Sequence** (< 1 second total):
  1. Two SVG stroke paths start invisible
  2. `stroke-dashoffset` animates to 0 simultaneously (ribbon draws in)
  3. Fill fades in with a chrome shimmer
  4. Screen transitions to login/dashboard via opacity fade
- CSS `@keyframes` + `animation` — no JS animation library needed

### 2.3 RibbonFold — Check-in Success (`components/logo/RibbonFold.tsx`)
- Small (48px) SVG that morphs/closes on successful check-in
- Two SVG path states: "open" → "closed S"
- Animate with CSS `clip-path` morph + `filter: drop-shadow(0 0 8px var(--state-present))`
- Accompanied by `transform: scale(1.15)` spring bounce on the member card

### 2.4 RibbonSpin — NFC Scanning Loader (`components/logo/RibbonSpin.tsx`)
- 2-3 keyframe SVG morph loop (ribbon twisting)
- Used ONLY on the NFC scanning active state
- Falls back to simple opacity pulse under `prefers-reduced-motion`

### 2.5 Tab Indicator — Ribbon Segment
- The active bottom-nav/tab underline is an angled short SVG path (not a straight line)
- Slides between positions with `transform: translateX()` transition
- Angle morphs via `clip-path` or `d` attribute tween

---

## Phase 3 — Supabase Setup

### 3.1 Database Schema SQL
Run in Supabase SQL editor:

```sql
-- domains
CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain_lead_id uuid REFERENCES members(id),
  description text,
  created_at timestamptz DEFAULT now()
);

-- members
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_serial text UNIQUE,
  student_id text UNIQUE NOT NULL,
  register_no text UNIQUE NOT NULL,
  name text NOT NULL,
  photo_url text,
  email text,
  phone text,
  domain_ids uuid[] DEFAULT '{}',
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member','domain_lead','club_admin','super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','alumni')),
  join_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('meeting','event','workshop','other')),
  date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  scope text NOT NULL CHECK (scope IN ('club_wide','domain_specific')),
  target_domain_ids uuid[] DEFAULT '{}',
  created_by uuid REFERENCES members(id),
  late_threshold_minutes integer,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz DEFAULT now()
);

-- attendance
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id),
  member_id uuid NOT NULL REFERENCES members(id),
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL CHECK (status IN ('present','late','excused','absent')),
  method text NOT NULL CHECK (method IN ('nfc','manual')),
  marked_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, member_id)
);
```

### 3.2 RLS Policies

**members table**:
```sql
-- Anyone authenticated can read members (needed for search)
CREATE POLICY "members_read" ON members FOR SELECT TO authenticated USING (true);
-- Only super_admin can insert/update/delete
CREATE POLICY "members_write" ON members FOR ALL TO authenticated
  USING ((SELECT role FROM members WHERE id = auth.uid()) IN ('super_admin','club_admin'));
```

**sessions table**:
```sql
-- Read: authenticated users
CREATE POLICY "sessions_read" ON sessions FOR SELECT TO authenticated USING (true);
-- Insert/Update: domain_lead for their domains, admins for all
CREATE POLICY "sessions_write" ON sessions FOR ALL TO authenticated
  USING (
    (SELECT role FROM members WHERE id = auth.uid()) IN ('club_admin','super_admin')
    OR (
      (SELECT role FROM members WHERE id = auth.uid()) = 'domain_lead'
      AND (SELECT domain_ids FROM members WHERE id = auth.uid()) && target_domain_ids
    )
  );
```

**attendance table**:
```sql
-- Members can read their own
CREATE POLICY "attendance_self_read" ON attendance FOR SELECT TO authenticated
  USING (member_id = auth.uid());
-- Leads/admins can read all
CREATE POLICY "attendance_admin_read" ON attendance FOR SELECT TO authenticated
  USING ((SELECT role FROM members WHERE id = auth.uid()) IN ('domain_lead','club_admin','super_admin'));
-- Write: leads/admins only
CREATE POLICY "attendance_write" ON attendance FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM members WHERE id = auth.uid()) IN ('domain_lead','club_admin','super_admin'));
```

### 3.3 Supabase Clients

**`lib/supabase/client.ts`** — browser client (singleton):
```ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
```

**`lib/supabase/server.ts`** — server component client:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

### 3.4 Middleware (`middleware.ts`)
- Refresh session on every request via `@supabase/ssr`
- Protect `(admin)` routes: fetch member's `role` from `members` table; redirect to `/dashboard` if insufficient
- Protect `(member)` routes: redirect to `/login` if unauthenticated

---

## Phase 4 — Authentication

### 4.1 Login Page (`app/(auth)/login/page.tsx`)
**Visual**: Full-screen dark. LogoAssembly animation plays once. Then form fades in.
- Email + Password inputs
- "Sign In" button (metallic chrome style)
- Error state inline (not a toast)
- On success: redirect based on role
  - `member` → `/dashboard`
  - `domain_lead` / `club_admin` / `super_admin` → `/admin/dashboard`

### 4.2 Auth Layout (`app/(auth)/layout.tsx`)
- Centered single-column, `--bg-void` background
- No nav bar

### 4.3 Server Action / Route Handler
- Use `supabase.auth.signInWithPassword()` in a server action
- On success, session is stored in cookies via `@supabase/ssr`

---

## Phase 5 — Bottom Navigation (Shared Layout)

### 5.1 Member Bottom Nav
Tabs (in thumb-reach bottom bar):
1. **Dashboard** (home icon)
2. **Sessions** (calendar icon)
3. **Profile** (person icon)

### 5.2 Admin Bottom Nav
Tabs:
1. **Dashboard** (home icon)
2. **Sessions** (calendar icon)
3. **Attendance** ← hero, center + larger tap target
4. **Members** (people icon)
5. **Reports** (chart icon)

### 5.3 Tab Indicator
- Active tab: ribbon-segment SVG indicator slides under the icon
- Inactive: `--chrome-dark` icon, no label
- Active: `--chrome-light` icon + label, ribbon indicator

---

## Phase 6 — Screens Implementation

### 6.1 Member Dashboard (`app/(member)/dashboard/page.tsx`)
**Server Component** — fetch on server:
- Member's attendance % (all-time and last 30 days)
- Upcoming sessions (next 7 days)

**UI Elements**:
- Big `%` number in Space Grotesk, chrome gradient text
- Mini sparkline-style attendance trend (pure CSS bar chart)
- Session cards: date, title, type badge, domain badge
- Empty state: faded monochrome "S" watermark + "No upcoming sessions"

### 6.2 Admin Dashboard (`app/(admin)/dashboard/page.tsx`)
**Server Component**:
- Today's sessions with quick "Take Attendance" CTA per session
- At-risk members count (< 75% attendance)
- Total members, domains count

**UI**:
- Stats row: 3 metric cards with number-roll animation on mount
- Session list with status pills (open/closed)
- At-risk members mini-list (name, %, red badge)

### 6.3 Take Attendance — HERO SCREEN (`app/(admin)/sessions/[id]/attendance/page.tsx`)
This is the most critical screen. **Client Component** (`"use client"`).

**Layout**:
```
┌─────────────────────────────┐
│  ← Session Title       [X]  │
│  Live counter: 12 / 38      │  ← always visible, number rolls
├─────────────────────────────┤
│  [NFC Tab] │ [Manual Tab]   │  ← ribbon-segment indicator
├─────────────────────────────┤
│                             │
│  NFC MODE:                  │
│  ┌───────────────────────┐  │
│  │  [Start Scanning btn] │  │  ← chrome pulse ripple on press
│  │  RibbonSpin loader    │  │  ← shows while scanning active
│  └───────────────────────┘  │
│  Last check-in toast        │
│                             │
│  MANUAL MODE:               │
│  [Search input]             │
│  Member list (filtered)     │
│  Each row: tap → status     │
│                             │
└─────────────────────────────┘
```

**NFC Mode logic**:
1. Button press → `new NDEFReader()` → `.scan()`
2. On `reading` event: lookup `card_serial` in `members` table
3. Insert into `attendance` (or handle unique constraint conflict = already checked in)
4. Show RibbonFold animation + member name/photo toast
5. Increment counter with number-roll animation
6. Feature-detect: if `'NDEFReader' in window` is false → hide NFC tab entirely

**Manual Mode logic**:
1. Load all expected members for this session (based on scope + domain_ids)
2. Search input filters by name, student_id, register_no (client-side, instant)
3. Member rows grouped: Checked In / Pending
4. Tap member row → status picker (present / late / excused / absent)
5. Confirm → upsert `attendance` record → slide row into "Checked In" group

### 6.4 Sessions List & Create

**List** (`app/(admin)/sessions/page.tsx`) — Server Component:
- Filter tabs: All / Open / Closed
- Filter by domain (dropdown)
- Session cards with date, scope, member count, status pill
- FAB (Floating Action Button) → Create Session

**Create/Edit** (`app/(admin)/sessions/new/page.tsx`) — Client Component:
- Title, Type (select), Date, Start Time, End Time (optional)
- Scope toggle: Club-wide / Domain-specific
- If domain-specific: multi-select domain chips
- Late threshold (optional number input)
- Submit → server action → redirect to session detail

### 6.5 Member Management

**List** (`app/(admin)/members/page.tsx`) — Server Component:
- Search by name / student_id
- Filter by domain, status
- Member rows: avatar, name, student_id (monospace), domain badges, role pill
- Action: Edit, Deactivate

**Add/Edit** (`app/(admin)/members/new/page.tsx` & `/[id]/page.tsx`) — Client Component:
- All member fields
- Domain multi-select (checkbox chips)
- Role select

**Card Registration** (`app/(admin)/members/register-card/page.tsx`) — Client Component:
- Step 1: Press "Read NFC Card" → NDEFReader reads serialNumber
- Step 2: Search for member (name / student_id)  
- Step 3: Confirm assignment
- Error: "This card is already linked to [Name]"

### 6.6 Domain Management (`app/(admin)/domains/`)
- List domains with lead name, member count
- Create/edit: name, description, assign lead (searchable member dropdown)

### 6.7 Reports (`app/(admin)/reports/`)
**All Server Components** for data fetching.

**Per-member report**:
- Date range picker (client island)
- Attendance % + sessions table (present/late/absent/excused per session)
- CSV export button

**Per-session report**:
- Headcount, NFC vs manual breakdown
- Full member attendance list with status + timestamp

**Per-domain report**:
- Aggregate % for the domain
- Configurable at-risk threshold input
- At-risk members list
- CSV export

### 6.8 Profile / Settings (`app/(member)/profile/page.tsx`)
- Member's own info (read-only for members)
- Attendance summary
- "Install App" prompt button (PWA install)
- Sign out button

---

## Phase 7 — PWA Setup

### 7.1 `public/manifest.json`
```json
{
  "name": "Presently",
  "short_name": "Presently",
  "description": "Club attendance PWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0A0B",
  "theme_color": "#0A0A0B",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 7.2 Minimal Service Worker (`public/sw.js`)
```js
// Install-only service worker — no caching
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
// No fetch handler = network-only (no offline caching)
```

### 7.3 Register SW in Root Layout
```tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
}, [])
```

---

## Phase 8 — Key Animations Checklist

| Animation | Trigger | Implementation |
|---|---|---|
| Logo assembly | First load only (sessionStorage guard) | CSS `stroke-dashoffset` keyframes |
| NFC scan ripple | "Start Scanning" button press | CSS `@keyframes` radial gradient pulse |
| RibbonSpin | While NDEFReader.scan() active | CSS SVG path morph loop |
| RibbonFold | Successful check-in | CSS SVG morph + `drop-shadow` glow |
| Counter roll | Attendance count increments | CSS `@keyframes` translateY flip |
| Member row slide | Checked-in → group move | CSS `transform` + `transition` spring |
| Tab indicator slide | Tab switch | CSS `transform: translateX` transition |
| Manual search filter | Input change | CSS opacity + translateY fade-in |
| Page entrance | Every route | CSS `@keyframes` fade + subtle upward shift |
| `prefers-reduced-motion` | System setting | `@media (prefers-reduced-motion: reduce)` — all become simple opacity fades |

---

## Phase 9 — Mobile Responsiveness Rules

- **Base layout**: single column, max-width 480px centered on desktop
- **Bottom nav**: fixed, `env(safe-area-inset-bottom)` padding for notched phones
- **Touch targets**: minimum 44×44px for all interactive elements
- **Typography scale**:
  - Display (attendance %): `clamp(3rem, 10vw, 5rem)`
  - Section headers: `clamp(1.25rem, 5vw, 1.75rem)`
  - Body: `1rem` fixed (do not scale below 16px)
- **Inputs**: `font-size: 16px` minimum (prevents iOS zoom on focus)
- **Primary actions** (Start Scan, Mark Present): bottom third of screen
- **Cards**: no horizontal overflow, `padding: 1rem`
- **Modals**: slide up from bottom (bottom sheet) on mobile, not centered overlay
- **Attendance screen**: sticky counter + tab bar at top, scrollable member list below

---

## Phase 10 — Build Order

```
1. [ ] Bootstrap Next.js project
2. [ ] globals.css — all tokens + base styles
3. [ ] LogoMark SVG component
4. [ ] Supabase clients (browser + server) + middleware
5. [ ] Database schema + RLS (run in Supabase)
6. [ ] Auth — login page + logo assembly animation
7. [ ] Root layout + Bottom nav components
8. [ ] Member dashboard (server component)
9. [ ] Admin dashboard (server component)
10. [ ] Sessions list + create/edit
11. [ ] Take Attendance — Manual mode first
12. [ ] Take Attendance — NFC mode + RibbonSpin/RibbonFold animations
13. [ ] Member management (list + add/edit)
14. [ ] Card registration flow
15. [ ] Domain management
16. [ ] Reports (member + session + domain) + CSV export
17. [ ] Profile/settings page
18. [ ] PWA manifest + minimal SW + icons
19. [ ] Animation polish pass (all 10 animations in Phase 8)
20. [ ] Mobile responsiveness audit (test at 375px, 390px, 414px widths)
21. [ ] prefers-reduced-motion fallback pass
22. [ ] RLS policy audit
```

---

## Key Decisions & Constraints

| Decision | Rationale |
|---|---|
| No offline caching | Spec explicitly says installability only |
| NFC feature-detect + hide | Spec: hide entirely on unsupported browsers |
| Server Components for data views | Performance, SEO, no loading spinners for initial data |
| Client Components for NFC + forms | Browser APIs require client context |
| UNIQUE constraint on attendance | DB-level duplicate prevention, not just app logic |
| `@supabase/ssr` (not auth-helpers) | Spec explicitly calls this out |
| Sharp corners (6-8px radius) | Logo design language — no pill buttons |
| Space Grotesk for display | Angular forms echo logo's cut edges |
| JetBrains Mono for IDs | Reinforces "system/terminal" feel |
| Dark mode only | Spec: palette designed for permanent dark UI |
