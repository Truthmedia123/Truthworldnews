/**
 * src/app/api/admin/tips/route.ts
 *
 * Lists submitted tips for the admin dashboard.
 * Auth: cookie-based JWT (middleware).
 */

import { NextResponse } from 'next/server';
import { listTips } from '@/lib/postgres';

export async function GET() {
  const tips = await listTips(100);
  return NextResponse.json(tips);
}
