/**
 * src/app/api/auth/me/route.ts
 *
 * Returns the current session user (or 401).
 * Used by the admin dashboard to verify the session is still valid.
 */

import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }
  return NextResponse.json({ user: { email: session.email, role: session.role } });
}
