# Presently — Club Attendance PWA — Build Prompt

Build a full-stack Progressive Web App called **Presently**, a flexible attendance system for a club that has multiple **domains** (sub-teams). Members are checked in via NFC tap (Android Chrome/Edge only) or manual search (works on all devices).

---

## 1. Tech Stack

- **Frontend**: Next.js (App Router), installable as a PWA (manifest.json + basic service worker for installability only — **no offline caching / no offline functionality needed for now**, e.g. `next-pwa` or a hand-rolled minimal service worker just for the install prompt)
- **Backend/DB**: Supabase (Postgres for data, Supabase Auth for login), accessed via `@supabase/supabase-js` and `@supabase/ssr` for server/client auth handling in Next.js
- **NFC**: Web NFC API (`NDEFReader`) — Android Chrome/Edge only, must run over HTTPS, and must run in a **client component** (`"use client"`) since it depends on browser APIs. Feature-detect (`'NDEFReader' in window`) and hide the NFC option entirely on unsupported browsers/devices instead of showing a broken button.
- **Styling**: Clean, modern, mobile-first UI (this will mostly be used on phones)

---

## 2. Data Model (Supabase / Postgres tables)

### `domains`
```
id              uuid, PK
name            text            -- "Technical", "Design", "Events", "Marketing", "PR"
domain_lead_id  uuid, FK -> members.id, nullable
description     text, nullable
created_at      timestamp
```

### `members`
```
id              uuid, PK
card_serial     text, unique, nullable   -- NFC UID, set during card registration
student_id      text, unique             -- short human-friendly ID e.g. "sd1234", primary manual search field
register_no     text, unique             -- official register number, secondary search field
name            text
photo_url       text, nullable
email           text, nullable
phone           text, nullable
domain_ids      uuid[]                   -- supports belonging to multiple domains
role            text  -- 'member' | 'domain_lead' | 'club_admin' | 'super_admin'
status          text  -- 'active' | 'inactive' | 'alumni'
join_date       timestamp
created_at      timestamp
```

### `sessions`
```
id                      uuid, PK
title                   text            -- "Weekly Meeting", "Technical Workshop"
type                    text  -- 'meeting' | 'event' | 'workshop' | 'other'
date                    date
start_time              timestamp
end_time                timestamp, nullable
scope                   text  -- 'club_wide' | 'domain_specific'
target_domain_ids       uuid[]          -- empty if club_wide
created_by              uuid, FK -> members.id
late_threshold_minutes  integer, nullable   -- auto-mark "late" after this many minutes past start_time
status                  text  -- 'open' | 'closed'
created_at              timestamp
```

### `attendance`
```
id             uuid, PK
session_id     uuid, FK -> sessions.id
member_id      uuid, FK -> members.id
timestamp      timestamp
status         text  -- 'present' | 'late' | 'excused' | 'absent'
method         text  -- 'nfc' | 'manual'
marked_by      uuid, FK -> members.id   -- who performed the check-in (self or an admin/lead)
created_at     timestamp

UNIQUE (session_id, member_id)   -- prevent duplicate check-ins for the same session
```

---

## 3. What a "Session" Is

A session is one instance of attendance-taking — a single meeting, event, or workshop occurrence. Every time the club (or a specific domain) gathers and attendance needs to be recorded, a new session is created. Each session has its own date/time, its own scope (club-wide or specific domain(s)), and its own attendance list. Attendance percentage for a member is calculated across all sessions they were eligible for.

---

## 4. Roles & Permissions

- **Member**: view their own attendance history/percentage, view upcoming sessions, self-check-in via NFC if enabled for a session
- **Domain Lead**: everything a member can do, plus: create/manage sessions scoped to their own domain(s), take attendance for those sessions, view attendance reports for their domain
- **Club Admin**: everything a domain lead can do across all domains, plus: create club-wide sessions, view/export club-wide reports, manage domains
- **Super Admin**: everything above, plus: manage member roles, register/reassign NFC cards, edit/delete historical records

Enforce these permissions with Supabase Row Level Security (RLS) policies on each table, not just frontend checks.

---

## 5. Core Features to Build

### A. Authentication
- Supabase Auth — email/password login
- Role-based routing: members see a simple personal view, leads/admins see a management dashboard

