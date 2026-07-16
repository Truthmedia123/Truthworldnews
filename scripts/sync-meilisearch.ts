/**
 * scripts/sync-meilisearch.ts
 *
 * Pulls all published Ghost posts and indexes them in Meilisearch `twn_articles`.
 * Run after the Supabase → Ghost migration completes.
 *
 * Idempotent: re-indexing overwrites existing documents by primary key (slug).
 *
 * Usage:
 *   GHOST_URL=... \
 *   GHOST_CONTENT_API_KEY=... \
 *   MEILI_HOST=http://localhost:7700 \
 *   MEILI_API_KEY=... \
 *   npx tsx scripts/sync-meilisearch.ts
 */

const GHOST_URL = process.env.GHOST_URL || process.env.GHOST_INTERNAL_URL || 'http://localhost:2368';
const GHOST_KEY = process.env.GHOST_CONTENT_API_KEY!;
const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILI_API_KEY!;

if (!GHOST_KEY || !MEILI_KEY) {
  console.error('Missing GHOST_CONTENT_API_KEY or MEILI_API_KEY');
  process.exit(1);
}

interface GhostPost {
  slug: string;
  title: string;
  excerpt: string;
  plaintext: string;
  published_at: string;
  updated_at: string;
  primary_tag?: { name: string; slug: string } | null;
  tags?: { name: string; slug: string }[];
  // Custom fields via codeinjection_metadata
  codeinjection_metadata?: {
    tldr_summary?: string;
    hype_meter?: string;
    is_rumor?: boolean;
    safety_score?: number;
    content_hash?: string;
    sources?: string;
  };
}

interface MeiliDoc {
  slug: string;
  title: string;
  tldr_summary: string | null;
  content: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  hype_meter: string | null;
  is_rumor: boolean;
  safety_score: number | null;
}

async function fetchAllGhostPosts(): Promise<GhostPost[]> {
  const all: GhostPost[] = [];
  let page = 1;
  const limit = 100;

  while (true) {
    const url = new URL(`${GHOST_URL}/ghost/api/content/posts/`);
    url.searchParams.set('key', GHOST_KEY);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));
    url.searchParams.set('filter', 'status:published');
    url.searchParams.set('include', 'tags,authors');
    url.searchParams.set('fields', 'slug,title,excerpt,plaintext,published_at,updated_at,created_at,primary_tag,tags,codeinjection_metadata');

    const res = await fetch(url.toString() as any, { cache: 'no-store' } as any);
    if (!res.ok) {
      console.error(`Ghost API error: ${res.status} ${await res.text()}`);
      break;
    }
    const data = await res.json();
    if (!data.posts || data.posts.length === 0) break;
    all.push(...data.posts);
    if (data.posts.length < limit) break;
    page++;
  }

  return all;
}

async function pushToMeili(docs: MeiliDoc[]): Promise<void> {
  // Push in batches of 100
  const batchSize = 100;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    const res = await fetch(`${MEILI_HOST}/indexes/twn_articles/documents?primaryKey=slug`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MEILI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error(`Meilisearch batch ${i} failed: ${res.status} ${await res.text()}`);
    } else {
      console.log(`  Pushed batch ${i / batchSize + 1}/${Math.ceil(docs.length / batchSize)}`);
    }
  }
}

async function main() {
  console.log('─'.repeat(60));
  console.log('[sync-meili] Fetching posts from Ghost...');
  console.log(`[sync-meili] Ghost URL: ${GHOST_URL}`);
  console.log(`[sync-meili] Meili URL: ${MEILI_HOST}`);
  console.log('─'.repeat(60));

  const posts = await fetchAllGhostPosts();
  console.log(`[sync-meili] Fetched: ${posts.length} posts`);

  const docs: MeiliDoc[] = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    tldr_summary: p.codeinjection_metadata?.tldr_summary ?? null,
    content: p.plaintext || '',
    excerpt: p.excerpt || '',
    category: p.primary_tag?.name ?? null,
    tags: (p.tags || []).map(t => t.name),
    published_at: p.published_at,
    created_at: p.published_at || new Date().toISOString(),
    hype_meter: p.codeinjection_metadata?.hype_meter ?? null,
    is_rumor: p.codeinjection_metadata?.is_rumor ?? false,
    safety_score: p.codeinjection_metadata?.safety_score ?? null,
  }));

  console.log(`[sync-meili] Pushing ${docs.length} docs to Meilisearch...`);
  await pushToMeili(docs);

  console.log('─'.repeat(60));
  console.log('[sync-meili] Done.');
  console.log('─'.repeat(60));
}

main().catch(err => {
  console.error('[sync-meili] Unhandled error:', err);
  process.exit(1);
});
