/**
 * src/app/api/reactions/route.ts
 *
 * Public endpoint for article reactions.
 * GET  /api/reactions?slug=foo  → returns reaction counts
 * POST /api/reactions           → adds a reaction (rate-limited at Caddy layer)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addReaction, getReactionsForArticle } from '@/lib/postgres';

const postSchema = z.object({
  article_slug: z.string().min(1).max(200),
  reaction_type: z.enum(['fire', 'mind_blown', 'fake_news', 'boring', 'agree', 'disagree']),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  const reactions = await getReactionsForArticle(slug);
  return NextResponse.json({ reactions });
}

export async function POST(request: Request) {
  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid body', details: err.flatten?.() },
      { status: 400 },
    );
  }

  try {
    await addReaction(body.article_slug, body.reaction_type);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reactions] insert failed:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
