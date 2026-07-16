/**
 * scripts/migrate-supabase-to-ghost.ts
 *
 * v6 migration script. Reads articles from BOTH Supabase tables:
 *   - posts              (used by admin pages, /api/post-news, distribute.py)
 *   - news_articles      (used by schema.sql, /page.tsx)
 *
 * Dedupes by content_hash (prefers the row with the most recent created_at).
 * Creates each article in Ghost with all 8 custom fields set via codeinjection_metadata.
 * Writes a UUID→slug map to scripts/uuid-slug-map.json (used by /article?id=UUID redirect).
 *
 * Usage:
 *   DRY_RUN=true \
 *   SUPABASE_URL=https://vimwmyheupvmwpxtftvg.supabase.co \
 *   SUPABASE_SERVICE_KEY=... \
 *   GHOST_URL=https://news.truthworldnews.com \
 *   GHOST_ADMIN_API_KEY=... \
 *   GHOST_AUTHOR_EMAIL=zane@truthworldnews.com \
 *   npx tsx scripts/migrate-supabase-to-ghost.ts
 *
 * Re-runnable: skips articles whose content_hash already exists in Ghost.
 */

import { createClient } from '@supabase/supabase-js';
import { ghostAdmin, type GhostAdminPost } from '../src/lib/ghost-admin';
import { categoryToGhostTag } from '../src/lib/categories';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DRY_RUN = process.env.DRY_RUN === 'true';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const GHOST_AUTHOR_EMAIL = process.env.GHOST_AUTHOR_EMAIL || 'zane@truthworldnews.com';
const UUID_MAP_PATH = path.join(process.cwd(), 'scripts', 'uuid-slug-map.json');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Types (mirror Supabase schemas)
// ---------------------------------------------------------------------------

interface SupabasePost {
  id: string;
  title: string;
  content: string;
  tldr_summary?: string;
  image_url?: string;
  category?: string;
  sources?: any; // JSON-encoded array OR object
  video_script?: string;
  image_description?: string;
  content_hash?: string;
  hype_meter?: string;
  is_rumor?: boolean;
  safety_score?: number;
  status?: string;
  is_published?: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  published_at?: string;
  model_used?: string;
  author_name?: string;
}

interface SupabaseNewsArticle extends SupabasePost {
  // news_articles has slightly different columns
  model_used?: string;
}

// ---------------------------------------------------------------------------
// Fetch from both tables
// ---------------------------------------------------------------------------

async function fetchTable<T>(tableName: string): Promise<T[]> {
  const allRows: T[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(offset, offset + pageSize - 1)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn(`[migrate] Warning: failed to fetch from ${tableName}: ${error.message}`);
      return [];
    }
    if (!data || data.length === 0) break;

    allRows.push(...data as T[]);
    console.log(`[migrate]   ${tableName} offset ${offset}: ${data.length} records`);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}

// ---------------------------------------------------------------------------
// Dedupe by content_hash (or title if no hash)
// ---------------------------------------------------------------------------

interface UnifiedArticle extends SupabasePost {
  source_table: 'posts' | 'news_articles';
}

function dedupe(rows: (SupabasePost & { source_table: string })[]): UnifiedArticle[] {
  const byKey = new Map<string, UnifiedArticle>();

  for (const row of rows) {
    const key = row.content_hash || row.title.toLowerCase().trim();
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...row, source_table: row.source_table as any });
    } else {
      // Prefer the row with the most recent created_at
      const rowDate = new Date(row.created_at).getTime();
      const existingDate = new Date(existing.created_at).getTime();
      if (rowDate > existingDate) {
        byKey.set(key, { ...row, source_table: row.source_table as any });
      }
    }
  }

  return Array.from(byKey.values());
}

// ---------------------------------------------------------------------------
// Convert sources field to JSON string
// ---------------------------------------------------------------------------

