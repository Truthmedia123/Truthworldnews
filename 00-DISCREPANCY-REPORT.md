# Discrepancy Report — Prior Integration Packages vs Actual GitHub Repo

**Date:** 2026-07-16
**Repo audited:** https://github.com/Truthmedia123/Truthworldnews (cloned fresh)
**Prior packages reviewed:**
- `/home/z/my-project/download/twn-integration-v5.7/` (16 files, 2325 lines)
- `/home/z/my-project/download/twn-integration-artifacts/` (13 files, 2594 lines)

This document explains why a new v6 package was needed. The prior packages were built from a PDF spec, not from the actual repo — and the gap between spec and reality is significant.

---

## Critical Issues in the Actual Repo (Must Fix Before Any Migration)

### 1. `output: 'export'` is fundamentally broken for this codebase

**File:** `next.config.ts`
```ts
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
```

The repo uses `output: 'export'` (static HTML export), but the codebase also contains:

| Feature in repo | Requires | Incompatible with `output: 'export'`? |
|---|---|---|
| `src/middleware.ts` (Supabase auth for `/admin/*`) | Server runtime | **YES** — middleware doesn't run on static export |
| `src/app/api/post-news/route.ts` | Server runtime | **YES** — API routes don't exist in static export |
| `src/app/category/[slug]/page.tsx` (server-side Supabase fetch) | Server components | **YES** — pages are pre-rendered at build time, not request time |
| `src/app/sitemap.ts`, `src/app/rss.xml/route.ts` | Server runtime | **YES** — these will be static files, never update |
| Article URLs use `/article?id=UUID` (client-side fetch) | Browser JS | Works, but bad for SEO |

**Net effect:** the current repo CANNOT build successfully with `next build` if `output: 'export'` is set. Either the user has been running `next dev` only (no production builds), or the build fails silently and they haven't noticed.

**Fix in v6:** Switch to `output: 'standalone'`. This unlocks:
- Real middleware (auth gate for `/admin/*`)
- Real API routes (Ghost webhook receiver, tip submit, etc.)
- ISR (60s revalidation per v5.7 spec)
- Custom imgproxy loader (replaces `images: { unoptimized: true }`)

### 2. Hardcoded Supabase credentials in source (SECURITY)

**File:** `src/lib/supabase.ts`
```ts
const supabaseUrl = 'https://vimwmyheupvmwpxtftvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXdteWhldXB2bXdweHRmdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTQ4MzUsImV4cCI6MjA5NDk5MDgzNX0.5A27-t_7ND3IA7qMrlSwA1aedXKnKB90GBUTPCip-Y8'
```

Comment says "Temporary hardcoded for testing - revert to env vars later". This is the **anon key** (not service role), so it's not catastrophic, but it's committed to a public GitHub repo. Anyone can read the user's database directly.

**Fix in v6:** Delete `src/lib/supabase.ts` entirely. All data access goes through Ghost (articles) or Postgres (tips, reactions, editorial log). Supabase is decommissioned.

**Immediate action required:** After deploying v6, the user should:
1. Rotate the Supabase project's anon key (Dashboard → Settings → API → "Rotate anonymous key")
2. Or pause/delete the Supabase project once migration is complete

### 3. Dual schema — `news_articles` (schema.sql) vs `posts` (in code)

The repo has TWO different table names for articles:

| File | Table referenced |
|---|---|
| `supabase/schema.sql` (line 7) | `news_articles` |
| `supabase/migrations/0001_initial_schema.sql` | (presumably `news_articles`) |
| `src/app/page.tsx` (line 17) | `news_articles` |
| `src/app/api/post-news/route.ts` (line 41) | `posts` |
| `src/app/admin/dashboard/page.tsx` (line 30) | `posts` |
| `src/app/admin/review/page.tsx` (line 30) | `posts` |
| `src/app/category/[slug]/page.tsx` (line 40) | `posts` |
| `src/app/search/page.tsx` (line 21) | `posts` |
| `scripts/distribute.py` (line 93) | `posts` |

Either the user has both tables in Supabase (likely, given migrations 0001–0007), or one set of pages is broken. The `posts` table seems to have columns `is_published`, `reviewed_by`, `reviewed_at`, `view_count` (referenced in admin pages) that `news_articles` doesn't have.

**Fix in v6:** Migration script reads from BOTH tables, dedupes by `content_hash`, and writes a single canonical set into Ghost. The `is_published` / `reviewed_by` columns map to Ghost's `status` (`published` vs `draft`) and a Ghost custom field `reviewed_by`.

