/**
 * src/middleware.ts
 *
 * Replaces the Supabase-based middleware.
 * Protects /admin/* with a JWT cookie check.
 *
 * Public routes (no auth):
 *   /, /article/*, /category/*, /search, /quizzes, /quiz/*,
 *   /submit-tip, /api/post-news (Bearer auth, not cookie),
 *   /api/tip, /api/subscribe, /api/reactions,
 *   /api/auth/login, /api/auth/logout,
 *   /rss.xml, /sitemap.xml, /robots.txt, /ads.txt, /favicon.ico
 *
 * Protected routes (cookie auth):
 *   /admin/* (except /admin/login)
 *   /api/admin/* (server-to-server, but also cookie-authenticated for browser use)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession, getCookieName } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/admin/login',
];

const PUBLIC_PREFIXES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/post-news',     // Bearer-authed by Python pipeline
  '/api/tip',
  '/api/subscribe',
  '/api/reactions',
  '/api/search',        // Public search proxy
  '/_next/',
  '/favicon',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next();
  }
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect /admin/* (except /admin/login already handled above)
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminApiRoute = pathname.startsWith('/api/admin/');

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Verify JWT
  const token = request.cookies.get(getCookieName())?.value;
  const session = await verifySession(token);

  if (!session) {
    // For browser routes → redirect to login
    if (isAdminRoute) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // For API routes → 401 JSON
    return NextResponse.json(
      { error: 'Unauthorized', code: 'NO_SESSION' },
      { status: 401 },
    );
  }

  // Optional: check expiry approaching → refresh cookie
  // (skip for v6 — 24h TTL is enough; user can re-login)

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