### B. Member Management (admin/lead view)
- Add/edit/deactivate members
- Assign one or more domains to a member
- **Card registration flow**: admin taps an unassigned NFC card → app reads `serialNumber` via `NDEFReader` → admin searches for and selects the member (by name, `student_id`, or `register_no`) → saves `card_serial` to that member's row. Show a clear error if the card is already linked to someone else.

### C. Domain Management
- Create/edit domains
- Assign a domain lead

### D. Session Management
- Create a session: title, type, date/time, scope (club-wide or pick domain(s)), optional late threshold
- List upcoming/past sessions, filterable by domain and type
- Close a session when done (locks further check-ins, auto-marks remaining expected members as "absent" unless already marked)
- Only domain leads/admins with permission for that domain can create/manage sessions within it

### E. Taking Attendance (core screen)
- Open a session → "Take Attendance" screen with two modes:
  1. **NFC mode** (Android Chrome/Edge only, auto-hidden elsewhere): tap "Start Scanning" → `NDEFReader.scan()` triggered by the button press → on each tag read, look up `card_serial` in `members` → mark attendance instantly → show a toast with the member's name + photo → block duplicate check-ins for that session (rely on the `UNIQUE(session_id, member_id)` constraint)
  2. **Manual mode**: searchable list of expected members (based on session scope), searchable by name, `student_id`, or `register_no` → tap to set status (present/late/excused/absent) — this is the universal fallback and must work flawlessly on every device
- Live running counter: "X / Y checked in"

### F. Self Check-in (member view, optional per session)
- If enabled by whoever created the session, members can open the app and tap their own card to check themselves in (method = nfc, marked_by = their own id)

### G. Reports & Analytics
- Per-member: attendance percentage over any date range, list of sessions attended/missed
- Per-session: headcount, full attendance list, breakdown by check-in method
- Per-domain: aggregate attendance percentage, "at-risk" members below a configurable threshold (e.g. below 75%)
- Export any report view to CSV

### H. PWA Setup
- `manifest.json`: app name "Presently", short_name, icons (multiple sizes), theme color, standalone display mode
- Minimal service worker registered purely so the browser recognizes the app as installable ("Add to Home Screen" on Android and iOS Safari) — **do not implement offline caching, background sync, or offline queuing at this stage**
- In-app message where NFC would appear on unsupported devices: "NFC tap-in is available on Android devices using Chrome or Edge. Please use manual check-in on this device."

---

## 6. UI/Screens Checklist

1. Login
2. Member Dashboard — my attendance %, upcoming sessions
3. Admin/Lead Dashboard — sessions overview, quick "take attendance" access, at-risk members
4. Member Management — list, add/edit, card registration
5. Domain Management — create/edit domains, assign leads
6. Session Create/Edit
7. Take Attendance — NFC tab + Manual search tab
8. Reports — member view, session view, domain view, CSV export
9. Settings/Profile

---

## 7. Notes for the Generator

- Web NFC requires a user gesture and HTTPS — always trigger `.scan()` from a direct button tap, never automatically on page load.
- `student_id` (e.g. "sd1234") is the primary field for manual search since it's short and matches what's likely printed on ID cards; `register_no` and `name` are secondary search fields.
- Use the `UNIQUE (session_id, member_id)` constraint on `attendance` to naturally prevent duplicate check-ins rather than handling it purely in app logic.
- Set up Supabase RLS policies matching the role permissions in Section 4 before exposing any write access.
- Build order: Auth → Members → Domains → Sessions → Manual attendance → NFC attendance → Reports → PWA manifest/installability.

### Next.js-specific notes
- Use the **App Router** (`app/` directory), with route groups for `(auth)`, `(member)`, and `(admin)` sections as appropriate.
- Use **Server Components** for data-heavy read views (reports, member lists, session lists) — fetch directly from Supabase on the server.
- Use **Client Components** (`"use client"`) for anything interactive or browser-API-dependent: the NFC scan screen, manual search/check-in UI, forms.
- Handle Supabase Auth session syncing between server and client using `@supabase/ssr` (middleware + server client + browser client pattern), not the older auth-helpers package.
- Protect admin/lead routes with middleware that checks the user's role (fetched from the `members` table) and redirects unauthorized users.
- Place `manifest.json` and icons in the `public/` directory (or `app/manifest.ts` using Next's native manifest file support) and register the minimal service worker for installability only.