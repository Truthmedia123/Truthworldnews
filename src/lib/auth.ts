/**
 * src/lib/auth.ts
 *
 * JWT-based admin auth. Replaces Supabase Auth for /admin/* routes.
 *
 * Design:
 * - Single admin (env vars ADMIN_EMAIL + ADMIN_PASSWORD_HASH)
 * - JWT signed with ADMIN_JWT_SECRET (HS256, 24h expiry)
 * - Stored in HttpOnly cookie named `twn-admin`
 * - For multi-admin support later: add a `users` table in Postgres + replace
 *   verifyPassword() to query it. The rest of the file stays unchanged.
 *
 * Security notes:
 * - Cookies are HttpOnly + SameSite=Lax + Secure (in production)
 * - JWT contains email + role only (no password, no PII)
 * - Login endpoint rate-limited at the Caddy/Cloudflare layer (not here)
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;
const COOKIE_NAME = 'twn-admin';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.warn('[auth] ADMIN_JWT_SECRET, ADMIN_EMAIL, or ADMIN_PASSWORD_HASH is not set');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminSession {
  email: string;
  role: 'admin';
  iat: number;
  exp: number;
}

// ---------------------------------------------------------------------------
// Password verification
// ---------------------------------------------------------------------------

export function verifyPassword(email: string, password: string): boolean {
  if (!email || !password) return false;
  if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;
  try {
    return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
  } catch (err) {
    console.error('[auth] bcrypt compare failed:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// JWT issue / verify
// ---------------------------------------------------------------------------

const enc = new TextEncoder();

export async function issueSession(email: string): Promise<string> {
  if (!JWT_SECRET) throw new Error('ADMIN_JWT_SECRET is not set');

  return new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .setIssuer('twn-nextjs')
    .setAudience('twn-admin')
    .sign(enc.encode(JWT_SECRET));
}

export async function verifySession(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token || !JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, enc.encode(JWT_SECRET), {
      issuer: 'twn-nextjs',
      audience: 'twn-admin',
    });
    if (payload.email !== ADMIN_EMAIL) return null;
    return {
      email: payload.email as string,
      role: 'admin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  };
}

// ---------------------------------------------------------------------------
// Reading the session from a Next.js Request
// ---------------------------------------------------------------------------

export async function getSessionFromRequest(req: Request): Promise<AdminSession | null> {
  // Try cookie first
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }),
  );
  const token = cookies[COOKIE_NAME];
  return verifySession(token);
}

// ---------------------------------------------------------------------------
// Bcrypt hash helper (for initial setup — generate hash from password)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
