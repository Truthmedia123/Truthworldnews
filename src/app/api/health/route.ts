/**
 * src/app/api/health/route.ts
 *
 * Health check endpoint for Docker HEALTHCHECK + Uptime-Kuma monitoring.
 * Returns 200 OK if the app is running. Does NOT check upstream services
 * (Ghost, Postgres, Meilisearch) — those have their own health checks.
 *
 * For deep health check (including upstreams), use /api/health/deep.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'twn-nextjs',
    version: process.env.npm_package_version || 'unknown',
    timestamp: new Date().toISOString(),
  });
}
