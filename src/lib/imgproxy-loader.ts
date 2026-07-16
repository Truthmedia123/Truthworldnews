/**
 * src/lib/imgproxy-loader.ts
 *
 * Next.js custom Image loader that signs every URL with imgproxy's HMAC-SHA256.
 *
 * v5.7 spec:
 * - Public imgproxy at https://img.truthworldnews.com
 * - Source images live on R2 (cdn.truthworldnews.com)
 * - Signed URLs (key+salt) prevent unauthorized processing chains
 * - Auto-AVIF for modern browsers, JPEG fallback
 *
 * Wire-up:
 * - In next.config.ts:
 *     images: { loader: 'custom', loaderFile: './src/lib/imgproxy-loader.ts' }
 * - In components:
 *     <Image src="https://cdn.truthworldnews.com/article-images/foo.jpg" alt="..." width={800} height={600} />
 *
 * The loader receives { src, width, quality } and returns a signed imgproxy URL.
 *
 * SECURITY:
 * - IMGPROXY_KEY and IMGPROXY_SALT are server-only env vars.
 * - This file is imported by Next.js at build time on the server, so it CAN
 *   read server-only env vars. The signed URL itself is safe to expose
 *   (the signature is what makes it safe — even if leaked, only the exact
 *   processing options can be used).
 */

import crypto from 'crypto';

const IMGPROXY_URL = process.env.IMGPROXY_URL || 'https://img.truthworldnews.com';
const IMGPROXY_KEY = process.env.IMGPROXY_KEY;
const IMGPROXY_SALT = process.env.IMGPROXY_SALT;

// ---------------------------------------------------------------------------
// URL-safe base64
// ---------------------------------------------------------------------------

function urlSafeBase64(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// ---------------------------------------------------------------------------
// Sign URL with HMAC-SHA256
// ---------------------------------------------------------------------------

function signPath(path: string): string {
  if (!IMGPROXY_KEY || !IMGPROXY_SALT) {
    // If keys aren't set (e.g., during build), return unsigned URL — imgproxy
    // allows this if it's running with `IMGPROXY_USE_HTTPS=false` and no keys
    return path;
  }

  const key = Buffer.from(IMGPROXY_KEY, 'hex');
  const salt = Buffer.from(IMGPROXY_SALT, 'hex');

  const hmac = crypto.createHmac('sha256', Buffer.concat([salt, key]));
  hmac.update(path);
  const sig = hmac.digest('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `/${sig}${path}`;
}

// ---------------------------------------------------------------------------
// Build processing options segment
// ---------------------------------------------------------------------------

interface ImgproxyOpts {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'avif' | 'webp' | 'jpeg' | 'png';
  blur?: number;
  sharpen?: number;
  preset?: 'hero' | 'card' | 'thumb' | 'avatar' | 'og';
  gravity?: 'no' | 'so' | 'ce' | 'ea' | 'we' | 'no' | 'noa';
  enlarge?: boolean;
  extend?: boolean;
}

const PRESETS: Record<NonNullable<ImgproxyOpts['preset']>, ImgproxyOpts> = {
  hero:     { width: 1280, height: 720, quality: 80, format: 'avif', gravity: 'ce' },
  card:     { width: 600,  height: 400, quality: 75, format: 'avif', gravity: 'ce' },
  thumb:    { width: 300,  height: 200, quality: 70, format: 'avif', gravity: 'ce' },
  avatar:   { width: 80,   height: 80,  quality: 75, format: 'avif', gravity: 'ce' },
  og:       { width: 1200, height: 630, quality: 85, format: 'jpeg', gravity: 'ce' },
};

function buildOptsSegment(opts: ImgproxyOpts): string {
  const parts: string[] = [];

  if (opts.width !== undefined) parts.push(`w:${opts.width}`);
  if (opts.height !== undefined) parts.push(`h:${opts.height}`);
  if (opts.quality !== undefined) parts.push(`q:${opts.quality}`);
  if (opts.format) parts.push(`f:${opts.format}`);
  if (opts.blur !== undefined) parts.push(`bl:${opts.blur}`);
  if (opts.sharpen !== undefined) parts.push(`sh:${opts.sharpen}`);
  if (opts.gravity) parts.push(`g:${opts.gravity}`);
  if (opts.enlarge) parts.push('el:true');
  if (opts.extend) parts.push('ex:true');

  return parts.length > 0 ? parts.join(':') : 'raw';
}

// ---------------------------------------------------------------------------
// Public: build a signed imgproxy URL (use outside of <Image/>)
// ---------------------------------------------------------------------------

export function signImgproxyUrl(
  sourceUrl: string,
  opts: ImgproxyOpts = {},
): string {
  // Resolve preset
  if (opts.preset) {
    opts = { ...PRESETS[opts.preset], ...opts };
    delete opts.preset;
  }

  const optsSegment = buildOptsSegment(opts);
  const encodedSource = urlSafeBase64(sourceUrl);
  const path = `/${optsSegment}/${encodedSource}`;
  const signed = signPath(path);

  return `${IMGPROXY_URL}${signed}`;
}

// ---------------------------------------------------------------------------
// Next.js Image loader (default export)
// ---------------------------------------------------------------------------

export default function imgproxyLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Skip signing for SVGs (imgproxy can't process them, and they're tiny anyway)
  if (src.endsWith('.svg') || src.startsWith('data:')) {
    return src;
  }

  // Skip signing for already-imgproxy URLs (don't double-process)
  if (src.startsWith(IMGPROXY_URL)) {
    return src;
  }

  // Auto-select format: AVIF for modern browsers via Accept header (imgproxy does this
  // automatically when format isn't specified, but we set it explicitly for caching)
  const opts: ImgproxyOpts = {
    width,
    quality: quality || 75,
    format: 'avif',
    gravity: 'ce',
  };

  return signImgproxyUrl(src, opts);
}

// ---------------------------------------------------------------------------
// Convenience presets (for non-Image usage, e.g., OG meta tags)
// ---------------------------------------------------------------------------

export const imgproxyPresets = {
  hero:   (src: string) => signImgproxyUrl(src, { preset: 'hero' }),
  card:   (src: string) => signImgproxyUrl(src, { preset: 'card' }),
  thumb:  (src: string) => signImgproxyUrl(src, { preset: 'thumb' }),
  avatar: (src: string) => signImgproxyUrl(src, { preset: 'avatar' }),
  og:     (src: string) => signImgproxyUrl(src, { preset: 'og' }),
};
