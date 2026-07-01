# Human Design
> LinkPlanet Design System — v1.0

---

## Typography

### Pairing: Syne + Urbanist

| Role | Font | Usage |
|---|---|---|
| **Heading** | [Syne](https://fonts.google.com/specimen/Syne) | `h1`–`h6`, logo wordmark, section titles, stat numbers |
| **Body** | [Urbanist](https://fonts.google.com/specimen/Urbanist) | All body text, labels, inputs, buttons, captions |

### Rules
- Base font size: **16px** (never smaller for body)
- Headings: bold or semibold weight only
- Labels & microcopy: `text-[10px]–text-xs`, uppercase + tracked wide
- Monospace (`font-mono`): short URLs and slugs only
- Never mix more than these two families in the UI

---

## Color Palette — Tri-Color System

> 60 / 30 / 10 ratio rule

| Token | Hex | Usage | Ratio |
|---|---|---|---|
| `haiti` | `#18102b` | Backgrounds, cards, deep surfaces | **60%** |
| `chalk` | `#f5f3ff` | Text on dark, light backgrounds | **30%** |
| `electric` | `#834dfb` | CTAs, active states, accent highlights | **10%** |

### Never use:
- Yellow, orange, or red as UI tone (only for error states)
- Emerald / green as brand color (only for "live/active" data indicators)
- More than 3 primary brand colors at once

---

## Spacing & Radius

| Property | Value |
|---|---|
| Card radius | `20px` |
| Button radius | `8px` |
| Input radius | `16px` (large) or `8px` (compact) |
| Badge radius | `6px` (rounded-lg) or `full` (pill) |
| Base padding | `16px` side gutters |
| Card inner padding | `20px` (`p-5`) |
| Gap between cards | `20px` (`gap-5`) |

---

## Component Rules

### Cards
- Dark background: `#120c22`
- Border: `border-[#2b1f47]/50` — subtle, not loud
- Hover: border shifts to `[#834dfb]/40` + soft purple glow shadow
- Image area: `190px` height, `object-cover object-top`
- Hover overlay on image: frosted glass pill button centered

### Buttons
- Primary CTA: `bg-[#834dfb]` → `hover:bg-[#743deb]`, white text, `rounded-[8px]`
- Secondary: dark `bg-[#2b1f47]/60` + border, text-zinc-300
- Icon-only: square `w-8 h-8`, `rounded-lg`
- Disabled: `bg-zinc-800 text-zinc-600`, no shadow

### Stats / Numbers
- All stat numbers: **white**, `font-syne`, `text-2xl font-bold`
- Labels: `text-[10px] uppercase tracking-widest text-zinc-500`
- No per-stat accent colors (no disco rainbow)

### Hint / Info Boxes
- Background: `bg-[#834dfb]/10`
- Border: `border-[#834dfb]/30`
- Icon: Lightbulb in `text-[#834dfb]`
- Radius: `rounded-xl`
- Padding: `py-2 px-3` (hug content)

---

## Minimalism Principles

1. **One accent** per screen region — electric violet `#834dfb` only where it counts
2. **No rainbow stats** — uniform color for data numbers
3. **No decorative gradients** on text — reserved for backgrounds only
4. **Borders over shadows** — prefer subtle borders; only use shadows for depth/hover
5. **Empty space is content** — do not fill every pixel
