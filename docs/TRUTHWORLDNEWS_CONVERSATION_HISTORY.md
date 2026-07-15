# TruthWorldNews — Conversation History & Development Log

> **Purpose:** Complete reconstruction of the TruthWorldNews development journey, from initial concept to production architecture.
> **Coverage:** Resource discovery, architectural decisions, prompt evolution, code development, and credit stacking.
> **Last Updated:** 2026-05-24

---

## 1. Conversation Timeline

### Session 1: Initial Architecture & Resource Discovery

**User Request:** Build a fully automated AI-powered newsroom that runs on $0/month using free APIs and services.

**Key Decisions:**
- Stack: Next.js + Supabase + GitHub Actions + Free APIs
- Editorial voice: "Zane Edge" — cynical, sarcastic, human-sounding
- LLM strategy: Multi-provider fallback (Groq → NVIDIA → Cerebras)
- Distribution: 12+ platforms via BrightBean/BulkPublish

**Resources Discovered:**
| Resource | URL | Purpose | Incorporated |
|----------|-----|---------|--------------|
| public-apis/public-apis | github.com/public-apis/public-apis | 1,400+ free APIs | ✅ Discovery sources |
| public-api-lists/public-api-lists | github.com/public-api-lists/public-api-lists | 730+ curated APIs + JSON endpoint | ✅ Filtered shortlist |
| mnfst/awesome-free-llm-apis | github.com/mnfst/awesome-free-llm-apis | 20+ free LLM providers, 200+ models | ✅ LLM provider selection |
| patchy631/ai-engineering-hub | github.com/patchy631/ai-engineering-hub | 93+ AI engineering tutorials | ⏳ Future reference |
| unslothai/notebooks | github.com/unslothai/notebooks | 250+ fine-tuning notebooks | ⏳ Phase 2 |
| OBLITERATUS/Qwen3.6-27B-OBLITERATED | huggingface.co/OBLITERATUS | Abliterated model for uncensored generation | ⏳ Research |

---

### Session 2: Supabase Schema & Pipeline Setup

**User Request:** Create database schema for news articles, editorial log, newsletter subscribers, safety cache, analytics, API keys, and sponsor slots.

**Code Generated:** `supabase/schema.sql` — 7 tables with indexes and RLS policies.

```sql
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hype_meter TEXT,
  tldr_summary TEXT,
  model_used TEXT,
  sources TEXT,
  content_hash TEXT UNIQUE,
  category TEXT DEFAULT 'News',
  image_url TEXT,
  is_rumor BOOLEAN DEFAULT false,
  safety_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);
```

---

### Session 3: NVIDIA LLM Migration

**User Request:** Replace existing multi-provider LLM setup with NVIDIA-only implementation using official NVIDIA code patterns.

**Code Generated:** Complete rewrite of `scripts/llm_engine.py`

**Key Changes:**
- Removed: Groq, Claude, DeepSeek direct API calls
- Added: OpenAI client with NVIDIA base URL
- Tiered routing: kimi-k2.6 (Tier 1) → nemotron-3-super (Tier 2) → deepseek-v4-flash (Tier 3)
- Timeout adjustments: 120s → 180s for deepseek fallback

**Snippet:**
```python
client = OpenAI(base_url="https://integrate.api.nvidia.com/v1", api_key=NVIDIA_API_KEY)

completion = client.chat.completions.create(
    model="nvidia/llama-3.3-nemotron-super-49b-v1",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.85,
    max_tokens=1200,
    timeout=120
)
```

---

### Session 4: Pipeline Debugging — Supabase Direct Insert

**User Request:** Fix the GitHub Actions pipeline to write articles directly to Supabase instead of posting to a localhost API endpoint.

**Problem:** Pipeline was posting to `http://localhost:3000/api/post-news` which doesn't exist in CI environment.

**Solution:** Replaced `post_to_api` function with direct Supabase insert using Python client.

