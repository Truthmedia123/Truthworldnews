/**
 * src/app/api/tip/route.ts
 *
 * Public endpoint for the Submit Tip form.
 * No auth — anonymous tips must work.
 * Rate-limited at Caddy/Cloudflare layer.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTip } from '@/lib/postgres';

const schema = z.object({
  title: z.string().min(3).max(200),
  story: z.string().min(10).max(10000),
  evidence_url: z.string().url().optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Invalid submission', details: err.flatten?.() },
      { status: 400 },
    );
  }

  try {
    await createTip(body);
    // Always return success — never reveal internal state to anonymous tipsters
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[tip] insert failed:', err);
    // Still return success — anonymous tips must not leak errors
    return NextResponse.json({ ok: true });
  }
}
