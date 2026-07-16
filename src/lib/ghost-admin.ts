/**
 * src/lib/ghost-admin.ts
 *
 * Ghost Admin API client (write operations, server-only).
 *
 * SECURITY: This module is NEVER imported by client components.
 * GHOST_ADMIN_API_KEY is a server-only env var (no NEXT_PUBLIC_ prefix).
 *
 * Used by:
 * - /api/post-news (Python pipeline creates draft)
 * - /api/admin/posts/* (admin dashboard operations)
 * - /api/admin/upload-image (image uploads)
 * - scripts/migrate-supabase-to-ghost.ts (bulk import)
 */

import crypto from 'crypto';

const GHOST_URL = process.env.GHOST_INTERNAL_URL || process.env.NEXT_PUBLIC_GHOST_URL!;
const ADMIN_API_KEY = process.env.GHOST_ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  console.warn('[ghost-admin] GHOST_ADMIN_API_KEY is not set — write operations will fail');
}

// ---------------------------------------------------------------------------
// JWT signing (Ghost Admin API uses HS256 JWT, 5-min expiry)
// ---------------------------------------------------------------------------

function signAdminJwt(): string {
  if (!ADMIN_API_KEY) throw new Error('GHOST_ADMIN_API_KEY is not set');

  const [id, secret] = ADMIN_API_KEY.split(':');
  if (!id || !secret) {
    throw new Error('GHOST_ADMIN_API_KEY must be in format "id:hex_secret"');
  }

  const header = { alg: 'HS256', typ: 'JWT', kid: id };
  const iat = Math.floor(Date.now() / 1000);
  const payload = {
    iat,
    exp: iat + 5 * 60, // 5 minutes
    aud: '/admin/',
  };

  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  const headerB64 = b64url(header);
  const payloadB64 = b64url(payload);
  const data = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac('sha256', Buffer.from(secret, 'hex'))
    .update(data)
    .digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GhostAdminPostInput {
  title: string;
  slug?: string;
  mobiledoc?: string;       // Ghost's native format (JSON string)
  lexical?: string;         // Newer format (Ghost 6+)
  html?: string;            // Will be converted to mobiledoc
  plaintext?: string;
  feature_image?: string;
  feature_image_alt?: string;
  status?: 'draft' | 'published';
  published_at?: string | null;
  tags?: string[];          // Tag names — Ghost will create them if they don't exist
  primary_tag?: string;
  authors?: string[];       // Author emails
  custom_excerpt?: string;
  // Custom fields (set via codeinjection_metadata for v6 compatibility)
  tldr_summary?: string;
  hype_meter?: string;
  is_rumor?: boolean;
  safety_score?: number;
  video_script?: string;
  video_url?: string;
  video_requested?: boolean;
  content_hash?: string;
  sources?: string;         // JSON-encoded array
  reviewed_by?: string;
  reviewed_at?: string;
  supabase_id?: string;     // For dedup during migration
}

export interface GhostAdminPost extends GhostAdminPostInput {
  id: string;
  uuid: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface GhostAdminImageResponse {
  url: string;
  ref?: string;
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function adminFetch<T>(
  path: string,
  opts: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, params } = opts;

  const url = new URL(`${GHOST_URL}/ghost/api/admin/${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Ghost ${signAdminJwt()}`,
    'Accept-Version': 'v5.0',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch { /* keep as text */ }
    const errMsg = parsed?.errors?.[0]?.message || parsed?.message || text || res.statusText;
    throw new Error(`Ghost Admin API ${method} ${path} → ${res.status}: ${errMsg}`);
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a post. Returns the created post.
 */
export async function createPost(input: GhostAdminPostInput): Promise<GhostAdminPost> {
  // Convert custom fields to codeinjection_metadata (Ghost custom field feature
  // requires theme support; using codeinjection_metadata is universal).
  const metadata: Record<string, unknown> = {};
  if (input.tldr_summary !== undefined) metadata.tldr_summary = input.tldr_summary;
  if (input.hype_meter !== undefined) metadata.hype_meter = input.hype_meter;
  if (input.is_rumor !== undefined) metadata.is_rumor = input.is_rumor;
  if (input.safety_score !== undefined) metadata.safety_score = input.safety_score;
  if (input.video_script !== undefined) metadata.video_script = input.video_script;
  if (input.video_url !== undefined) metadata.video_url = input.video_url;
  if (input.video_requested !== undefined) metadata.video_requested = input.video_requested;
  if (input.content_hash !== undefined) metadata.content_hash = input.content_hash;
  if (input.sources !== undefined) metadata.sources = input.sources;
  if (input.reviewed_by !== undefined) metadata.reviewed_by = input.reviewed_by;
  if (input.reviewed_at !== undefined) metadata.reviewed_at = input.reviewed_at;
  if (input.supabase_id !== undefined) metadata.supabase_id = input.supabase_id;

  const body: Record<string, unknown> = {
    posts: [{
      title: input.title,
      slug: input.slug,
      mobiledoc: input.mobiledoc || input.html
        ? JSON.stringify({
            version: '0.3.1',
            atoms: [],
            cards: input.html ? [['html', { html: input.html }]] : [],
            markups: [],
            sections: input.html ? [[10, [0]]] : [],
          })
        : undefined,
      plaintext: input.plaintext,
      feature_image: input.feature_image,
      feature_image_alt: input.feature_image_alt,
      status: input.status || 'draft',
      published_at: input.published_at,
      tags: input.tags,
      authors: input.authors,
      custom_excerpt: input.custom_excerpt,
      codeinjection_metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    }],
  };

  const res = await adminFetch<{ posts: GhostAdminPost[] }>('posts/', {
    method: 'POST',
    body,
  });
  return res.posts[0];
}

/**
 * Update a post by ID.
 */
export async function updatePost(id: string, input: Partial<GhostAdminPostInput>): Promise<GhostAdminPost> {
  // Fetch current post to get updated_at (required for optimistic concurrency)
  const current = await adminFetch<{ posts: GhostAdminPost[] }>(`posts/${id}/`, { method: 'GET' });
  const updatedAt = current.posts[0]?.updated_at;

  const body: Record<string, unknown> = {
    posts: [{
      ...input,
      updated_at: updatedAt,
    }],
  };

  const res = await adminFetch<{ posts: GhostAdminPost[] }>(`posts/${id}/`, {
    method: 'PUT',
    body,
  });
  return res.posts[0];
}

/**
 * Publish a draft.
 */
export async function publishPost(id: string): Promise<GhostAdminPost> {
  return updatePost(id, { status: 'published', published_at: new Date().toISOString() });
}

/**
 * Unpublish a post (back to draft).
 */
export async function unpublishPost(id: string): Promise<GhostAdminPost> {
  return updatePost(id, { status: 'draft', published_at: null });
}

/**
 * Delete a post.
 */
export async function deletePost(id: string): Promise<void> {
  await adminFetch<void>(`posts/${id}/`, { method: 'DELETE' });
}

/**
 * Get a post by slug (admin API — includes drafts).
 */
export async function getPostBySlug(slug: string): Promise<GhostAdminPost | null> {
  const res = await adminFetch<{ posts: GhostAdminPost[] }>(`posts/slug/${encodeURIComponent(slug)}/`);
  return res.posts[0] ?? null;
}

/**
 * List posts (admin API — includes drafts).
 */
export async function listPosts(opts: {
  limit?: number;
  page?: number;
  status?: 'draft' | 'published' | 'all';
  filter?: string;
} = {}): Promise<{ posts: GhostAdminPost[]; meta: { pagination: any } }> {
  const { limit = 50, page = 1, status = 'all', filter } = opts;

  const filterParts: string[] = [];
  if (status !== 'all') filterParts.push(`status:${status}`);
  if (filter) filterParts.push(filter);

  const res = await adminFetch<{ posts: GhostAdminPost[]; meta: { pagination: any } }>('posts/', {
    params: {
      limit,
      page,
      filter: filterParts.join('+') || undefined,
      order: 'created_at DESC',
    },
  });
  return res;
}

/**
 * Upload an image to Ghost's image store.
 * Returns the public URL.
 */
export async function uploadImage(buffer: Buffer, originalname: string): Promise<GhostAdminImageResponse> {
  // Ghost Admin API image upload requires multipart/form-data
  const url = new URL(`${GHOST_URL}/ghost/api/admin/images/upload/`);

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  formData.append('file', blob, originalname);
  formData.append('purpose', 'image');

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Ghost ${signAdminJwt()}`,
      'Accept-Version': 'v5.0',
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image upload failed: ${res.status} ${text}`);
  }

  return (await res.json()) as GhostAdminImageResponse;
}

/**
 * Get or create a tag by name. Returns the tag slug.
 */
export async function ensureTag(name: string): Promise<string> {
  // Try to find existing
  const findRes = await adminFetch<{ tags: { slug: string; name: string }[] }>('tags/', {
    params: { limit: 1, filter: `name:${name}` },
  });
  if (findRes.tags.length > 0) return findRes.tags[0].slug;

  // Create
  const createRes = await adminFetch<{ tags: { slug: string }[] }>('tags/', {
    method: 'POST',
    body: { tags: [{ name }] },
  });
  return createRes.tags[0].slug;
}

/**
 * Get or create a staff author by email.
 */
export async function ensureAuthor(email: string, name: string): Promise<string> {
  // Try to find existing
  const findRes = await adminFetch<{ users: { id: string; email: string }[] }>('users/', {
    params: { limit: 1, filter: `email:${email}` },
  });
  if (findRes.users.length > 0) return findRes.users[0].id;

  // Invite (Ghost doesn't allow direct author creation — must invite)
  await adminFetch('users/', {
    method: 'POST',
    body: { users: [{ email, name, role: 'Author' }] },
  });

  // Re-fetch (the invite creates a user record immediately)
  const refetch = await adminFetch<{ users: { id: string }[] }>('users/', {
    params: { limit: 1, filter: `email:${email}` },
  });
  return refetch.users[0].id;
}

// ---------------------------------------------------------------------------
// Aggregated default export object (for `import { ghostAdmin } from '@/lib/ghost-admin'`)
// ---------------------------------------------------------------------------

export const ghostAdmin = {
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  getPostBySlug,
  listPosts,
  uploadImage,
  ensureTag,
  ensureAuthor,
};
