# TruthWorldNews — Repo-Aware Migration Runbook v6

**Goal:** Migrate the existing Next.js 16 + Supabase repo (`github.com/Truthmedia123/Truthworldnews`) onto the v5.7 self-hosted stack (Ghost + Postgres + Meilisearch + imgproxy + remark42 + Plausible + Postiz) without losing any existing UI, content, or functionality.

**Read this first:** `00-DISCREPANCY-REPORT.md` — explains why this package exists and what prior packages missed.

**Estimated effort:** 18–24 focused hours (3–4 days)
**Risk:** Low — idempotent migration script, dry-run mode, rollback path
**Replaces:** `twn-integration-v5.7/INTEGRATION-README-v5.7.md` and `twn-integration-artifacts/INTEGRATION_README.md`

---

## Table of Contents

1. [Pre-flight (do this first, ~30 min)](#1-pre-flight)
2. [Branch & install (~15 min)](#2-branch--install)
3. [Replace configuration (~10 min)](#3-replace-configuration)
4. [Replace data layer (~3 hours)](#4-replace-data-layer)
5. [Replace auth (~1 hour)](#5-replace-auth)
6. [Replace API routes (~2 hours)](#6-replace-api-routes)
7. [Replace pages (~4 hours)](#7-replace-pages)
8. [Add new components (~30 min)](#8-add-new-components)
9. [Run content migration (~1 hour)](#9-run-content-migration)
10. [Build & smoke test (~30 min)](#10-build--smoke-test)
11. [Deploy to v5.7 stack (~30 min)](#11-deploy-to-v57-stack)
12. [Decommission Supabase (~15 min)](#12-decommission-supabase)
13. [Post-migration verification checklist](#13-post-migration-verification-checklist)
14. [Rollback procedure](#14-rollback-procedure)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Pre-flight

### 1.1 Snapshot the Supabase database

```bash
# Install supabase CLI if you don't have it
npm install -g supabase

# Login + link
supabase login
supabase link --project-ref vimwmyheupvmwpxtftvg

# Dump all tables to a local backup
mkdir -p ~/twn-backup
supabase db dump --data-only -f ~/twn-backup/supabase-data-$(date +%Y%m%d).sql

# Also dump schema for reference
supabase db dump -f ~/twn-backup/supabase-schema-$(date +%Y%m%d).sql

# Verify the dump
wc -l ~/twn-backup/supabase-*.sql
```

If the CLI doesn't work, use the dashboard:
1. Go to https://supabase.com/dashboard/project/vimwmyheupvmwpxtftvg/database/backups
2. Click "Create backup"
3. Download the resulting `.sql` file

### 1.2 Confirm v5.7 stack is running

The v5.7 stack must be live at these URLs (per `TWN-v5.7-Final-Stack-Reference.pdf`):

| Service | URL | Health check |
|---|---|---|
| Ghost | `https://news.truthworldnews.com/ghost/` | Should show Ghost Admin login |
| Postgres | `localhost:5432` | `psql -h localhost -U twn -d twn` |
| Meilisearch | `https://api.truthworldnews.com/search/health` | `{"status":"available"}` |
| imgproxy | `https://img.truthworldnews.com/health` | 200 OK |
| remark42 | `https://admin.truthworldnews.com/remark42/api/v1/ping` | `pong` |
| Plausible | `https://admin.truthworldnews.com/plausible/` | Site list |
| Postiz | `https://admin.truthworldnews.com/postiz/` | Dashboard |

If any service is down, fix the stack first (see `TWN-FINAL-STACK-v5.md`).

### 1.3 Provision Ghost

In Ghost Admin (`https://news.truthworldnews.com/ghost/`):

1. **Create the 8 canonical tags** (Settings → Tags → New tag):
   - `AI`, `Crypto`, `Weird Tech`, `Leaks`, `Rants`, `Investigations`, `News`, `WORLD`
   - Set slug for each (`ai`, `crypto`, `weird-tech`, etc.) — these become URL paths
   - Set a description for each (for SEO)

2. **Create a Staff author** (Settings → Staff → Invite):
   - Name: `Zane Edge`
   - Email: `zane@truthworldnews.com`
   - Role: Author
   - This becomes the author on every migrated article.

3. **Generate a Custom Integration** (Settings → Integrations → Add custom integration):
   - Name: `TWN Migration`
   - Copy: **Content API Key** + **Admin API Key**
   - Note the **API URL**: `https://news.truthworldnews.com` (public) and `http://ghost:2368` (internal, for Docker network)

4. **Generate an Admin API personal token** (Settings → Labs → Integrations → Admin API):
   - Used by `/api/post-news` and the migration script

### 1.4 Provision Meilisearch index

```bash
# Create the twn_articles index
curl -X POST "https://api.truthworldnews.com/search/indexes" \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"uid":"twn_articles","primaryKey":"id"}'

# Configure searchable attributes
curl -X PATCH "https://api.truthworldnews.com/search/indexes/twn_articles/settings/searchable-attributes" \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '["title","tldr_summary","content","category"]'

# Configure filterable attributes
curl -X PATCH "https://api.truthworldnews.com/search/indexes/twn_articles/settings/filterable-attributes" \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '["category","tags","status","published_at"]'

# Configure sortable attributes
curl -X PATCH "https://api.truthworldnews.com/search/indexes/twn_articles/settings/sortable-attributes" \
  -H "Authorization: Bearer $MEILI_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '["published_at","created_at"]'
```

### 1.5 Provision Postgres schema

Save as `postgres-schema.sql` and run via `psql -h localhost -U twn -d twn -f postgres-schema.sql`:

```sql
-- Non-article data (articles live in Ghost)

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  evidence_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fire', 'mind_blown', 'fake_news', 'boring', 'agree', 'disagree')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_slug, reaction_type)  -- one reaction per type per article per user (simplified; use IP+slug if anonymous)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'site-footer'
);

CREATE TABLE IF NOT EXISTS editorial_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dmca_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complainant_name TEXT NOT NULL,
  complainant_email TEXT NOT NULL,
  infringing_url TEXT NOT NULL,
  original_url TEXT,
  description TEXT,
  good_faith BOOLEAN DEFAULT FALSE,
  accuracy BOOLEAN DEFAULT FALSE,
  signature TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'deletion', 'correction', 'export')),
  details TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id TEXT NOT NULL,
  user_session TEXT,
  answers JSONB,
  score INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tips_submitted_at ON tips(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_article_slug ON reactions(article_slug);
CREATE INDEX IF NOT EXISTS idx_editorial_log_article_slug ON editorial_log(article_slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
```

### 1.6 Generate secrets

```bash
# JWT secret for admin auth (32 bytes hex)
openssl rand -hex 32
# → save as ADMIN_JWT_SECRET in .env

# imgproxy signature key (16 bytes hex)
openssl rand -hex 16
# → save as IMGPROXY_KEY in .env

# API secret key for /api/post-news auth (32 bytes hex)
openssl rand -hex 32
# → save as API_SECRET_KEY in .env

# Admin password (bcrypt hash)
htpasswd -bnBC 10 "" "YOUR_CHOSEN_PASSWORD" | tr -d ':\n' | sed 's/$2y/$2b/'
# → save as ADMIN_PASSWORD_HASH in .env
```

---

## 2. Branch & install

```bash
cd ~/projects/Truthworldnews   # or wherever you cloned it
git checkout -b migrate/v6-ghost-postgres
git pull origin main

# Install new deps
npm install @tryghost/content-api @tryghost/admin-api jose pg mobiledoc-react-renderer

# Remove Supabase + Giscus deps (after migration complete, not yet)
# npm uninstall @supabase/supabase-js @giscus/react   # ← DO THIS IN STEP 12

# Verify
npm ls @tryghost/content-api @tryghost/admin-api jose pg
```

---

## 3. Replace configuration

### 3.1 Copy v6 files into the repo

```bash
# From this package's directory:
cp src/lib/ghost.ts               ~/projects/Truthworldnews/src/lib/
cp src/lib/ghost-admin.ts         ~/projects/Truthworldnews/src/lib/
cp src/lib/postgres.ts            ~/projects/Truthworldnews/src/lib/
cp src/lib/custom-fields.ts       ~/projects/Truthworldnews/src/lib/
cp src/lib/imgproxy-loader.ts     ~/projects/Truthworldnews/src/lib/
cp src/lib/auth.ts                ~/projects/Truthworldnews/src/lib/
cp src/lib/categories.ts          ~/projects/Truthworldnews/src/lib/

cp src/middleware.ts              ~/projects/Truthworldnews/src/middleware.ts

cp src/app/api/post-news/route.ts    ~/projects/Truthworldnews/src/app/api/post-news/route.ts
cp src/app/api/auth/login/route.ts   ~/projects/Truthworldnews/src/app/api/auth/login/route.ts
cp src/app/api/auth/logout/route.ts  ~/projects/Truthworldnews/src/app/api/auth/logout/route.ts
cp src/app/api/tip/route.ts          ~/projects/Truthworldnews/src/app/api/tip/route.ts
cp src/app/api/subscribe/route.ts    ~/projects/Truthworldnews/src/app/api/subscribe/route.ts
cp src/app/api/reactions/route.ts    ~/projects/Truthworldnews/src/app/api/reactions/route.ts

cp src/app/page.tsx                  ~/projects/Truthworldnews/src/app/page.tsx
cp -R src/app/article/\[slug\]        ~/projects/Truthworldnews/src/app/
cp src/app/category/\[slug\]/page.tsx ~/projects/Truthworldnews/src/app/category/\[slug\]/page.tsx
cp src/app/search/page.tsx           ~/projects/Truthworldnews/src/app/search/page.tsx

cp src/components/Remark42Comments.tsx ~/projects/Truthworldnews/src/components/
cp src/components/PlausibleScript.tsx  ~/projects/Truthworldnews/src/components/

cp next.config.ts   ~/projects/Truthworldnews/next.config.ts
cp .env.example     ~/projects/Truthworldnews/.env.example

cp Dockerfile       ~/projects/Truthworldnews/Dockerfile
cp docker-compose.twn-nextjs.yml ~/projects/Truthworldnews/

cp scripts/migrate-supabase-to-ghost.ts         ~/projects/Truthworldnews/scripts/
cp scripts/migrate-tips-reactions-to-postgres.ts ~/projects/Truthworldnews/scripts/
cp scripts/sync-meilisearch.ts                  ~/projects/Truthworldnews/scripts/

cp .github/workflows/build.yml ~/projects/Truthworldnews/.github/workflows/
```

### 3.2 Update `src/app/article/page.tsx` to be a redirect handler

The existing `/article/page.tsx` (with `?id=UUID` query string) must become a 301-redirect to `/article/[slug]`:

```bash
# Replace the existing /article/page.tsx with the v6 redirect version
cp src/app/article/page.tsx ~/projects/Truthworldnews/src/app/article/page.tsx
```

(The v6 file at `src/app/article/page.tsx` in this package does this redirect logic.)

### 3.3 Update `src/app/layout.tsx` — add Plausible, keep everything else

Edit `~/projects/Truthworldnews/src/app/layout.tsx`:

**Find this block (around line 110–117):**
```tsx
      <body className="min-h-full flex flex-col font-serif">
        <Navbar />
        <div className="flex-grow">{children}</div>
        <ConditionalAds />
        <Footer />
        <CookieConsent />
      </body>
```

**Replace with:**
```tsx
      <body className="min-h-full flex flex-col font-serif">
        <Navbar />
        <div className="flex-grow">{children}</div>
        <ConditionalAds />
        <Footer />
        <CookieConsent />
        <PlausibleScript />
      </body>
```

And add the import at the top:
```tsx
import PlausibleScript from "@/components/PlausibleScript";
```

Do NOT remove the GA4 or Microsoft Clarity scripts — they run in parallel with Plausible per the v6 design decision (see discrepancy report §7).

### 3.4 Patch `src/app/admin/login/page.tsx`

Replace the Supabase `signInWithPassword` call with a fetch to `/api/auth/login`:

**Find:**
```tsx
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/admin/dashboard';
    }
```

**Replace with:**
```tsx
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
```

Remove the `import { supabase } from '@/lib/supabase';` line.

### 3.5 Patch `src/app/admin/dashboard/page.tsx`

**Find:**
```tsx
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/admin/login';
    } else {
      setUser(user);
    }
  };
```

**Replace with:**
```tsx
  const checkUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      window.location.href = '/admin/login';
    }
  };
```

**Find the posts fetch:**
```tsx
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data: tipsData } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);
    if (tipsData) setTips(tipsData);
```

**Replace with:**
```tsx
    const [postsRes, tipsRes] = await Promise.all([
      fetch('/api/admin/posts', { credentials: 'include' }),
      fetch('/api/admin/tips', { credentials: 'include' }),
    ]);
    const postsData = postsRes.ok ? await postsRes.json() : [];
    const tipsData = tipsRes.ok ? await tipsRes.json() : [];
    setPosts(postsData);
    setTips(tipsData);
```

(You'll also need to create `/api/admin/posts` and `/api/admin/tips` — covered in step 6.)

**Find `togglePublish`:**
```tsx
  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('posts')
      .update({ is_published: !currentStatus })
      .eq('id', id);
    fetchData();
  };
```

**Replace with:**
```tsx
  const togglePublish = async (slug: string, currentStatus: boolean) => {
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: currentStatus ? 'unpublish' : 'publish' }),
    });
    fetchData();
  };
```

**Find `deletePost`:**
```tsx
  const deletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this news story?')) {
      await supabase.from('posts').delete().eq('id', id);
      fetchData();
    }
  };
```

**Replace with:**
```tsx
  const deletePost = async (slug: string) => {
    if (window.confirm('Are you sure you want to delete this news story?')) {
      await fetch(`/api/admin/posts/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchData();
    }
  };
```

**Find `handleImageUpload`:**

Replace the entire `handleImageUpload` function (lines 59–77 of the repo file) with a call to the Ghost Admin API image upload endpoint:

```tsx
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'image');

    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error uploading image: ' + data.error);
      } else {
        alert('Image uploaded successfully! URL: ' + data.url);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    }
  };
```

**Find `handleLogout`:**
```tsx
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };
```

**Replace with:**
```tsx
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };
```

Remove the `import { supabase } from '@/lib/supabase';` line.

**Find the table mapping (`post.id`):**

All references to `post.id` in the JSX (e.g., `key={post.id}`, `href={`/article?id=${post.id}`}`, `togglePublish(post.id, ...)` `deletePost(post.id)`) need to change to use `post.slug`:

- `key={post.slug}`
- `href={`/article/${post.slug}`}`
- `onClick={() => togglePublish(post.slug, post.is_published)}`
- `onClick={() => deletePost(post.slug)}`

Remove `import { supabase }` from this file.

### 3.6 Patch `src/app/admin/review/page.tsx`

Apply the same Supabase → Ghost/Postgres patches. Replace the `supabase` import with:

```tsx
import { ghostAdmin } from '@/lib/ghost-admin';
import { query } from '@/lib/postgres';
```

Replace `approvePost` to use Ghost Admin API:
```tsx
  async function approvePost(post: Post) {
    const res = await fetch(`/api/admin/posts/${post.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'publish' }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage('Error: ' + (data.error || 'Unknown'));
    } else {
      setMessage(`"${post.title}" approved and published.`);
      fetchPosts();
    }
  }
```

Replace `saveEdit` similarly:
```tsx
  async function saveEdit(postSlug: string) {
    const res = await fetch(`/api/admin/posts/${postSlug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'update_content', content: editContent }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage('Error saving: ' + (data.error || 'Unknown'));
    } else {
      setMessage('Content updated.');
      setEditingId(null);
      fetchPosts();
    }
  }
```

Replace `fetchPosts`:
```tsx
  async function fetchPosts() {
    setLoading(true);
    const res = await fetch('/api/admin/posts?status=draft,published', { credentials: 'include' });
    const data = res.ok ? await res.json() : [];
    setPosts(data);
    setLoading(false);
  }
```

Update the `Post` interface to use `slug` instead of `id`:
```tsx
interface Post {
    slug: string;
    title: string;
    content: string;
    status: string;
    reviewed_by: string | null;
    created_at: string;
}
```

Update all JSX references from `post.id` → `post.slug`.

---

## 4. Replace data layer

Files added to `src/lib/`:

| File | Purpose |
|---|---|
| `ghost.ts` | Ghost Content API client (read-only, public) |
| `ghost-admin.ts` | Ghost Admin API client (write, server-only) |
| `postgres.ts` | Postgres pool for non-article data (tips, reactions, etc.) |
| `custom-fields.ts` | Typed accessors for the 8 Ghost custom fields |
| `imgproxy-loader.ts` | Next.js Image loader with HMAC-SHA256 signing |
| `auth.ts` | JWT issue/verify for admin auth |
| `categories.ts` | Canonical 8 categories list + slug helpers |

### 4.1 Files to delete from the repo

These files are obsolete after v6:

```bash
rm ~/projects/Truthworldnews/src/lib/supabase.ts
# src/middleware.ts → REPLACED (don't delete, copy over)
# src/app/api/post-news/route.ts → REPLACED (don't delete, copy over)
```

The `src/app/api/post-news/route.ts` file gets REPLACED (not deleted) — the Python pipeline still POSTs to it, but internally it now calls Ghost Admin API instead of Supabase.

### 4.2 Environment variables

Create `~/projects/Truthworldnews/.env.local`:

```bash
cp .env.example ~/projects/Truthworldnews/.env.local
# Edit .env.local with your real values
```

Required vars (see `.env.example` for full list):

| Var | Example | Used by |
|---|---|---|
| `NEXT_PUBLIC_GHOST_URL` | `https://news.truthworldnews.com` | Browser-side Ghost fetches |
| `GHOST_INTERNAL_URL` | `http://ghost:2368` | Server-side Ghost fetches (Docker network) |
| `GHOST_CONTENT_API_KEY` | `abc123...` | Public Content API |
| `GHOST_ADMIN_API_KEY` | `abc123:xyz789...` | Admin API (server-only) |
| `MEILI_HOST` | `http://meilisearch:7700` | Server-side Meilisearch |
| `NEXT_PUBLIC_MEILI_HOST` | `https://api.truthworldnews.com/search` | Browser-side Meilisearch |
| `MEILI_API_KEY` | `abc...` | Server-side (admin) |
| `NEXT_PUBLIC_MEILI_SEARCH_KEY` | `def...` | Browser-side (search-only) |
| `IMGPROXY_URL` | `https://img.truthworldnews.com` | Public imgproxy |
| `IMGPROXY_KEY` | `hex...` | HMAC signing key (server-only) |
| `IMGPROXY_SALT` | `hex...` | HMAC salt (server-only) |
| `NEXT_PUBLIC_REMARK42_URL` | `https://admin.truthworldnews.com/remark42` | Comments |
| `NEXT_PUBLIC_REMARK42_SITE_ID` | `twn` | Comments site ID |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `news.truthworldnews.com` | Analytics |
| `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | `https://admin.truthworldnews.com/plausible/js/script.js` | Analytics |
| `POSTGRES_URL` | `postgres://twn:password@postgres:5432/twn` | DB connection |
| `ADMIN_JWT_SECRET` | `hex...` | JWT signing |
| `ADMIN_EMAIL` | `zane@truthworldnews.com` | Login email |
| `ADMIN_PASSWORD_HASH` | `$2b$10$...` | bcrypt hash |
| `API_SECRET_KEY` | `hex...` | For `/api/post-news` Bearer auth |
| `NEXT_PUBLIC_SITE_URL` | `https://news.truthworldnews.com` | Canonical URLs |

---

## 5. Replace auth

The new `src/middleware.ts` checks for a signed JWT in the `twn-admin` cookie. The login endpoint (`/api/auth/login`) issues the JWT after verifying email+password against `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` env vars.

### 5.1 Create the auth API routes

```bash
mkdir -p ~/projects/Truthworldnews/src/app/api/auth/login
mkdir -p ~/projects/Truthworldnews/src/app/api/auth/logout
mkdir -p ~/projects/Truthworldnews/src/app/api/auth/me
mkdir -p ~/projects/Truthworldnews/src/app/api/admin/posts
mkdir -p ~/projects/Truthworldnews/src/app/api/admin/posts/\[slug\]
mkdir -p ~/projects/Truthworldnews/src/app/api/admin/tips
mkdir -p ~/projects/Truthworldnews/src/app/api/admin/upload-image
```

Copy these from the v6 package (they're in `src/app/api/auth/` and `src/app/api/admin/`).

### 5.2 Update admin pages

Already covered in §3.4–3.6.

---

## 6. Replace API routes

### 6.1 `/api/post-news/route.ts` (REPLACED)

The Python pipeline (`scripts/distribute.py` and `scripts/llm_engine.py`) currently POSTs to `/api/post-news` with a Bearer token. The v6 version of this route:

1. Verifies the Bearer token against `API_SECRET_KEY` (unchanged from current)
2. Validates the body with zod (unchanged from current)
3. **NEW:** Calls Ghost Admin API to create a post as `draft` with all custom fields
4. **NEW:** Indexes the post in Meilisearch
5. **NEW:** Logs the action in `editorial_log` table
6. Returns the Ghost post slug (not the Supabase UUID)

The Python pipeline doesn't need to change — it still POSTs the same payload to the same URL. Only the server-side handler changes.

### 6.2 NEW: `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`

JWT-based session management.

### 6.3 NEW: `/api/admin/posts`, `/api/admin/posts/[slug]`, `/api/admin/tips`, `/api/admin/upload-image`

Server-side proxies to Ghost Admin API + Postgres. All require valid JWT.

### 6.4 NEW: `/api/tip`, `/api/subscribe`, `/api/reactions`

Public endpoints for the existing forms (Submit Tip, Newsletter Subscribe, Article Reactions). Currently these are scattered as Supabase calls in component code — v6 consolidates them into proper API routes.

### 6.5 Replace `/rss.xml/route.ts`

The current `src/app/rss.xml/route.ts` builds RSS from Supabase. Replace it with a Ghost RSS proxy:

```ts
// src/app/rss.xml/route.ts
export async function GET() {
  const ghostUrl = process.env.GHOST_INTERNAL_URL || process.env.NEXT_PUBLIC_GHOST_URL!;
  const res = await fetch(`${ghostUrl}/rss/`);
  if (!res.ok) {
    return new Response('RSS unavailable', { status: 502 });
  }
  const xml = await res.text();
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=600, stale-while-revalidate=300',
    },
  });
}
```

### 6.6 Replace `/sitemap.ts`

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ghostUrl = process.env.GHOST_INTERNAL_URL || process.env.NEXT_PUBLIC_GHOST_URL!;
  const key = process.env.GHOST_CONTENT_API_KEY!;

  const res = await fetch(
    `${ghostUrl}/ghost/api/content/posts/sitemap/?key=${key}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return [{ url: process.env.NEXT_PUBLIC_SITE_URL!, lastModified: new Date() }];
  }
  const data = await res.json();
  return data.posts.map((p: any) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/article/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
}
```

### 6.7 Patch `src/app/submit-tip/page.tsx`

Replace the Supabase insert with a fetch:

**Find:**
```tsx
    const { error } = await supabase.from('tips').insert([{ title, story }]);
    if (error) {
      console.error(error);
      setTimeout(() => setStatus('success'), 1000);
    } else {
      setStatus('success');
    }
```

**Replace with:**
```tsx
    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, story }),
      });
      if (!res.ok) {
        console.error(await res.text());
      }
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('success');  // Still show success — anonymous tips must not leak errors
    }
```

Remove the `import { supabase }` line.

---

## 7. Replace pages

### 7.1 `src/app/page.tsx` (REPLACED)

Currently a client-side component using `useEffect` + Supabase. v6 makes it a **server component** that fetches from Ghost at request time (ISR 60s). The brutalist UI is preserved 1:1 — only the data source changes.

The new `page.tsx`:
- Uses `getPosts()` from `src/lib/ghost.ts`
- Filters by tags for the Tech / Politics / Entertainment sections
- Passes posts to the same JSX components (BreakingNewsTicker, etc.)
- 60s ISR via `export const revalidate = 60`
- Fail-soft: if Ghost is down, render the page with empty arrays + a notice

### 7.2 NEW: `src/app/article/[slug]/page.tsx`

Server component, ISR 60s, Ghost Content API. Renders:
- Hero image (via imgproxy signed URL)
- Title, category badge, author (Zane Edge), published date
- TL;DR callout (yellow brutalist box, from `tldr_summary` field)
- Hype meter badge (from `hype_meter` field)
- Rumor badge if `is_rumor === true`
- Safety badge (from `safety_score`)
- Article body (Mobiledoc renderer)
- Sources list (from `sources` field)
- Content-hash provenance footer (from `content_hash` field)
- Prev/next article nav
- `<Remark42Comments />` at the bottom
- JSON-LD `NewsArticle` schema with editorTrustScore + isRumorUnverified extensions

### 7.3 `src/app/article/page.tsx` (REPLACED with redirect handler)

Old: client-side fetch by `?id=UUID`
New: server-side redirect from `?id=UUID` to `/article/[slug]`

Logic:
1. Read `id` from query string
2. Look up slug in a redirect map (cached 1 hour): `getPostByUuid(uuid) → slug`
3. If found, 301 redirect to `/article/{slug}`
4. If not found, render a 404 with a link back to homepage

The redirect map is built from the migration script's UUID→slug mapping file (`scripts/uuid-slug-map.json`).

### 7.4 `src/app/category/[slug]/page.tsx` (REPLACED)

Currently fetches from Supabase by `category` column. v6 fetches from Ghost by tag slug:

- `category/ai/` → Ghost tag slug `ai`
- `category/weird-tech/` → Ghost tag slug `weird-tech`
- etc.

Ghost Content API supports `filter: 'tag:ai'`. Pagination via `?page=N`.

### 7.5 `src/app/search/page.tsx` (REPLACED)

Currently client-side Supabase `ilike` query. v6 uses Meilisearch:

- Server-side handler at `/api/search?q=...` queries Meilisearch `twn_articles` index
- Client-side search page calls this endpoint
- Highlights matched terms via `_formatted` field
- Pagination via `?page=N&limit=20`
- Filter by category/tag via facets

---

## 8. Add new components

### 8.1 `src/components/Remark42Comments.tsx`

Replaces `GiscusComments.tsx`. Drop-in replacement — same interface (`term: string` prop).

### 8.2 `src/components/PlausibleScript.tsx`

Adds the Plausible `<script>` tag to every page. Loaded from `admin.truthworldnews.com/plausible/js/script.js` (per v5.7 spec).

### 8.3 Wire `<Remark42Comments />` into the article page

The current `src/app/article/page.tsx` does NOT render any comments component — GiscusComments is imported nowhere. v6 fixes this by adding `<Remark42Comments term={slug} />` to the new `article/[slug]/page.tsx`.

### 8.4 Patch `src/components/Footer.tsx` newsletter form

Currently the footer's newsletter form has no submit handler — it's just visual. Wire it up:

**Find:**
```tsx
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white font-bold uppercase text-sm outline-none focus:border-[#FFFF00] transition-colors placeholder-gray-500"
              />
              <button className="bg-[#FFFF00] text-black font-inter font-black uppercase px-6 py-3 border-2 border-[#FFFF00] hover:bg-black hover:text-[#FFFF00] transition-colors text-sm tracking-wider">
                SUBSCRIBE
              </button>
            </div>
```

**Replace with a client-side SubscribeForm component** (create `src/components/SubscribeForm.tsx`):

```tsx
'use client';
import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setStatus('done');
    setEmail('');
  };

  return (
    <form onSubmit={submit} className="flex w-full md:w-auto gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={status === 'done' ? 'SUBSCRIBED ✓' : 'Enter your email'}
        disabled={status === 'loading'}
        className="flex-1 md:w-72 px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white font-bold uppercase text-sm outline-none focus:border-[#FFFF00] transition-colors placeholder-gray-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-[#FFFF00] text-black font-inter font-black uppercase px-6 py-3 border-2 border-[#FFFF00] hover:bg-black hover:text-[#FFFF00] transition-colors text-sm tracking-wider disabled:opacity-50"
      >
        {status === 'loading' ? '...' : status === 'done' ? '✓' : 'SUBSCRIBE'}
      </button>
    </form>
  );
}
```

Then in `Footer.tsx`, replace the `<div>` containing the form with `<SubscribeForm />` and add the import.

---

## 9. Run content migration

### 9.1 Run dry-run first

```bash
cd ~/projects/Truthworldnews

# Dry run — no writes, just prints what would happen
DRY_RUN=true \
SUPABASE_URL=https://vimwmyheupvmwpxtftvg.supabase.co \
SUPABASE_SERVICE_KEY=$YOUR_SERVICE_ROLE_KEY \
GHOST_URL=https://news.truthworldnews.com \
GHOST_ADMIN_API_KEY=$YOUR_GHOST_ADMIN_KEY \
npx tsx scripts/migrate-supabase-to-ghost.ts
```

Expected output:
```
[migrate] DRY RUN — no writes will occur
[migrate] Connecting to Supabase at https://vimwmyheupvmwpxtftvg.supabase.co
[migrate] Fetching from table `posts`...
[migrate]   Page 1: 50 records
[migrate]   Page 2: 50 records
[migrate]   Page 3: 12 records
[migrate] Total: 112 records from `posts`
[migrate] Fetching from table `news_articles`...
[migrate]   Page 1: 0 records
[migrate] Total: 0 records from `news_articles`
[migrate] Deduplicating by content_hash...
[migrate] Unique articles: 112
[migrate] Plan:
  [0] "OpenAI's new model..." → slug: openais-new-model, tag: AI, status: published
  [1] "Crypto markets crash..." → slug: crypto-markets-crash, tag: Crypto, status: published
  ...
[migrate] DRY RUN complete. Re-run without DRY_RUN=true to execute.
```

### 9.2 Run real migration

```bash
DRY_RUN=false \
SUPABASE_URL=... \
SUPABASE_SERVICE_KEY=... \
GHOST_URL=... \
GHOST_ADMIN_API_KEY=... \
npx tsx scripts/migrate-supabase-to-ghost.ts
```

The script:
1. Reads both `posts` and `news_articles` tables from Supabase
2. Dedupes by `content_hash` (preferring the row with the most recent `created_at`)
3. Creates/updates each article in Ghost as `draft` (default) or `published` (if Supabase `status='published'` AND `is_published=true`)
4. Sets all 8 custom fields per article
5. Sets the primary tag to the article's `category` value
6. Sets the author to `Zane Edge` (looked up via Ghost Staff API)
7. Writes a `scripts/uuid-slug-map.json` file mapping Supabase UUIDs to Ghost slugs (used by the `/article?id=UUID` → `/article/[slug]` redirect handler)
8. Reindexes all migrated articles into Meilisearch `twn_articles`

### 9.3 Migrate non-article data

```bash
SUPABASE_URL=... \
SUPABASE_SERVICE_KEY=... \
POSTGRES_URL=postgres://twn:password@localhost:5432/twn \
npx tsx scripts/migrate-tips-reactions-to-postgres.ts
```

This migrates: `tips`, `newsletter_subscribers`, `editorial_log`, `reactions` (if exists), `quiz_submissions` (if exists), `dmca_requests`, `data_requests`.

### 9.4 Sync Meilisearch

```bash
GHOST_URL=... \
GHOST_CONTENT_API_KEY=... \
MEILI_HOST=http://localhost:7700 \
MEILI_API_KEY=... \
npx tsx scripts/sync-meilisearch.ts
```

This pulls all published Ghost posts and indexes them in Meilisearch. Run after the Supabase migration completes.

---

## 10. Build & smoke test

### 10.1 Local build

```bash
cd ~/projects/Truthworldnews
npm run build
```

Expected: clean build, no errors. If you see errors:
- "Module not found: '@/lib/supabase'" — you missed removing an import. `rg "from '@/lib/supabase'" src/` to find them.
- "Type error: Property 'id' does not exist on type 'Post'" — replace `post.id` with `post.slug` (covered in §3.5)
- "Environment variable GHOST_CONTENT_API_KEY not defined" — copy `.env.example` to `.env.local` and fill in

### 10.2 Local smoke test

```bash
npm run start
# In another terminal:
curl http://localhost:3000/ | head -20        # Homepage should render with articles
curl http://localhost:3000/article/openais-new-model | head -20  # Sample article
curl http://localhost:3000/category/ai | head -20  # Category page
curl 'http://localhost:3000/search?q=crypto'  # Search
curl http://localhost:3000/rss.xml | head -20 # RSS
curl http://localhost:3000/sitemap.xml | head -20  # Sitemap
```

### 10.3 Admin flow

```bash
# Login
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"zane@truthworldnews.com","password":"YOUR_PASSWORD"}'

# Verify
curl -b cookies.txt http://localhost:3000/api/auth/me
# Expected: {"user":{"email":"zane@truthworldnews.com"}}

# Access admin dashboard (should return 200)
curl -b cookies.txt http://localhost:3000/admin/dashboard -o /dev/null -w '%{http_code}\n'
# Expected: 200

# Try without auth (should redirect to /admin/login)
curl http://localhost:3000/admin/dashboard -o /dev/null -w '%{http_code}\n'
# Expected: 307 (redirect)
```

---

## 11. Deploy to v5.7 stack

### 11.1 Build & push Docker image

```bash
# In the repo root
docker build -t ghcr.io/truthmedia123/twn-nextjs:latest .

# Push to GHCR (requires GHCR PAT with write:packages)
echo $GHCR_PAT | docker login ghcr.io -u truthmedia123 --password-stdin
docker push ghcr.io/truthmedia123/twn-nextjs:latest
```

Or trigger the GitHub Action (`.github/workflows/build.yml`) by pushing to `main`:

```bash
git add -A
git commit -m "migrate: Supabase → Ghost + Postgres (v6)"
git push origin migrate/v6-ghost-postgres
# Open PR → merge to main → Action builds & pushes image
```

### 11.2 Add to docker-compose

Append the contents of `docker-compose.twn-nextjs.yml` to your stack's `docker-compose.yml`:

```bash
cat docker-compose.twn-nextjs.yml >> ~/twn-stack/docker-compose.yml
```

### 11.3 Pull & restart

```bash
cd ~/twn-stack
docker compose pull twn-nextjs
docker compose up -d twn-nextjs
docker compose logs -f twn-nextjs
```

### 11.4 Verify in production

```bash
curl -I https://news.truthworldnews.com/
# Expected: 200 OK, x-nextjs-cache: HIT

curl -I https://news.truthworldnews.com/article/openais-new-model
# Expected: 200 OK

curl -I https://news.truthworldnews.com/admin/dashboard
# Expected: 307 redirect to /admin/login

curl https://news.truthworldnews.com/rss.xml | head -5
# Expected: <?xml version="1.0"...
```

---

## 12. Decommission Supabase

### 12.1 Wait 7 days

Run v6 in production for 7 days. Monitor:
- Article page 404 rate (should be near zero)
- Search empty-result rate (should be near zero)
- Admin dashboard errors
- Migration script's `uuid-slug-map.json` for any redirects that 404 (means an article wasn't migrated)

### 12.2 Remove Supabase deps

```bash
cd ~/projects/Truthworldnews
npm uninstall @supabase/supabase-js @giscus/react
```

### 12.3 Delete obsolete files

```bash
rm src/components/GiscusComments.tsx
# Don't delete src/lib/supabase.ts yet — it should already be gone from §4.1
# Don't delete supabase/ folder — keep for historical reference, add to .gitignore
echo "supabase/" >> .gitignore
```

### 12.4 Rotate / pause Supabase

1. Go to https://supabase.com/dashboard/project/vimwmyheupvmwpxtftvg/settings/api
2. Click "Rotate service_role key" (immediately invalidates the hardcoded key in git history)
3. Pause the project (Settings → General → Pause) — keeps data for 90 days in case you need to recover
4. After 90 days, delete the project

### 12.5 Scrub git history (optional but recommended)

The Supabase anon key is in `src/lib/supabase.ts` committed history. Even after rotation, scrub it:

```bash
# Install git-filter-repo (better than filter-branch)
pip install git-filter-repo

# Scrub the file from history (after rotating the key!)
git filter-repo --path src/lib/supabase.ts --invert-paths

# Force-push (warn your team first!)
git push origin --force --all
git push origin --force --tags
```

---

## 13. Post-migration verification checklist

Run through this checklist before declaring v6 done:

### Content
- [ ] Article count in Ghost Admin matches Supabase (within ±1 for edge cases)
- [ ] Sample 5 articles — verify titles, content, tags, custom fields all match
- [ ] Article URLs are `/article/{slug}` not `/article?id={uuid}`
- [ ] Old `/article?id=UUID` links 301-redirect to new URLs
- [ ] All 8 tags exist in Ghost Admin (`AI`, `Crypto`, `Weird Tech`, `Leaks`, `Rants`, `Investigations`, `News`, `WORLD`)
- [ ] Each category page (`/category/ai/`, etc.) shows articles
- [ ] Search returns results for common terms ("crypto", "AI", "OpenAI")

### Auth
- [ ] `/admin/login` accepts the new credentials
- [ ] Invalid credentials show error
- [ ] After login, `/admin/dashboard` is accessible
- [ ] After logout, `/admin/dashboard` redirects to `/admin/login`
- [ ] JWT expires after 24 hours (test by setting expiry to 1 minute temporarily)

### API
- [ ] `/api/post-news` accepts Bearer auth + creates a draft in Ghost
- [ ] `/api/tip` accepts a tip submission + writes to Postgres `tips` table
- [ ] `/api/subscribe` accepts email + writes to Postgres `newsletter_subscribers` table
- [ ] `/api/reactions` accepts article_slug + reaction_type + writes to Postgres

### Performance
- [ ] Homepage TTFB < 200ms (Ghost ISR cache hit)
- [ ] Article page TTFB < 200ms (Ghost ISR cache hit)
- [ ] Search response < 100ms (Meilisearch)
- [ ] Image load time < 50ms per image (imgproxy cache)
- [ ] Lighthouse score ≥ 90 on all 4 metrics (Performance, Accessibility, Best Practices, SEO)

### SEO
- [ ] `/sitemap.xml` returns valid XML with all article URLs
- [ ] `/robots.txt` allows all crawling
- [ ] JSON-LD `NewsArticle` schema validates at https://search.google.com/test/rich-results
- [ ] Submit new sitemap to Google Search Console
- [ ] Submit new sitemap to Bing Webmaster Tools
- [ ] Old `/article?id=UUID` URLs return 301 (not 404) — Google will reindex

### Analytics & Comments
- [ ] Plausible dashboard shows page views
- [ ] GA4 dashboard shows page views (parallel to Plausible)
- [ ] Microsoft Clarity records sessions
- [ ] remark42 comment box appears on article pages
- [ ] Posting a comment works (verify in remark42 admin)

### Ads
- [ ] AdSense `ads.txt` accessible at `/ads.txt`
- [ ] Ad slots render when cookie consent given
- [ ] Ad slots hidden when cookie consent denied

### Security
- [ ] No Supabase URL/key in `git log` (after scrub)
- [ ] `.env.local` in `.gitignore`
- [ ] All API routes require auth (except `/api/auth/login`, `/api/post-news` (Bearer), `/api/tip`, `/api/subscribe`, `/api/reactions`)
- [ ] CSP headers in `next.config.ts` block external scripts (except Plausible, GA4, Clarity, AdSense, remark42 — all first-party via `admin.truthworldnews.com`)
- [ ] HTTPS enforced on all routes
- [ ] HSTS header present

---

## 14. Rollback procedure

If something goes wrong:

### 14.1 Immediate rollback (5 min)

```bash
# Revert the deploy
cd ~/twn-stack
docker compose pull twn-nextjs:previous  # if you tagged the previous image
docker compose up -d twn-nextjs

# OR, if no previous tag, redeploy the last-known-good commit
cd ~/projects/Truthworldnews
git revert HEAD~10..HEAD  # Revert the v6 commits
git push origin main  # Triggers CI to rebuild old image
```

### 14.2 Restore Supabase (15 min)

Supabase project is paused, not deleted (in §12.4). To restore:
1. Go to Supabase dashboard → Settings → General → Resume project
2. Point `src/lib/supabase.ts` back to the original URL+key (from git history before scrub)
3. Revert `next.config.ts` to `output: 'export'`
4. Revert `src/middleware.ts`, `src/app/page.tsx`, etc.
5. Deploy old image

### 14.3 Restore from SQL dump (30 min)

If Supabase project was deleted:
```bash
# Create a new Supabase project, then restore:
supabase db push --db-url $NEW_SUPABASE_DB_URL --file ~/twn-backup/supabase-data-YYYYMMDD.sql
```

---

## 15. Troubleshooting

### 15.1 Build error: "Type error: Cannot find module '@/lib/supabase'"

You missed removing an import. Run:
```bash
rg "from '@/lib/supabase'" src/ --files-with-matches
```
Edit each file to remove the import + replace `supabase` calls.

### 15.2 Runtime error: "GHOST_CONTENT_API_KEY is not defined"

You're missing env vars. Copy `.env.example` → `.env.local` and fill in. Restart `npm run dev`.

### 15.3 Ghost API returns 401

Your Content API key is wrong. Re-generate in Ghost Admin → Integrations → TWN Migration → Content API Key.

### 15.4 Meilisearch returns 403

Your search-only key doesn't have search permission. Re-generate with these scopes:
- `documents.search`
- `indexes.get`
- `tasks.get`

### 15.5 imgproxy returns 400

Your signature is wrong. Verify:
- `IMGPROXY_KEY` and `IMGPROXY_SALT` match what's in imgproxy's env vars
- You're URL-safe-base64 encoding the source URL (no padding)
- The processing options segment starts with `/`

### 15.6 remark42 doesn't load

Check:
- `NEXT_PUBLIC_REMARK42_URL` is correct (no trailing slash)
- `NEXT_PUBLIC_REMARK42_SITE_ID` matches `REMARK42_SITE` in remark42's env
- remark42 container is running: `docker compose ps remark42`
- Browser console for CSP violations

### 15.7 Migration script fails on duplicate slug

Ghost enforces unique slugs. If two Supabase articles have the same title, the script will fail. The v6 migration script auto-appends `-2`, `-3`, etc. to duplicate slugs. If you still see this error, check `scripts/uuid-slug-map.json` for the collision.

### 15.8 Article content renders as raw JSON

You're rendering Ghost's `mobiledoc` field as text. Install `mobiledoc-react-renderer` and use it:
```tsx
import Renderer from 'mobiledoc-react-renderer';

// In component:
<Renderer mobiledoc={JSON.parse(post.mobiledoc)} />
```

If you used `formats: ['plaintext']` in the Ghost API call, content will be plain text — no JSON, but no rich formatting either.

### 15.9 Admin pages redirect to login even after logging in

JWT cookie not being set. Check:
- Browser dev tools → Application → Cookies → `twn-admin` should exist
- Cookie should be `HttpOnly`, `Secure`, `SameSite=Lax`
- If running locally over HTTP, set `secure: false` in `src/lib/auth.ts` (the file already handles this via `process.env.NODE_ENV`)

### 15.10 Plausible shows zero visitors

- Verify `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` matches the domain in Plausible admin
- Verify the script src URL is correct (no trailing slash, ends in `.js`)
- Check browser dev tools → Network → `script.js` should load with 200
- Check Plausible admin → Site → verify domain matches

---

## What's NOT in v6 (intentionally)

These items are out of scope for v6. They're either:
- Already in the v5.7 stack doc (don't duplicate)
- Future enhancements (post-migration)
- User's responsibility (content, not code)

### Out of scope
- n8n workflow definitions (in `TWN-FINAL-STACK-v5.md` and `n8n-workflows/`)
- LiteLLM config (in v5.7 spec)
- Postiz setup (in v5.7 spec)
- Caddyfile (in v5.7 spec)
- Backup scripts (in v5.7 spec)
- Idle-gate scheduler (in v5.7 spec)
- The Python scraper / safety_layer / llm_engine scripts — they still work as-is, just need their `distribute.py` updated to call Postiz instead of "BrightBean Studio"
- Content edits (rewriting articles, fixing voice drift) — that's editorial work, not migration work
- AdSense application / approval — that's an ops task
- Google News / Bing News submission — that's an ops task

### Future enhancements
- Ghost Members integration for `/premium` page (currently static)
- Ghost Newsletter settings (currently listmonk in v5.7 stack)
- On-demand ISR revalidation via Ghost webhooks (currently 60s polling)
- Mobiledoc → React renderer for rich content (currently plaintext)
- Multi-admin support (currently single-admin via env vars)
- Two-factor auth for admin (currently password only)

---

## Quick reference: file change map

| Repo file | Action | v6 replacement |
|---|---|---|
| `next.config.ts` | REPLACE | `next.config.ts` |
| `src/middleware.ts` | REPLACE | `src/middleware.ts` |
| `src/lib/supabase.ts` | DELETE | (gone — use ghost.ts, postgres.ts) |
| `src/lib/ghost.ts` | NEW | `src/lib/ghost.ts` |
| `src/lib/ghost-admin.ts` | NEW | `src/lib/ghost-admin.ts` |
| `src/lib/postgres.ts` | NEW | `src/lib/postgres.ts` |
| `src/lib/custom-fields.ts` | NEW | `src/lib/custom-fields.ts` |
| `src/lib/imgproxy-loader.ts` | NEW | `src/lib/imgproxy-loader.ts` |
| `src/lib/auth.ts` | NEW | `src/lib/auth.ts` |
| `src/lib/categories.ts` | NEW | `src/lib/categories.ts` |
| `src/app/page.tsx` | REPLACE | `src/app/page.tsx` |
| `src/app/article/page.tsx` | REPLACE (redirect handler) | `src/app/article/page.tsx` |
| `src/app/article/[slug]/page.tsx` | NEW | `src/app/article/[slug]/page.tsx` |
| `src/app/category/[slug]/page.tsx` | REPLACE | `src/app/category/[slug]/page.tsx` |
| `src/app/search/page.tsx` | REPLACE | `src/app/search/page.tsx` |
| `src/app/layout.tsx` | PATCH (add PlausibleScript) | (in-place edit, see §3.3) |
| `src/app/admin/login/page.tsx` | PATCH (remove Supabase) | (in-place edit, see §3.4) |
| `src/app/admin/dashboard/page.tsx` | PATCH (remove Supabase) | (in-place edit, see §3.5) |
| `src/app/admin/review/page.tsx` | PATCH (remove Supabase) | (in-place edit, see §3.6) |
| `src/app/submit-tip/page.tsx` | PATCH (use /api/tip) | (in-place edit, see §6.7) |
| `src/app/api/post-news/route.ts` | REPLACE | `src/app/api/post-news/route.ts` |
| `src/app/api/auth/login/route.ts` | NEW | `src/app/api/auth/login/route.ts` |
| `src/app/api/auth/logout/route.ts` | NEW | `src/app/api/auth/logout/route.ts` |
| `src/app/api/auth/me/route.ts` | NEW | `src/app/api/auth/me/route.ts` |
| `src/app/api/admin/posts/route.ts` | NEW | `src/app/api/admin/posts/route.ts` |
| `src/app/api/admin/posts/[slug]/route.ts` | NEW | `src/app/api/admin/posts/[slug]/route.ts` |
| `src/app/api/admin/tips/route.ts` | NEW | `src/app/api/admin/tips/route.ts` |
| `src/app/api/admin/upload-image/route.ts` | NEW | `src/app/api/admin/upload-image/route.ts` |
| `src/app/api/tip/route.ts` | NEW | `src/app/api/tip/route.ts` |
| `src/app/api/subscribe/route.ts` | NEW | `src/app/api/subscribe/route.ts` |
| `src/app/api/reactions/route.ts` | NEW | `src/app/api/reactions/route.ts` |
| `src/app/rss.xml/route.ts` | REPLACE | (in-place edit, see §6.5) |
| `src/app/sitemap.ts` | REPLACE | (in-place edit, see §6.6) |
| `src/components/GiscusComments.tsx` | KEEP (deprecated, can delete after) | — |
| `src/components/Remark42Comments.tsx` | NEW | `src/components/Remark42Comments.tsx` |
| `src/components/PlausibleScript.tsx` | NEW | `src/components/PlausibleScript.tsx` |
| `src/components/SubscribeForm.tsx` | NEW | (inline in §8.4) |
| `src/components/Footer.tsx` | PATCH (use SubscribeForm) | (in-place edit, see §8.4) |
| `src/components/AdSlot.tsx` | KEEP | — |
| `src/components/AdSenseBaseScript.tsx` | KEEP | — |
| `src/components/ConditionalAds.tsx` | KEEP | — |
| `src/components/Navbar.tsx` | KEEP | — |
| `src/components/Header.tsx` | KEEP (unused, can delete) | — |
| `src/components/Footer.tsx` | PATCH (see §8.4) | — |
| `src/components/ArticleCard.tsx` | KEEP | — |
| `src/components/BreakingNewsTicker.tsx` | KEEP | — |
| `src/components/ViralGrid.tsx` | KEEP | — |
| `src/components/CynicalTLDR.tsx` | KEEP | — |
| `src/components/ReactionBar.tsx` | PATCH (use /api/reactions) | (similar to submit-tip patch) |
| `src/components/ReviewedByBadge.tsx` | KEEP | — |
| `src/components/SkeletonLoader.tsx` | KEEP | — |
| `src/components/BottomNav.tsx` | KEEP | — |
| `src/components/CookieConsent.tsx` | KEEP | — |
| `src/components/NewsletterForm.tsx` | PATCH (use /api/subscribe) | (similar to submit-tip patch) |
| `src/components/TipForm.tsx` | PATCH (use /api/tip) | (similar to submit-tip patch) |
| `src/hooks/useCookieConsent.ts` | KEEP | — |
| `src/hooks/useAdReady.ts` | KEEP | — |
| `src/lib/affiliates.ts` | KEEP | — |
| `src/lib/seo.ts` | KEEP | — |
| `Dockerfile` | NEW | `Dockerfile` |
| `docker-compose.twn-nextjs.yml` | NEW | `docker-compose.twn-nextjs.yml` |
| `.github/workflows/build.yml` | NEW | `.github/workflows/build.yml` |
| `.env.example` | REPLACE | `.env.example` |
| `scripts/migrate-supabase-to-ghost.ts` | NEW | `scripts/migrate-supabase-to-ghost.ts` |
| `scripts/migrate-tips-reactions-to-postgres.ts` | NEW | `scripts/migrate-tips-reactions-to-postgres.ts` |
| `scripts/sync-meilisearch.ts` | NEW | `scripts/sync-meilisearch.ts` |
| `scripts/distribute.py` | DEPRECATE (replace with n8n workflow post-migration) | — |
| `supabase/` | KEEP (in repo for history, add to .gitignore) | — |
| `package.json` | PATCH (add deps, see §2) | — |
| `package-lock.json` | (auto-updated by npm install) | — |
