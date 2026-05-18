# LinkPlanet — Plan Workspace

> Design-first. Code follows the vision.

## What We're Building
Modern URL shortener + analytics platform. Single user (owner only).

---

## Tech Stack
- **Framework:** Next.js 15 App Router (TypeScript)
- **DB:** Neon (PostgreSQL)
- **ORM:** Prisma
- **UI:** shadcn/ui + Tailwind + Framer Motion
- **Hosting:** Vercel
- **No separate backend** — Next.js API Routes handle everything

---

## Auth (Custom)
Two-layer sequential auth:
1. Draw pattern on dot grid
2. Pattern correct → password field appears
3. Both match → JWT session → dashboard

**Alerts via Telegram Bot:**
- Pattern wrong **3+ times** → alert
- Pattern correct but password wrong **2+ times** → alert (even if they eventually get in)

Attempt tracking: Neon DB table (`login_attempts` keyed by IP)
Credentials (pattern hash + password hash): stored in `.env`

---

## Core Feature Priority
1. URL shortening (slug generation, custom slugs)
2. DB schema
3. Redirect system (`/r/[slug]` route handler)
4. Analytics capture (before redirect): clicks, browser, OS, device, country, referrer, timestamp
5. Dashboard UI

---

## DB Schema (rough)
- `Link` — id, slug, originalUrl, createdAt, active
- `Click` — id, linkId, browser, os, device, country, referrer, ip, timestamp
- `LoginAttempt` — id, ip, patternFails, passwordFails, updatedAt

---

## Design Inspiration (Secret DNA)
- **Genshin Impact** — soft ambient glow, nature/tech contrast, illustrated depth
- Vercel, Supabase, Apple — clean data layer, minimal chrome

---

## UI — Lock Screen (Auth Page)
- Full-screen **curtain** animation as the auth page
- Glassmorphic container — pattern dot grid inside
- Curtain slightly parts → password field slides in
- Correct auth → curtain **opens wide** → smooth fade into dashboard
- Library: **Framer Motion** (clip-path / scaleY animation)

### PC Constraints
- Curtain: `max-width: 1200px`, centered
- Pattern + password containers: `max-width: 1080px`, relative inside curtain

---

## UI — Homepage Layout

### Mobile (360–420px)
- **30% top** — nature scene (compact, portrait-friendly)
- **70% bottom** — smooth-scrolling links list (Lenis), 16px side padding

### PC / Desktop
- **~40% top** — nature scene, **full viewport width**, faded/vignette on left & right edges
- Scene extends wide — more ground, sky, plants, trees visible on both sides
- **60% bottom** — links container, **max-width: 1080px**, centered

### Nature Scene — 2D Layered SVG + CSS Parallax
Layers (back → front): Sky → Distant mountains → Mid mountains/trees → Garden/foliage → Pond → Foreground

Animation: **GSAP** (clouds drifting, birds flying, water shimmer)

### Time-Based Scene (Chennai IST — no API)
| Time | Scene |
|---|---|
| 5–7am | Dawn — soft orange mist, fog on pond |
| 7–11am | Morning — bright blue, birds active |
| 11–3pm | Afternoon — harsh sun, still pond |
| 3–6pm | Golden hour — warm amber |
| 6–7pm | Sunset — pink/purple sky |
| 7–8pm | Dusk — deep violet, first stars |
| 8pm–5am | Night — dark navy, moon, fireflies |

Each state = sky gradient + SVG layer visibility change

---

## Phase 2 (later)
- AI analytics summaries
- Campaign insights
- Bio-link pages
- Branded sharing kits

---

## Design System

### Typography
- **Font:** `Sen` (Google Fonts) — placeholder until final decision
- Title: `18–20px`
- Body: `14–16px`
- Caption: `12px`
- Line-height: relaxed / readable

### Mobile-First (NON-NEGOTIABLE)
- Design base: `360px–420px` width
- Side padding: `16px` left & right on mobile
- Priority: one-hand usage

---

## Still To Clarify
- [ ] Dashboard page design/layout
- [ ] Analytics page design
- [ ] Per-link detail view
- [ ] Any other pages/flows?
- [ ] Font choices
- [ ] Color palette (beyond time-based scene)
- [ ] Telegram Bot token + Chat ID (for alerts)
- [ ] Neon DB connection string
- [ ] Pattern + password (set before deploy, stored in .env)