**Code Change:**
```python
# BEFORE (broken in CI)
def post_to_api(article):
    requests.post("http://localhost:3000/api/post-news", json=article)

# AFTER (works everywhere)
def post_to_api(article):
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    sb.table("news_articles").insert(article).execute()
```

**Additional Fixes:**
- Added `fetch-depth: 0` to checkout step
- Added commit hash verification
- Added `supabase` to pip install list
- Removed `API_SECRET_KEY` dependency

---

### Session 5: Pipeline Using Stale Commits

**User Request:** GitHub Actions is still using old commit `04f7030` despite `fetch-depth: 0`.

**Nuclear Solution:** Replace `actions/checkout@v4` with raw git commands:

```yaml
- name: Nuclear clean checkout
  run: |
    rm -rf .git
    git init
    git remote add origin https://github.com/Truthmedia123/Truthworldnews.git
    git fetch origin main
    git reset --hard origin/main
```

**Result:** Pipeline now always uses the latest commit.

---

### Session 6: Frontend Not Showing Articles

**User Request:** Articles exist in Supabase but the site shows "First articles loading soon."

**Diagnosis:**
1. Homepage was a Server Component querying `posts` table (doesn't exist)
2. Pipeline writes to `news_articles` table
3. Frontend was statically rendered at build time — no live data

**Solution:**
- Converted homepage to `'use client'` with `useEffect` + `useState`
- Changed query from `posts` to `news_articles`
- Removed `.eq('is_published', true)` (column doesn't exist)
- Changed sort from `created_at` to `published_at`

**Code:**
```typescript
'use client';
import { useEffect, useState } from 'react';

useEffect(() => {
  supabase.from('news_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)
    .then(({ data }) => setArticles(data || []));
}, []);
```

---

### Session 7: Article Pages Show 404

**User Request:** Articles display on homepage but clicking them shows 404.

**Diagnosis:**
- `/article/[id]/page.tsx` was a Server Component with `generateStaticParams`
- Static export only generates pages at build time
- New articles added dynamically via pipeline → no HTML file exists

**Solution:**
- Removed `output: "export"` temporarily → dynamic SSR worked but broke Netlify
- **Final fix:** Pure static export with query params
  - Changed links from `/article/${id}` to `/article?id=${id}`
  - Created `/article/page.tsx` as client component with `useSearchParams`
  - Wrapped in `<Suspense>` for static export compatibility
  - Restored `output: "export"` in `next.config.ts`

---

### Session 8: Emergency Hardcoded Credentials

**User Request:** Environment variables not being picked up by Netlify. Hardcode temporarily for testing.

**Action:** Hardcoded Supabase URL and anon key in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://vimwmyheupvmwpxtftvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIs...'
```

**Note:** Must revert to env vars and rotate key before repo goes public.

---

### Session 9: Static Export Build Failures

**Issues Encountered:**
1. `useSearchParams()` requires Suspense boundary in static export
2. `.next/dev/types/validator.ts` cached old `/article/[id]` route
3. Windows path escaping issues with `[id]` directory deletion

**Fixes Applied:**
```typescript
// Added Suspense wrapper
export default function ArticlePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ArticleContent />
    </Suspense>
  );
}
```

```powershell
# Force-clean build cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force out
```

---

## 2. Resource Discovery Log

### APIs & Services

| Date | Resource | URL | Purpose | Status |
|------|----------|-----|---------|--------|
| 2026-05 | **NVIDIA NIM** | build.nvidia.com | Primary LLM provider (3 models) | ✅ Active |
| 2026-05 | **Supabase** | supabase.com | Postgres database + auth | ✅ Active |
| 2026-05 | **Netlify** | netlify.com | Static site hosting | ✅ Active |
| 2026-05 | **GitHub Actions** | github.com/features/actions | CI/CD orchestration | ✅ Active |
| 2026-05 | **Groq** | groq.com | Original LLM provider (replaced by NVIDIA) | ⏳ Fallback reserve |
| 2026-05 | **Cerebras** | cerebras.ai | Ultra-fast inference (fallback) | ⏳ Fallback reserve |
| 2026-05 | **NewsAPI** | newsapi.org | News headlines for discovery | ✅ Active |
| 2026-05 | **Mediastack** | mediastack.com | Multi-source news aggregation | ✅ Active |
| 2026-05 | **Perspective API** | perspectiveapi.com | Toxicity filtering | ✅ Active |
| 2026-05 | **Unsplash** | unsplash.com/developers | Featured article images | ✅ Active |
| 2026-05 | **Pexels** | pexels.com/api | Fallback image source | ✅ Active |
| 2026-05 | **Resend** | resend.com | Newsletter email delivery | ✅ Active |
| 2026-05 | **Serper.dev** | serper.dev | SERP position tracking | ✅ Active |
| 2026-05 | **Google Search Console** | search.google.com/search-console | Rank tracking | ✅ Active |
| 2026-05 | **Google Analytics 4** | analytics.google.com | Web traffic analytics | ✅ Active |
| 2026-05 | **Microsoft Clarity** | clarity.microsoft.com | Heatmaps & recordings | ✅ Active |
| 2026-05 | **BrightBean Studio** | brightbean.studio | Social scheduling | ✅ Active |
| 2026-05 | **Decap CMS** | decapcms.org | Git-based editorial CMS | ✅ Active |
| 2026-05 | **RSSHub** | docs.rsshub.app | RSS feed generation | ✅ Active |

### GitHub Repositories Discovered

| Date | Repository | URL | Purpose | Status |
|------|-----------|-----|---------|--------|
| 2026-05 | public-apis/public-apis | github.com/public-apis/public-apis | 1,400+ free APIs directory | ✅ Referenced |
| 2026-05 | public-api-lists/public-api-lists | github.com/public-api-lists/public-api-lists | 730+ APIs with JSON endpoint | ✅ Referenced |
| 2026-05 | mnfst/awesome-free-llm-apis | github.com/mnfst/awesome-free-llm-apis | 20+ free LLM providers | ✅ Referenced |
| 2026-05 | patchy631/ai-engineering-hub | github.com/patchy631/ai-engineering-hub | 93+ AI tutorials | ⏳ Future |
| 2026-05 | unslothai/notebooks | github.com/unslothai/notebooks | 250+ fine-tuning notebooks | ⏳ Phase 2 |
| 2026-05 | OBLITERATUS/Qwen3.6-27B-OBLITERATED | huggingface.co/OBLITERATUS | Uncensored LLM research | ⏳ Research |
| 2026-05 | msitarzewski/agency-agents | github.com/msitarzewski/agency-agents | Windsurf IDE automation agents | ⏳ Exploration |

---

## 3. Decision Log

### Why NVIDIA over Groq as Primary LLM Provider

| Factor | Groq | NVIDIA | Decision |
|--------|------|--------|----------|
| Free tier RPM | 14,400/day | 40 RPM (~57,600/day) | NVIDIA higher capacity |
| Model variety | Llama, Mixtral | kimi, nemotron, deepseek | NVIDIA more diverse |
| API stability | Excellent | Good (newer) | NVIDIA improving rapidly |
| Official docs | Good | Excellent | NVIDIA patterns clearer |
| Fallback chain | → Cerebras | → (same provider) | NVIDIA internal fallback |

**Decision:** Use NVIDIA as primary with tiered routing. Keep Groq and Cerebras as emergency fallbacks.

### Why Query Params over Dynamic Routes

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| `/article/[id]` | Clean URLs, SEO-friendly | Requires SSR, breaks static export | ❌ Rejected |
| `/article?id=uuid` | Works with static export, no build issues | Less SEO-friendly, uglier URLs | ✅ Chosen |

**Rationale:** Static export is required for Netlify free tier. Query params are the only reliable way to handle dynamic content without SSR.

### Why Decap CMS over Custom Admin

| Factor | Decap CMS | Custom Admin | Decision |
|--------|-----------|--------------|----------|
| Setup time | 30 minutes | 2-3 days | Decap faster |
| Cost | $0 | Hosting + dev time | Decap cheaper |
| Git integration | Native | Must build | Decap simpler |
| Editorial workflow | Built-in | Must build | Decap ready |

### Why Supabase over Firebase

| Factor | Supabase | Firebase | Decision |
|--------|----------|----------|----------|
| Database | Postgres (real SQL) | NoSQL | Supabase preferred |
| Free tier | 500MB + 2M edge req | 1GB + 50K reads/day | Comparable |
| Self-hostable | Yes | No | Supabase more flexible |
| Next.js integration | Excellent | Good | Supabase native |

---

## 4. Prompt Evolution

### Stage 1: Simple Requests

> "Update requirements.txt to add OpenAI client"
> "Replace llm_engine.py with NVIDIA implementation"

**Result:** Direct file modifications, single-purpose changes.

### Stage 2: Multi-Part Requests

> "Update the pipeline to:
> 1. Remove legacy API keys
> 2. Add fetch-depth: 0
> 3. Verify commit hash
> 4. Install supabase package"

**Result:** Coordinated changes across multiple files.

### Stage 3: Problem-Solving Prompts

> "The pipeline is still using old commit 04f7030. Add a nuclear clean checkout step."

**Result:** Creative solutions requiring analysis of GitHub Actions behavior.

### Stage 4: Architecture-Level Requests

> "Articles exist in Supabase but don't show on site. The frontend is static and doesn't fetch live data. Add client-side Supabase fetching."

**Result:** Multi-file architectural changes (client conversion, query param routing, Suspense boundaries).

---

## 5. Code Evolution

### llm_engine.py Evolution

**v1:** Multi-provider (Groq, Claude, DeepSeek) with requests library

**v2:** NVIDIA-only with OpenAI client, tiered routing

**v3:** Added Supabase direct insert, removed localhost API posting

**v4:** Added timeout fallbacks (120s → 180s), backup JSON on failure

### page.tsx (Homepage) Evolution

**v1:** Server Component, static build-time fetch from `posts` table

**v2:** Client Component, `useEffect` fetch from `news_articles` table

**v3:** Added loading state, empty state, query param article links

### article/[id]/page.tsx → article/page.tsx

**v1:** Server Component with `generateStaticParams`, `generateMetadata`

**v2:** Client Component with `useParams`, dynamic SSR

**v3:** Final — query param client component with `useSearchParams` + Suspense

---

## 6. Credit Stacking Journey

| Provider | Credits/Allowance | Claimed? | Expiration | Notes |
|----------|-------------------|----------|------------|-------|
| **Groq** | 14,400 requests/day | ✅ Active | — | Original primary LLM |
| **Cerebras** | 1M tokens/day | ✅ Active | — | Emergency fallback |
| **NVIDIA NIM** | 40 RPM / ~57,600/day | ✅ Active | — | Current primary |
| **DeepSeek** | 5M tokens | ✅ Active | — | Via NVIDIA or direct |
| **Xiaomi MiMo Orbit** | 100T tokens | ⏰ PENDING | 2026-05-28 | URGENT — Apply now |
| **Google Cloud** | $300 | ⏳ Available | 90 days after claim | New accounts |
| **Azure** | $200 | ⏳ Available | 30 days after claim | New accounts |
| **AWS** | $300 | ⏳ Available | 12 months | Free tier |
| **GitHub Student Pack** | $600+ value | ⏳ Check eligibility | — | Requires .edu |
| **Vercel** | Pro features | ⏳ Available | — | Startup program |
| **DigitalOcean** | $200 | ⏳ Available | 60 days | Hatch program |
| **Notion** | Unlimited AI | ⏳ Available | — | Startup program |
| **Stripe** | Fee waiver | ⏳ Available | — | Startup program |

### Credit Stacking Strategy

1. **Immediate (by May 28):** Apply for Xiaomi MiMo Orbit — 100T tokens
2. **Week 1:** Claim Google Cloud ($300) + Azure ($200) for GPU training
3. **Week 2:** Apply for GitHub Student Pack if eligible
4. **Month 1:** Hatch/startup programs for Vercel, DigitalOcean, Notion
5. **Ongoing:** Rotate free tiers to avoid hitting limits

---

## 7. Deadlines & Urgent Actions

| Deadline | Item | Action Required | Status |
|----------|------|-----------------|--------|
| **2026-05-28** | Xiaomi MiMo Orbit application | Submit form + justification | ⏰ URGENT |
| Rolling | Google Cloud $300 | Create account + claim | ⏳ Pending |
| Rolling | Azure $200 | Create account + claim | ⏳ Pending |
| Rolling | GitHub Student Pack | Verify .edu status | ⏳ Pending |
| 90 days | Google Cloud credits expire | Use for fine-tuning GPU | ⏳ Plan |

---

## 8. Lessons Learned

### What Worked

| Approach | Result |
|----------|--------|
| NVIDIA tiered LLM routing | Reliable failover, all 3 models functional |
| Nuclear clean checkout | Solved stale commit issue permanently |
| Client-side Supabase fetching | Enables dynamic content on static hosting |
| Query param routing | Bypasses static export dynamic route limitations |
| Direct Supabase insert in Python | Eliminates localhost API dependency in CI |

### What Didn't Work

| Approach | Problem | Solution |
|----------|---------|----------|
| `actions/checkout@v4` with `fetch-depth: 0` | Still used cached commits | Nuclear clean checkout |
| Dynamic routes (`/article/[id]`) with static export | Requires `generateStaticParams` | Query params (`/article?id=`) |
| Server Components for live data | Build-time only | Client Components with `useEffect` |
| `posts` table name | Pipeline writes to `news_articles` | Renamed all queries |
| `is_published` column | Doesn't exist in schema | Removed from queries |
| `useSearchParams` without Suspense | Build error in static export | Wrapped in `<Suspense>` |

### What to Avoid in Future

1. Don't assume GitHub Actions checkout is fresh — always verify commit hash
2. Don't mix SSR dynamic routes with static export — choose one architecture
3. Don't query columns that don't exist — verify schema before writing queries
4. Don't rely on env var injection in static builds — hardcode test values first
5. Don't forget Suspense boundary with `useSearchParams` in Next.js static export

---

## 9. Unimplemented Ideas

| Idea | Status | Blocker | Priority |
|------|--------|---------|----------|
| Fine-tune Llama 3.1 8B on Colab | ⏳ Not started | GPU credits | Medium |
| GRPO training for anti-detection | ⏳ Not started | Compute + dataset | Medium |
| Orpheus TTS for podcast generation | ⏳ Not started | Audio pipeline | Low |
| MiMo-V2.5 integration | ⏳ Not started | Apply for Xiaomi Orbit | High |
| Agency-agents for Windsurf IDE | ⏳ Not started | Explore msitarzewski repo | Low |
| Video pipeline (short-form) | ⏳ Not started | Video generation API | Low |
| Multi-language support | ⏳ Not started | Translation API | Low |
| Custom knowledge base | ⏳ Not started | Embedding storage | Medium |
| AdSense integration | ⏳ Not started | Traffic threshold | Medium |
| Premium subscription tier | ⏳ Not started | Payment gateway | Low |

---

## 10. Final Architecture Snapshot

### Complete Stack (as of 2026-05-24)

```
┌─────────────────────────────────────────────────────────────┐
│  DISCOVERY                                                  │
│  ├── Google Trends (unofficial)                             │
│  ├── Mediastack API (500/day)                              │
│  ├── NewsAPI (100/day)                                     │
│  ├── Reddit API (100 QPM)                                  │
│  └── HackerNews API (1 QPS)                                │
├─────────────────────────────────────────────────────────────┤
│  SAFETY                                                     │
│  ├── Perspective API (60 QPM)                              │
│  └── NewsAPI cross-reference                               │
├─────────────────────────────────────────────────────────────┤
│  GENERATION (NVIDIA NIM — 40 RPM each)                    │
│  ├── Tier 1: kimi-k2.6 (headlines)                        │
│  ├── Tier 2: nemotron-3-super (body)                     │
│  └── Tier 3: deepseek-v4-flash (SEO meta)                 │
├─────────────────────────────────────────────────────────────┤
│  DATABASE (Supabase — 500MB)                              │
│  ├── news_articles                                         │
│  ├── editorial_log                                         │
│  ├── newsletter_subscribers                                │
│  ├── safety_cache                                          │
│  ├── analytics_events                                      │
│  ├── api_keys                                              │
│  └── sponsor_slots                                         │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (Next.js → Static Export → Netlify)              │
│  ├── Homepage: client-side Supabase fetch                  │
│  ├── Article: query param + client fetch                   │
│  └── Decap CMS: /admin for editorial review              │
├─────────────────────────────────────────────────────────────┤
│  ORCHESTRATION (GitHub Actions — every 4 hours)           │
│  ├── Nuclear clean checkout                                │
│  ├── scraper.py → discovery                              │
│  ├── llm_engine.py → generation                          │
│  └── gsc_tracker.py → weekly rank tracking              │
├─────────────────────────────────────────────────────────────┤
│  MONITORING                                                 │
│  ├── Google Search Console (weekly)                        │
│  ├── Google Analytics 4 (real-time)                        │
│  ├── Microsoft Clarity (real-time)                         │
│  └── Serper.dev (as needed)                                │
├─────────────────────────────────────────────────────────────┤
│  DISTRIBUTION                                               │
│  ├── BrightBean Studio (12 platforms)                     │
│  ├── Bluesky (direct API)                                  │
│  ├── LinkedIn (API/BrightBean)                            │
│  ├── Instagram/Threads (Zernio)                          │
│  ├── Newsletter (Resend — 3,000/mo)                     │
│  └── RSS (RSSHub + custom)                                │
└─────────────────────────────────────────────────────────────┘
```

### Total Monthly Cost: **$0**

| Component | Paid Alternative | Monthly Savings |
|-----------|-----------------|-----------------|
| LLM APIs | OpenAI GPT-4 | ~$100 |
| Database | AWS RDS | ~$15 |
| Hosting | Vercel Pro | ~$20 |
| CMS | Contentful | ~$489 |
| Social | Buffer | ~$15 |
| Email | Mailchimp | ~$11 |
| Images | Shutterstock | ~$29 |
| Analytics | Hotjar | ~$39 |
| SEO | Ahrefs | ~$99 |
| **TOTAL** | | **~$817/mo** |

---

## Appendix: Key Commit History

| Commit | Message | Date | Significance |
|--------|---------|------|--------------|
| `53a2092` | ci: fetch-depth=0, verify commit | 2026-05-23 | Fixed stale checkout |
| `3365b8c` | ci: nuclear clean checkout | 2026-05-23 | Bypass checkout caching |
| `fbe7bd5` | Add client-side Supabase fetching | 2026-05-23 | Live articles on homepage |
| `cf8c8d6` | Emergency: hardcode Supabase credentials | 2026-05-23 | Debug env var injection |
| `e17d31c` | Fix: Client-side article pages | 2026-05-23 | Removed static export limitation |
| `f83d766` | Fix: Force distDir to 'out' | 2026-05-23 | Netlify publish directory |
| `db755a3` | Pure static export: query params | 2026-05-24 | Final architecture fix |
| `e7901c1` | Fix: Add Suspense for useSearchParams | 2026-05-24 | Build success |

---

*Documented for TruthWorldNews — preserving every decision, resource, and lesson for future builders.*
