/**
 * src/app/api/admin/posts/route.ts
 *
 * Lists all posts (drafts + published) for the admin dashboard.
 * Auth: cookie-based JWT (enforced by middleware).
 */

import { NextResponse } from 'next/server';
import { ghostAdmin } from '@/lib/ghost-admin';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = (url.searchParams.get('status') || 'all') as 'draft' | 'published' | 'all';
  const limit = Number(url.searchParams.get('limit') || 50);
  const page = Number(url.searchParams.get('page') || 1);

  try {
    const res = await ghostAdmin.listPosts({ status, limit, page });
    return NextResponse.json(res.posts);
  } catch (err: any) {
    console.error('[admin/posts] Ghost list failed:', err);
    return NextResponse.json(
      { error: 'Failed to list posts', details: err.message },
      { status: 502 },
    );
  }
}