function normalizeSources(sources: any): string | undefined {
  if (!sources) return undefined;
  if (typeof sources === 'string') {
    // Try parsing
    try {
      const parsed = JSON.parse(sources);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(sources)) return JSON.stringify(sources);
  return undefined;
}

// ---------------------------------------------------------------------------
// Build a slug from title
// ---------------------------------------------------------------------------

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')      // remove non-word chars
    .replace(/\s+/g, '-')           // spaces → dashes
    .replace(/-+/g, '-')            // collapse multiple dashes
    .replace(/^-+|-+$/g, '')        // trim leading/trailing dashes
    .substring(0, 80);              // Ghost max slug length
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('─'.repeat(60));
  console.log(`[migrate] DRY_RUN=${DRY_RUN}`);
  console.log(`[migrate] Supabase: ${SUPABASE_URL}`);
  console.log(`[migrate] Ghost author email: ${GHOST_AUTHOR_EMAIL}`);
  console.log('─'.repeat(60));

  // ── 1. Fetch from both tables ────────────────────────────────────────────
  console.log('\n[migrate] Fetching from Supabase...');
  const [postsRows, newsArticlesRows] = await Promise.all([
    fetchTable<SupabasePost>('posts'),
    fetchTable<SupabaseNewsArticle>('news_articles'),
  ]);
  console.log(`[migrate] Total: ${postsRows.length} from posts, ${newsArticlesRows.length} from news_articles`);

  // ── 2. Tag source table + combine ────────────────────────────────────────
  const combined = [
    ...postsRows.map(r => ({ ...r, source_table: 'posts' })),
    ...newsArticlesRows.map(r => ({ ...r, source_table: 'news_articles' })),
  ];

  // ── 3. Dedupe ────────────────────────────────────────────────────────────
  console.log('\n[migrate] Deduplicating by content_hash (or title)...');
  const unique = dedupe(combined);
  console.log(`[migrate] Unique articles: ${unique.length}`);

  // ── 4. Build the plan ─────────────────────────────────────────────────────
  type Plan = {
    supabase_id: string;
    title: string;
    slug: string;
    tag: string | null;
    status: 'draft' | 'published';
    published_at: string | null;
    has_video: boolean;
  };
  const plan: Plan[] = unique.map(a => ({
    supabase_id: a.id,
    title: a.title,
    slug: slugify(a.title),
    tag: a.category ? categoryToGhostTag(a.category) : null,
    status: (a.status === 'published' && a.is_published === true) ? 'published' : 'draft',
    published_at: a.published_at || null,
    has_video: Boolean((a as any).video_url),
  }));

  // Print plan
  console.log('\n[migrate] Plan (first 10 + summary):');
  plan.slice(0, 10).forEach((p, i) => {
    console.log(`  [${i}] "${p.title.substring(0, 50)}..." → slug: ${p.slug}, tag: ${p.tag}, status: ${p.status}`);
  });
  console.log(`  ... (${plan.length} total)`);

  // Tag stats
  const tagCounts = plan.reduce((acc, p) => {
    const t = p.tag || '(no tag)';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('\n[migrate] Tag distribution:', tagCounts);

  if (DRY_RUN) {
    console.log('\n[migrate] DRY RUN complete. Re-run without DRY_RUN=true to execute.');
    return;
  }

  // ── 5. Execute migration ─────────────────────────────────────────────────
  console.log('\n[migrate] Executing migration...');
  const uuidMap: Record<string, string> = {};
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  // Ensure the Zane Edge author exists (or get its ID)
  // (Ghost Admin API will auto-create the author on first post if email exists as Staff)
  // Skip this check for now — relies on user having created Zane Edge in Ghost Admin per runbook §1.3

  for (let i = 0; i < unique.length; i++) {
    const a = unique[i];
    const p = plan[i];

    try {
      // Check if a post with this slug already exists (idempotency)
      const existing = await ghostAdmin.getPostBySlug(p.slug);
      if (existing) {
        // Check if it has the same content_hash — skip if so
        const existingHash = (existing as any).codeinjection_metadata?.content_hash;
        if (existingHash === a.content_hash) {
          console.log(`  [${i + 1}/${unique.length}] SKIP (already migrated): ${p.slug}`);
          uuidMap[a.id] = p.slug;
          skipCount++;
          continue;
        }
        // Different content_hash but same slug — append a suffix
        const newSlug = `${p.slug}-${Date.now().toString(36).slice(-4)}`;
        p.slug = newSlug;
      }

      // Build the post input
      const html = `<p>${(a.content || '').split('\n\n').join('</p><p>')}</p>`;
      const sourcesJson = normalizeSources(a.sources);
      const isPublished = p.status === 'published';

      const created = await ghostAdmin.createPost({
        title: a.title,
        slug: p.slug,
        html,
        plaintext: a.content,
        feature_image: a.image_url || undefined,
        feature_image_alt: a.image_description || undefined,
        status: p.status,
        published_at: p.published_at || (isPublished ? a.created_at : undefined),
        tags: p.tag ? [p.tag] : ['News'],
        authors: [GHOST_AUTHOR_EMAIL],
        custom_excerpt: a.tldr_summary,
        // Custom fields via codeinjection_metadata
        tldr_summary: a.tldr_summary,
        hype_meter: a.hype_meter,
        is_rumor: a.is_rumor,
        safety_score: a.safety_score,
        video_script: a.video_script,
        video_url: (a as any).video_url,
        video_requested: (a as any).video_requested ?? false,
        content_hash: a.content_hash,
        sources: sourcesJson,
        reviewed_by: a.reviewed_by,
        reviewed_at: a.reviewed_at,
        supabase_id: a.id,
      });

      uuidMap[a.id] = created.slug || created.id;
      successCount++;

      if ((i + 1) % 10 === 0 || i === unique.length - 1) {
        console.log(`  [${i + 1}/${unique.length}] ✓ "${created.slug}" (${p.status})`);
      }
    } catch (err: any) {
      console.error(`  [${i + 1}/${unique.length}] ✗ FAILED: ${a.title.substring(0, 60)}...`);
      console.error(`      ${err.message}`);
      failCount++;
    }

    // Rate-limit Ghost Admin API (max ~5 req/sec to be safe)
    await new Promise(r => setTimeout(r, 200));
  }

  // ── 6. Write UUID→slug map ───────────────────────────────────────────────
  fs.writeFileSync(UUID_MAP_PATH, JSON.stringify(uuidMap, null, 2));
  console.log(`\n[migrate] UUID→slug map written to ${UUID_MAP_PATH}`);

  // ── 7. Summary ───────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log('[migrate] Migration summary:');
  console.log(`  Total unique articles: ${unique.length}`);
  console.log(`  ✓ Created:             ${successCount}`);
  console.log(`  ⊘ Skipped (existing):  ${skipCount}`);
  console.log(`  ✗ Failed:              ${failCount}`);
  console.log('─'.repeat(60));

  if (failCount > 0) {
    console.log('\n[migrate] Some articles failed. Re-run the script to retry (idempotent).');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[migrate] Unhandled error:', err);
  process.exit(1);
});
