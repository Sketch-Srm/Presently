# Presently — Visual Design Prompt

Design the UI for **Presently**, a mobile-first club attendance PWA, built entirely around the attached logo: a chrome/silver isometric "S" formed from a single continuous interlocking ribbon, rendered in sharp 3D on pure black. The whole product should feel like an extension of that mark — precise, metallic, confident — not a generic dashboard with a logo pasted in the corner.

---

## 1. Design Language

**Mood**: premium, technical, quietly futuristic. Think brushed metal, precision-cut geometry, a product that feels closer to a high-end access-control system than a school club app. Confident restraint, not loud.

**Color tokens**
- `--bg-void: #0A0A0B` — primary background, near-black (matches logo backdrop exactly)
- `--bg-surface: #141416` — card/panel background, one step up from void
- `--chrome-light: #E8E8EA` — brightest edge of the metallic gradient (logo highlight tone)
- `--chrome-mid: #9CA0A6` — mid-tone metallic gray
- `--chrome-dark: #4A4D52` — shadowed edge of metallic elements
- `--accent-signal: #7DD8FF` — electric silver-blue, used ONLY for active/live states (scanning in progress, live session indicator) — this is the one color allowed to feel "alive"
- `--state-present: #6FCF97` — success green, reserved strictly for confirmed present/late marks, never decorative
- `--state-absent: #E85D5D` — muted red, reserved strictly for absent marks

**Typography**
- Display/headers: **Space Grotesk** (or similar geometric sans) — its angular lowercase forms echo the logo's cut edges. Use at bold weight, tight tracking, for session titles, big numbers (attendance %), and the app wordmark
- Body/UI: **Inter** — neutral, highly legible at small sizes for lists, form fields, table data
- Data/mono: a monospace face (e.g. **JetBrains Mono**) for `student_id`, `card_serial`, and timestamps — reinforces the "system" feel

**Surfaces & material**
- Cards and buttons use subtle metallic gradients (chrome-light → chrome-mid → chrome-dark at low opacity over dark surfaces) rather than flat fills, echoing the logo's beveled 3D faces
- Borders: 1px hairlines in chrome-dark, never harsh pure-white borders
- Corner treatment: sharp-ish, slightly cut corners (small radius, 6–8px) — NOT fully rounded/pill-shaped. The logo is all hard angles; the UI should respect that instead of defaulting to soft rounded cards

---

## 2. Signature Element

The logo's continuous ribbon-fold becomes the app's recurring visual signature, showing up in:
- **The tap-in confirmation animation**: when a check-in succeeds (NFC or manual), don't show a generic checkmark — animate a small version of the "S" ribbon folding closed in one continuous stroke, then settle into a chrome glow, accompanied by a subtle haptic-feeling scale-bounce
- **Tab/segment indicators**: the active tab underline is a short angled ribbon segment instead of a straight line
- **Loading state**: a minimal looping animation of the ribbon twisting (2–3 frame SVG morph), used sparingly — for the NFC "scanning..." state specifically, not for every spinner
- **Empty states**: a faded, monochrome single-line version of the "S" ribbon as a background watermark on empty screens (e.g. "no sessions yet")

Use this motif once, deliberately, in each of these places — not scattered everywhere as decoration.

---

## 3. Motion & Interaction

- **Page load**: on first load only, a brief (under 1s) sequence where the logo assembles from its two ribbon strokes before resolving into the login/dashboard screen — sets tone without becoming an annoying splash screen on every navigation
- **NFC scanning**: the scan button, when pressed, ripples outward in a chrome-gradient pulse synced to `--accent-signal`, and the ribbon-twist loader appears while `NDEFReader.scan()` is active
- **Successful check-in**: card/list item flashes a soft `--state-present` glow, member's row slides into a "checked in" group with a spring-easing transition, running counter ticks up with a quick number-roll animation
- **Manual search**: instant, no debounce lag feel — results filter with a subtle fade/slide, not a jarring re-render
- **Tab switches** (NFC / Manual): the ribbon-segment indicator slides and morphs its angle between tab positions rather than snapping
- **Respect `prefers-reduced-motion`**: fall back to simple opacity fades, no bounce/spring physics, no ribbon animations, for users who need it

---

## 4. Mobile-First Layout Principles

- Design for one-hand thumb use first — primary actions (Start Scan, Mark Present) live in comfortable thumb-reach zones (bottom third of screen), not top-of-screen only
- Bottom tab/nav bar for core sections (Dashboard, Sessions, Take Attendance, Reports, Profile) rather than a hamburger menu — attendance-taking needs to be fast, not buried
- Large tap targets (min 44px) throughout — this app will be used quickly, sometimes one-handed while holding a card in the other hand
- The "Take Attendance" screen is the most-used screen in the whole app — treat it as the hero screen of the product, not an afterthought buried in a session detail page. Big, obvious NFC/Manual toggle at the top, live counter always visible, minimal scrolling required
- Dark mode is not optional — it's the only mode. The entire palette above is designed for a permanently dark UI matching the logo's black backdrop

---

## 5. What to Avoid

- No cream/warm backgrounds, no terracotta accents — this is a cold, metallic, dark palette exclusively
- No fully rounded "friendly" pill buttons — respect the logo's sharp angularity
- No generic checkmark icons for success states — use the ribbon-fold motif instead
- No decorative gradients unrelated to the chrome material concept (no purple/pink SaaS gradients)
- Don't overuse the ribbon motif — one signature moment per context, not on every icon

---

## 6. Deliverable Notes

- Export the logo as SVG (recreate the geometry cleanly) so it can be used as a proper favicon, PWA app icon (multiple sizes: 192x192, 512x512, maskable variants), and inline UI element without quality loss
- App icon on Android/iOS home screens should keep the black background with the chrome "S" centered — matches the source image exactly, no added padding/background color changes
- Splash screen (PWA `manifest.json` theme) should use `--bg-void` as `background_color` and `theme_color` to keep the OS-level chrome consistent with the in-app experience