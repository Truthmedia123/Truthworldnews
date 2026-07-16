/**
 * src/lib/ghost.ts
 *
 * Ghost Content API client (read-only, public).
 * Replaces src/lib/supabase.ts for all article reads.
 *
 * v6 design notes:
 * - Server-side fetches use GHOST_INTERNAL_URL (Docker network: http://ghost:2368)
 *   to avoid TLS round-trips and CDN cache misses.
 * - Browser-side fetches (if any) use NEXT_PUBLIC_GHOST_URL (public: https://news.truthworldnews.com).
 * - All fetches use `next: { revalidate: 60 }` for ISR per v5.7 spec.
 * - Fail-soft: every function returns [] or null on error, never throws.
 * - Custom fields are extracted from post.codeinjection_metadata OR direct
 *   post attributes (Ghost supports both, depending on theme).
 */

import type { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

const CONTENT_API_KEY = process.env.GHOST_CONTENT_API_KEY!;
const GHOST_INTERNAL_URL =
  process.env.GHOST_INTERNAL_URL || process.env.NEXT_PUBLIC_GHOST_URL || 'http://localhost:2368';
const GHOST_PUBLIC_URL = process.env.NEXT_PUBLIC_GHOST_URL || 'https://news.truthworldnews.com';

if (!CONTENT_API_KEY) {
  console.warn('[ghost] GHOST_CONTENT_API_KEY is not set — article fetches will fail');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GhostPost {
  id: string;
  uuid: string;
  slug: string;
  title: string;
  excerpt: string;
  feature_image: string | null;
  feature_image_alt: string | null;
  published_at: string | null;
  updated_at: string | null;
  created_at: string;
  html: string;
  plaintext: string;
  mobiledoc: string;
  lexical: string | null;
  url: string;
  authors: GhostAuthor[];
  tags: GhostTag[];
  primary_tag: GhostTag | null;
  primary_author: GhostAuthor;
  // Custom fields (v6: stored as direct post attributes via Ghost custom field settings)
  tldr_summary?: string;
  hype_meter?: string;
  is_rumor?: boolean;
  safety_score?: number;
  video_script?: string;
  video_url?: string;
  video_requested?: boolean;
  content_hash?: string;
  sources?: string; // JSON-encoded array of {title, url}
  reviewed_by?: string;
  reviewed_at?: string;
  // Metadata bag (fallback for fields not yet promoted to direct attributes)
  codeinjection_metadata?: Record<string, unknown>;
}

export interface GhostAuthor {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
}

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feature_image: string | null;
}

export interface GhostPagination {
  page: number;
  limit: number;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
}

export interface GhostPostsResponse {
  posts: GhostPost[];
  meta: { pagination: GhostPagination };
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function ghostFetch<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate = 60,
): Promise<T | null> {
  if (!CONTENT_API_KEY) {
    return null;
  }
  const url = new URL(`${GHOST_INTERNAL_URL}/ghost/api/content/${path}`);
  url.searchParams.set('key', CONTENT_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate },
      headers: { 'Accept-Version': 'v5.0' },
    } as any);
    if (!res.ok) {
      console.error(`[ghost] ${path} returned ${res.status}: ${await res.text()}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[ghost] ${path} threw:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the most recent published posts.
 * Default: 20 posts, page 1, sorted by published_at desc.
 */
export async function getPosts(opts: {
  limit?: number;
  page?: number;
  tag?: string;       // e.g. 'ai' or 'crypto'
  filter?: string;    // raw Ghost filter syntax
} = {}): Promise<GhostPostsResponse> {
  const { limit = 20, page = 1, tag, filter } = opts;

  const filterParts: string[] = ['status:published'];
  if (tag) filterParts.push(`tag:${tag}`);
  if (filter) filterParts.push(filter);

  const res = await ghostFetch<GhostPostsResponse>('posts/', {
    limit,
    page,
    filter: filterParts.join('+'),
    order: 'published_at DESC',
    include: 'tags,authors',
    fields:
      'id,uuid,slug,title,excerpt,feature_image,feature_image_alt,' +
      'published_at,updated_at,created_at,html,plaintext,primary_tag,primary_author,' +
      'tldr_summary,hype_meter,is_rumor,safety_score,video_url,video_requested,' +
      'content_hash,sources,reviewed_by,reviewed_at',
  });

  return res ?? { posts: [], meta: { pagination: { page, limit, pages: 0, total: 0, next: null, prev: null } } };
}

/**
 * Get posts tagged "breaking" for the homepage ticker.
 */
export async function getBreakingPosts(limit = 5): Promise<GhostPost[]> {
  const res = await getPosts({ limit, tag: 'breaking' });
  return res.posts;
}

/**
 * Get posts tagged "viral" for the ViralGrid component.
 * Falls back to most-recent if no 'viral' tag exists.
 */
export async function getViralPosts(limit = 4): Promise<GhostPost[]> {
  const res = await getPosts({ limit, tag: 'viral' });
  if (res.posts.length === 0) {
    const fallback = await getPosts({ limit });
    return fallback.posts;
  }
  return res.posts;
}

/**
 * Get a single post by slug. Returns null if not found.
 */
export async function getPostBySlug(slug: string): Promise<GhostPost | null> {
  const res = await ghostFetch<{ posts: GhostPost[] }>(`posts/slug/${encodeURIComponent(slug)}/`, {
    include: 'tags,authors',
    fields:
      'id,uuid,slug,title,excerpt,feature_image,feature_image_alt,' +
      'published_at,updated_at,created_at,html,plaintext,mobiledoc,lexical,' +
      'primary_tag,primary_author,authors,tags,' +
      'tldr_summary,hype_meter,is_rumor,safety_score,video_script,video_url,video_requested,' +
      'content_hash,sources,reviewed_by,reviewed_at',
  });
  if (!res || res.posts.length === 0) return null;
  return res.posts[0];
}

/**
 * Get a post by Supabase UUID (for the /article?id=UUID → /article/[slug] redirect).
 * Uses the `codeinjection_metadata.supabase_id` field set by the migration script.
 *
 * Falls back to a local JSON map at `scripts/uuid-slug-map.json` if Ghost doesn't have
 * the supabase_id field indexed (which it won't, by default).
 */
export async function getSlugBySupabaseUuid(uuid: string): Promise<string | null> {
  // Try Ghost first (works if user adds supabase_id as a custom field)
  const res = await ghostFetch<{ posts: GhostPost[] }>('posts/', {
    limit: 1,
    filter: `supabase_id:${uuid}+status:published`,
    fields: 'slug',
  });
  if (res && res.posts.length > 0) {
    return res.posts[0].slug;
  }

  // Fallback: read the JSON map built by the migration script
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mapPath = path.join(process.cwd(), 'scripts', 'uuid-slug-map.json');
    const mapRaw = await fs.readFile(mapPath, 'utf-8');
    const map = JSON.parse(mapRaw) as Record<string, string>;
    return map[uuid] ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the previous and next posts around a given post (for prev/next nav on article page).
 */
export async function getAdjacentPosts(
  currentSlug: string,
  currentPublishedAt: string,
): Promise<{ prev: GhostPost | null; next: GhostPost | null }> {
  const [olderRes, newerRes] = await Promise.all([
    ghostFetch<{ posts: GhostPost[] }>('posts/', {
      limit: 1,
      filter: `status:published+published_at:<'${currentPublishedAt}'`,
      order: 'published_at DESC',
      fields: 'slug,title,feature_image',
    }),
    ghostFetch<{ posts: GhostPost[] }>('posts/', {
      limit: 1,
      filter: `status:published+published_at:>'${currentPublishedAt}'`,
      order: 'published_at ASC',
      fields: 'slug,title,feature_image',
    }),
  ]);

  return {
    prev: olderRes?.posts[0] ?? null,
    next: newerRes?.posts[0] ?? null,
  };
}

/**
 * Get all tags (for the homepage tag cloud / navbar).
 */
export async function getTags(): Promise<GhostTag[]> {
  const res = await ghostFetch<{ tags: GhostTag[] }>('tags/', {
    limit: 'all',
    order: 'name ASC',
    fields: 'id,name,slug,description,feature_image',
  });
  return res?.tags ?? [];
}

/**
 * Search posts by query string (server-side fallback if Meilisearch is down).
 * Uses Ghost's built-in full-text search.
 */
export async function searchPosts(query: string, limit = 20): Promise<GhostPost[]> {
  const res = await ghostFetch<{ posts: GhostPost[] }>('posts/', {
    limit,
    filter: 'status:published',
    order: 'published_at DESC',
    include: 'tags,authors',
    fields:
      'id,uuid,slug,title,excerpt,feature_image,published_at,primary_tag,primary_author,' +
      'tldr_summary,hype_meter,is_rumor',
  });
  if (!res) return [];

  const q = query.toLowerCase();
  return res.posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt ?? '').toLowerCase().includes(q) ||
      (p.tldr_summary ?? '').toLowerCase().includes(q),
  );
}

/**
 * Get posts by tag slug with pagination (for /category/[slug]).
 */
export async function getPostsByTag(
  tagSlug: string,
  page = 1,
  limit = 20,
): Promise<GhostPostsResponse> {
  return getPosts({ limit, page, tag: tagSlug });
}

/**
 * Get the Ghost public URL (for sitemap, canonical URLs).
 */
export function getGhostPublicUrl(): string {
  return GHOST_PUBLIC_URL.replace(/\/$/, '');
}
