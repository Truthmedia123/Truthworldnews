/**
 * src/app/api/search/route.ts
 *
 * Public search proxy to Meilisearch.
 * Hides the master key from the browser.
 *
 * GET /api/search?q=crypto&page=1&limit=20&tag=AI
 */

import { NextResponse } from 'next/server';

const MEILI_HOST = process.env.MEILI_HOST || 'http://meilisearch:7700';
const MEILI_KEY = process.env.MEILI_API_KEY!;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 20)));
  const tag = url.searchParams.get('tag');

  const filter = tag ? [`tag:${tag}`] : [];

  try {
    const res = await fetch(`${MEILI_HOST}/indexes/twn_articles/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MEILI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q,
        page,
        hitsPerPage: limit,
        filter,
        showRankingScore: true,
        attributesToHighlight: ['title', 'tldr_summary', 'content'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[api/search] Meilisearch error:', res.status, text);
      return NextResponse.json(
        { error: 'Search unavailable', hits: [], estimatedTotalHits: 0 },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json({
      hits: data.hits || [],
      total: data.estimatedTotalHits || 0,
      page,
      limit,
      processingTimeMs: data.processingTimeMs || 0,
    });
  } catch (err: any) {
    console.error('[api/search] threw:', err);
    return NextResponse.json(
      { error: 'Search failed', hits: [], total: 0 },
      { status: 500 },
    );
  }
}
