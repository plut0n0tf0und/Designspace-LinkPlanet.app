# LinkPlanet — Project Overview

**LinkPlanet** is a personal URL shortener and analytics platform with a distinctive “Genshin-inspired” aesthetic: custom two-step lock-screen auth, a time-of-day nature scene (Chennai IST), and a glassmorphic dashboard. The app lives under `app-src/`; supplementary planning notes are in `plan-workspace.md`.

---

## Repository layout

| Path | Role |
|------|------|
| `ProjectDetails.md` | This file — current project state and architecture |
| `plan-workspace.md` | Design spec — single-owner app, custom auth, nature UI |
| `app-src/` | Next.js 16 app (all runtime code) |

There is no root `README.md`; `app-src/README.md` is still the default create-next-app template.

---

## Tech stack (as built)

| Layer | Choice |
|-------|--------|
| Framework | Next.js **16.2** App Router, React 19 |
| DB | PostgreSQL via **Neon** + **Prisma 7** (`@prisma/adapter-pg` + `pg` pool) |
| Auth | Custom: pattern grid → password → **JWT** (`jose`) in `auth-token` cookie |
| Security alerts | **Telegram** bot on failed logins |
| UI motion | **Framer Motion**, **GSAP** (in deps), **Lenis** (wrapper exists, unused) |
| Styling | **Tailwind 4** + custom CSS tokens (`Sen`, `Cinzel`) |
| Planned but not wired | shadcn/ui, NextAuth (listed in `package.json`, unused) |

---

## Architecture (current flow)

```
/ — LockScreen
  → pattern + password APIs
  → JWT cookie (auth-token)
  → /dashboard (protected by src/proxy.ts)

/dashboard
  → POST /api/links (create)
  → GET /api/links (list + click counts)
  → PostgreSQL via Prisma

Visitor GET /r/[slug]
  → lookup Link
  → record Click (async)
  → 302 → originalUrl
```

**Auth** (`src/proxy.ts`): protects `/dashboard/*` by verifying JWT. Root `/` is the login screen.

**Links API** (`src/app/api/links/route.ts`): `POST` create, `GET` list with click counts.

**Redirects** (`src/app/r/[slug]/route.ts`): lookup slug → fire-and-forget `Click` row (UA parsing, IP, referrer, Vercel geo country) → 302 redirect.

**Schema** (`prisma/schema.prisma`): `Link`, `Click`, `LoginAttempt` — matches the plan; **no migrations folder** yet (schema only).

---

## What’s implemented vs planned

### Done (MVP-ish)

- **Custom lock screen** — `LockScreen` + `PatternGrid`, curtain animation, pattern/password APIs with bcrypt + attempt tracking + Telegram alerts
- **Dashboard** — nature scene header, link list, “New Link” CTA, mobile bottom nav (mostly decorative)
- **Create link** — form, API integration, copy-to-clipboard, placeholder analytics card (“Coming Soon”)
- **Redirect + click logging** — basic analytics fields on each visit
- **Prisma client** — production-style singleton with pg adapter

### Partial / gaps

1. **Short URL path mismatch** — UI shows `myoffer.link/{slug}` but the handler is **`/r/[slug]`**. Shared links won’t hit the redirect route unless you add rewrites or change the displayed URL.

2. **API not auth-guarded** — `proxy.ts` only guards `/dashboard`. **`/api/links` is open** — anyone can list/create links without a session.

3. **`SmoothScroll` (Lenis)** — component exists; dashboard uses native `overflow-y-auto` instead.

4. **Assets** — `globals.css` references `/fantasy-bg.png`; it’s **not** in `public/` (only default SVGs). Lock screen may be missing its background.

5. **shadcn/ui** — in the plan, not installed; UI is hand-rolled Tailwind/glass cards.

6. **Analytics UI** — DB captures clicks; dashboard shows counts only. No charts, filters, per-link detail, or unique visitors.

7. **Env / deploy** — no `.env.example` in repo. Expected vars: `DATABASE_URL`, `PATTERN_HASH`, `PASSWORD_HASH`, `AUTH_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

8. **Dependencies** — `three`, `next-auth` appear unused; adds bundle weight without benefit today.

9. **Prisma** — schema defined; migrations not committed; DB must be pushed/migrated manually before APIs work.

---

## UI / design direction

- **Mobile-first** (360–420px), 16px side padding
- **Dashboard layout**: ~38–50vh nature scene + scrollable link list (Lenis was planned for homepage; not wired on dashboard yet)
- **Nature scene**: 7 Chennai IST time bands (dawn → night) in `NatureScene.tsx`
- **Aesthetic**: soft gold (`#E7C77A`), ivory/stone, Cinzel headings — “traveler” fantasy tone
- **Lock screen**: separate fantasy portal treatment in CSS (`/fantasy-bg.png` expected)

See `plan-workspace.md` for full design DNA (Genshin-inspired ambient glow, curtain auth animation, time-based scene table).

---

## File map

```
app-src/
├── prisma/schema.prisma      # Link, Click, LoginAttempt
├── src/
│   ├── proxy.ts              # JWT guard for /dashboard
│   ├── lib/prisma.ts, telegram.ts
│   ├── components/
│   │   ├── LockScreen.tsx, PatternGrid.tsx
│   │   ├── NatureScene.tsx
│   │   └── SmoothScroll.tsx (unused)
│   └── app/
│       ├── page.tsx          # → LockScreen
│       ├── dashboard/        # list + create
│       ├── api/auth/         # pattern, password
│       ├── api/links/        # create + list
│       └── r/[slug]/         # redirect + tracking
```

---

## MVP goals

### Phase 1 (in progress)

- URL shortening
- redirect handling (`/r/[slug]`)
- analytics tracking (clicks in DB)
- dashboard
- authentication (custom pattern + password)

### Phase 2 (later)

- AI-generated analytics summaries
- campaign insights
- bio-link pages
- branded sharing kits

---

## Deployment goal

Deploy fully using:

- Vercel frontend
- Vercel serverless backend (API routes + redirect handler)
- Neon PostgreSQL

No traditional server required.

---

## Development notes for AI IDE

Focus on:

- scalable folder structure under `app-src/src`
- reusable components
- clean TypeScript
- maintainable architecture
- modern Next.js patterns (see `app-src/AGENTS.md` — Next.js 16 may differ from older docs)
- responsive UI
- fast performance

Before changing auth, links, or redirects: read `plan-workspace.md` for owner-only scope and security (Telegram alerts, env-based credential hashes).

Priority fixes for production readiness:

1. Align short URL display with `/r/[slug]` (or rewrites)
2. Protect `/api/links` with the same JWT session as dashboard
3. Add `.env.example` and Prisma migrations
4. Add missing `fantasy-bg.png` (or update CSS)
5. Build analytics UI on existing `Click` data
