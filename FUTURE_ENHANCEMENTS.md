# Multiple Vercel Subdomains — Implementation Plan

This document reviews the finalized architecture (primary admin domain + alternate redirect domains) and outlines the step-by-step implementation plan.

## Architectural Review

**1. Does this architecture fit cleanly into our current codebase?**
Yes, it fits seamlessly. Next.js App Router combined with Prisma makes this straightforward. The core redirect engine is contained in a single file (`app/[slug]/route.ts`), which can easily be updated to factor in the request's domain. The rest of the application (dashboard, login) will simply gain awareness of a new `domain` field on the `Link` model.

**2. Are there any technical concerns or hidden limitations?**
- **Host Resolution on Vercel:** We must ensure we accurately detect the domain the user is visiting. In Next.js, `req.headers.get("host")` is standard, but to be perfectly reliable across Vercel environments, we should use `req.nextUrl.hostname` or `req.headers.get("x-forwarded-host") ?? req.headers.get("host")`.
- **Alternate Domains Still Have UI:** Because all domains run the identical codebase, `enma.vercel.app` will technically still render the login page at `/` and have the API routes for auth. This isn't a security risk (they share the same DB and password hashes), but it means your "alternate domains" aren't *strictly* API-only. 
- **CORS/API Limits:** If in the future you build widgets that fetch from the API across domains, you'd need CORS. Since this is purely server-side redirects, CORS is not an issue.

**3. Is there a better way to implement this while keeping the same user experience?**
As established, if you strictly want free `.vercel.app` subdomains (and refuse to purchase a custom domain like `vicki.com`), this multiple Vercel project approach is the **only and best** way to achieve the exact UX you want. It's a clever, zero-cost architecture.

**4. What files, database schema, routes, and components will need to change?**

| Component Layer | Files to Modify |
| --- | --- |
| **Database** | `prisma/schema.prisma` |
| **Redirect Engine** | `src/app/[slug]/route.ts` |
| **API API** | `src/app/api/links/route.ts` (GET & POST) |
| **Dashboard UI** | `src/app/dashboard/page.tsx` (Link list view) |
| **Create Form UI** | `src/app/dashboard/create/page.tsx` (Add domain dropdown) |
| **Environment** | `.env` (Add `ALLOWED_DOMAINS` and `DEFAULT_DOMAIN`) |

---

## Step-by-Step Implementation Plan

### Step 1: Database Schema & Migration
1. **Modify `schema.prisma`**:
   - Add `domain String @default("vignesh-designspace.vercel.app")` to the `Link` model.
   - Remove the `@@index([slug])` and `@unique` on `slug`.
   - Add `@@unique([domain, slug])` so a slug can be reused across different domains.
2. **Prisma Push**: Run `npx prisma db push` to apply the schema changes. The default value ensures all existing links in your Neon database are safely migrated to your primary domain.

### Step 2: Environment Configuration
1. Add to `.env`:
   ```env
   DEFAULT_DOMAIN="vignesh-designspace.vercel.app"
   ALLOWED_DOMAINS="vignesh-designspace.vercel.app,vicki-dimension.vercel.app,enma.vercel.app"
   ```

### Step 3: Redirect Engine Updates
1. **Modify `app/[slug]/route.ts`**:
   - Extract the request hostname: `const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";`
   - Update the Prisma query to include the domain:
     ```typescript
     const link = await prisma.link.findUnique({
       where: {
         domain_slug: {
           domain: host,
           slug,
         },
       },
     });
     ```

### Step 4: API Updates
1. **Modify `app/api/links/route.ts` (POST)**:
   - Extract `domain` from the request body. If missing, fallback to `process.env.DEFAULT_DOMAIN`.
   - Include `domain` in the `prisma.link.create` call.

### Step 5: Dashboard UI Updates
1. **Modify `app/dashboard/create/page.tsx`**:
   - Parse `process.env.ALLOWED_DOMAINS` into an array of options.
   - Add a `<select>` dropdown above the Slug field for Domain selection.
   - Default the selection to `process.env.DEFAULT_DOMAIN`.
   - Ensure the selected domain is sent in the API payload.
2. **Modify `app/dashboard/page.tsx`**:
   - Update the UI where the short link is displayed to use `${link.domain}/${link.slug}` instead of a hardcoded string.
   - (Optional but recommended) Add a visual badge next to each link indicating its domain.
