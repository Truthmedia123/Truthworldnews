/**
 * src/app/api/subscribe/route.ts
 *
 * Public endpoint for the newsletter subscribe form.
 * Inserts into Postgres + (optionally) pushes to listmonk via API.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addSubscriber } from '@/lib/postgres';

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  try {
    await addSubscriber(body.email, body.source || 'site-footer');
  } catch (err) {
    console.error('[subscribe] Postgres insert failed:', err);
    // Continue — listmonk might still work
  }

  // Push to listmonk (parallel to Postgres — listmonk is the canonical source for sends)
  const listmonkUrl = process.env.LISTMONK_URL;
  const listmonkUser = process.env.LISTMONK_USER;
  const listmonkPass = process.env.LISTMONK_PASS;
  const listmonkListId = process.env.LISTMONK_LIST_ID || '1';

  if (listmonkUrl && listmonkUser && listmonkPass) {
    try {
      await fetch(`${listmonkUrl}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from(`${listmonkUser}:${listmonkPass}`).toString('base64'),
        },
        body: JSON.stringify({
          email: body.email,
          name: '',
          lists: [Number(listmonkListId)],
          status: 'enabled',
          preconfirm_subscriptions: true,
        }),
      });
    } catch (err) {
      console.error('[subscribe] listmonk push failed (non-blocking):', err);
      // Non-blocking — Postgres record is enough for now
    }
  }

  return NextResponse.json({ ok: true });
}
