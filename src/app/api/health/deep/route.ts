/**
 * src/app/api/health/deep/route.ts
 *
 * Deep health check — verifies all upstreams are reachable.
 * Used by Uptime-Kuma for end-to-end monitoring.
 *
 * Returns 200 OK only if ALL upstreams respond.
 * Returns 503 with details if any upstream is down.
 */

import { NextResponse } from 'next/server';
import { pingPostgres } from '@/lib/postgres';

export async function GET() {
  const checks: Record<string, boolean | string> = {};

  // ── Ghost ───────────────────────────────────────────────────────────────
  try {
    const ghostUrl = process.env.GHOST_INTERNAL_URL || process.env.NEXT_PUBLIC_GHOST_URL;
    const res = await fetch(`${ghostUrl}/ghost/api/content/site/?key=${process.env.GHOST_CONTENT_API_KEY}`, {
      signal: AbortSignal.timeout(3000),
    });
    checks.ghost = res.ok;
  } catch (err: any) {
    checks.ghost = `error: ${err.message}`;
  }

  // ── Postgres ─────────────────────────────────────────────────────────────
  try {
    checks.postgres = await pingPostgres();
  } catch (err: any) {
    checks.postgres = `error: ${err.message}`;
  }

  // ── Meilisearch ──────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${process.env.MEILI_HOST}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    checks.meilisearch = res.ok;
  } catch (err: any) {
    checks.meilisearch = `error: ${err.message}`;
  }

  // ── imgproxy ─────────────────────────────────────────────────────────────
  try {
    const res = await fetch(`${process.env.IMGPROXY_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    checks.imgproxy = res.ok;
  } catch (err: any) {
    checks.imgproxy = `error: ${err.message}`;
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  const allOk = Object.values(checks).every(v => v === true);

  return NextResponse.json(
    {
      ok: allOk,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 },
  );
}
