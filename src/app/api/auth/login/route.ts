/**
 * src/app/api/auth/login/route.ts
 *
 * POST { email, password } → sets HttpOnly JWT cookie, returns 200.
 * On failure, returns 401.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword, issueSession, getCookieName, getCookieOptions } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!verifyPassword(body.email, body.password)) {
    // Sleep briefly to slow brute-force (real rate-limiting is at Caddy/Cloudflare layer)
    await new Promise(r => setTimeout(r, 500));
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 },
    );
  }

  const token = await issueSession(body.email.toLowerCase());

  const res = NextResponse.json({ ok: true, user: { email: body.email } });
  res.cookies.set(getCookieName(), token, getCookieOptions());
  return res;
}