### 4. Article URL pattern: `/article?id=UUID` (repo) vs `/article/[slug]` (prior packages)

Repo: every Link uses `href={\`/article?id=${post.id}\`}` (client-side, query string, UUID in URL)
Prior packages: assumed `/article/[slug]/page.tsx` (server-side, Ghost-style slug)

**SEO impact:** UUIDs in URLs are bad for Google. Ghost uses slugs by default.

**Fix in v6:**
1. Build `/article/[slug]/page.tsx` (server-side, ISR 60s, Ghost slug)
2. Keep `/article/page.tsx` as a 301-redirect handler: if `?id=UUID` is present, look up the slug (via Ghost API or a redirect map), 301 to `/article/{slug}`
3. All internal Links updated to `/article/{slug}` instead of `/article?id={id}`
4. Submit a one-time redirect map to Google Search Console

### 5. Admin auth: Supabase Auth → ??? (prior packages left this blank)

Repo uses `supabase.auth.signInWithPassword()` and `middleware.ts` checks `sb-access-token` cookie.

Prior v5.7 packages said "delete middleware.ts" but never specified how `/admin/*` gets protected. Ghost Admin lives at `admin.truthworldnews.com` (Ghost's own admin UI), but the user has a CUSTOM admin dashboard (`/admin/dashboard`, `/admin/review`) that they want to keep.

**Fix in v6:** Build a simple JWT-based auth in `src/lib/auth.ts`:
- `/api/auth/login` endpoint: accepts email + password, validates against `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` env vars (bcrypt), returns HttpOnly cookie with signed JWT (HS256, 24h expiry)
- `middleware.ts` rewritten: reads cookie, verifies JWT, redirects to `/admin/login` if invalid
- `src/app/admin/login/page.tsx` rewritten: no Supabase, posts to `/api/auth/login`
- For multi-user support later: add a `users` table in Postgres. For now, single-admin via env vars is sufficient (matches OPERATIONS.md — only the CTO has admin access).

### 6. The "BrightBean Studio" Python distribution doesn't exist

**File:** `scripts/distribute.py` (line 4)
```python
"""TruthWorldNews Distribution Engine
Auto-posts articles to social platforms via BrightBean Studio API."""
```

`BRIGHTBEAN_URL = os.getenv("BRIGHTBEAN_URL", "http://localhost:8000")` — this is a fictitious service. The fallback `save_local_queue()` writes to `social_queue.json` and is probably what's actually running.

**v5.7 stack uses Postiz** (self-hosted, supports 30+ platforms). The Python `distribute.py` is obsolete.

**Fix in v6:**
1. Mark `scripts/distribute.py` as deprecated
2. Replace with `scripts/trigger-postiz.py` — a thin script that calls Postiz's REST API (`POST /api/v1/posts`) when an article is published (called via Ghost webhook → n8n workflow → Python script, OR directly from Ghost webhook to Postiz)
3. OR: delete `distribute.py` entirely and let n8n handle it (recommended — n8n is already in the v5.7 stack)

### 7. AdSense vs Plausible — prior packages wrongly assumed replacement

Prior packages (esp. `twn-integration-v5.7/PlausibleScript.tsx`) replaced AdSense with Plausible. But the repo's `OPERATIONS.md` line 106 specifies **AdSense + affiliates = $1,000/month by Month 12** — AdSense is revenue-critical.

**Fix in v6:** Run BOTH in parallel:
- AdSense (revenue) — kept as-is, with `AdSlot`, `ConditionalAds`, `AdSenseBaseScript`, `useAdReady` hook all preserved
- Plausible (privacy-respecting analytics) — added alongside GA4 in `layout.tsx`, not replacing it
- Microsoft Clarity (heatmaps) — kept as-is

Only Supabase is fully decommissioned. Everything else (AdSense, GA4, Clarity, Giscus optionally) stays.

### 8. Pages the prior packages completely ignored

The repo has 20+ pages the prior packages never mapped:

| Page | Purpose | v6 treatment |
|---|---|---|
| `/quizzes`, `/quiz/[id]`, `/quiz/[id]/QuizClient.tsx` | Quiz engine | Keep — uses `quiz_engine` migration table. Migrate to Postgres. |
| `/admin/login`, `/admin/dashboard`, `/admin/review` | Custom admin | Keep — rewrite to use Ghost Admin API + Postgres (not Supabase) |
| `/editorial-log` | Public compliance page | Keep — reads from `editorial_log` Postgres table |
| `/fact-checking` | Static trust page | Keep — static content, no changes |
| `/submit-tip` | Anonymous tip form | Keep — posts to Postgres `tips` table |
| `/dmca`, `/dmca/form` | DMCA takedown workflow | Keep — form posts to Postgres `dmca_requests` table |
| `/data-request` | GDPR data request | Keep — form posts to Postgres `data_requests` table |
| `/premium` | Paid tier landing page | Keep — static for now, can later integrate with Ghost Members |
| `/about`, `/contact`, `/privacy`, `/privacy-policy`, `/terms`, `/terms-of-service`, `/cookie-policy` | Legal/static | Keep — no changes |
| `/rss.xml/route.ts` | RSS feed | Replace — rewrite to proxy Ghost's RSS at `https://ghost.local/rss/` |
| `/sitemap.ts` | XML sitemap | Replace — proxy Ghost's sitemap index |
| `/not-found.tsx` | 404 page | Keep — no changes |

### 9. Article body uses `article.content.split('\n\n')` — Ghost uses Mobiledoc/Koenig Lexical

**File:** `src/app/article/page.tsx` (line 100)
```tsx
{article.content?.split('\n\n').map((paragraph: string, idx: number) => (
  <p key={idx} className="text-lg leading-relaxed mb-6">{paragraph}</p>
))}
```

Supabase stored content as plain markdown-ish text. Ghost stores it as **Mobiledoc** (JSON) or **Lexical** (newer). Plain `.split('\n\n')` won't render Ghost content correctly.

**Fix in v6:**
- Use `mobiledoc-react-renderer` (official Ghost package) to render Mobiledoc → React
- OR: request plaintext from Ghost Content API (`formats: ['plaintext']`) and keep the simple split — fastest path, loses rich formatting (embeds, galleries, callouts)
- OR: use Lexical renderer if Ghost is on v6+ (Lexical replaced Mobiledoc in Ghost 6.0)

**Recommended:** Start with `formats: ['plaintext']` for the initial migration (zero new deps, gets the user live fast). Add `mobiledoc-react-renderer` later for rich content.

### 10. The repo's CATEGORIES list is hardcoded and differs from Ghost's tag model

Repo hardcodes 7 categories: `['AI', 'Crypto', 'Weird Tech', 'Leaks', 'Rants', 'Investigations', 'News']` (in `category/[slug]/page.tsx` line 5), plus `WORLD` in the post-news zod schema.

Ghost uses free-form **tags**, not a fixed category enum. Migration must:
1. Create these 8 tags in Ghost Admin
2. Set each migrated article's primary tag to its `category` value
3. Update `category/[slug]/page.tsx` to fetch by tag slug (e.g., `/tag/ai/` → Ghost tag `AI`)
4. Add a `VALID_CATEGORIES` constant in `src/lib/categories.ts` for the navbar + validation

---

## Summary: Why v6 Exists

The prior packages were architectural sketches — they described what a v5.7-compliant TWN frontend *should* look like. But they didn't reference the actual code on GitHub, so they:

1. Couldn't tell the user which specific lines to change
2. Missed that the current build is broken (output: 'export' + middleware + API routes is a contradiction)
3. Missed the hardcoded Supabase credentials
4. Missed the dual-schema problem (`posts` vs `news_articles`)
5. Left admin auth undefined (just "delete middleware")
6. Missed 20+ pages that need preservation
7. Missed that the Python pipeline posts to a fictitious service
8. Wrongly recommended replacing AdSense with Plausible (AdSense is revenue-critical)
9. Missed the article URL pattern (`/article?id=UUID` vs `/article/[slug]`)
10. Missed that article content needs a real renderer (not `.split('\n\n')`)

**v6 fixes all 10 issues.** Every code change in v6 references the exact file and lines in the actual repo.

---

## What v6 Preserves from Prior Packages

The prior packages got a lot right. v6 keeps:
- The Ghost Content API client pattern (`@tryghost/content-api` SDK)
- The custom-fields typed accessor pattern
- The imgproxy signed-URL approach (HMAC-SHA256)
- The Meilisearch client pattern
- The remark42 comment component pattern
- The strict CSP in next.config.ts
- The Ghost RSS rewrite pattern in next.config.ts
- The migration script structure (dry-run, idempotent, paginated)
- The 60s ISR decision from v5.7
- The `twn_articles` Meilisearch index name
- The signed imgproxy URL presets (hero/card/thumb/avatar)

v6 isn't a rewrite of the prior work — it's a course-correction to make it actually apply to the user's real codebase.
