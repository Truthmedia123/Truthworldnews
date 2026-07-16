/**
 * next.config.ts
 *
 * v6 configuration for TruthWorldNews.
 *
 * Critical changes from the repo's current next.config.ts:
 * 1. output: 'standalone' (was 'export') — required for ISR, middleware, API routes, imgproxy loader
 * 2. images.loader: 'custom' — routes every <Image/> through imgproxy
 * 3. images.loaderFile — points to our signed-URL loader
 * 4. images.remotePatterns — allows cdn.truthworldnews.com (R2) and news.truthworldnews.com (Ghost)
 * 5. rewrites — proxies /rss.xml, /sitemap.xml, /author/{slug}/rss/, /tag/{slug}/rss/ to Ghost
 * 6. headers — strict CSP allowing only TWN subdomains
 * 7. transpilePackages — @tryghost/content-api needs transpiling for Next.js
 *
 * Reference: discrepancy report §1 (output: 'export' is broken for this codebase)
 */

import type { NextConfig } from 'next';

const GHOST_PUBLIC_URL = process.env.NEXT_PUBLIC_GHOST_URL || 'https://news.truthworldnews.com';
const REMARK42_URL = process.env.NEXT_PUBLIC_REMARK42_URL || 'https://admin.truthworldnews.com/remark42';
const PLAUSIBLE_URL = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || 'https://admin.truthworldnews.com/plausible/js/script.js';
const IMGPROXY_URL = process.env.IMGPROXY_URL || 'https://img.truthworldnews.com';
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.truthworldnews.com';

const nextConfig: NextConfig = {
  // ── 1. Output mode ──────────────────────────────────────────────────────
  output: 'standalone',  // was 'export' — fixes the build-breaking contradiction

  // ── 2. Image optimization via imgproxy ──────────────────────────────────
  images: {
    loader: 'custom',
    loaderFile: './src/lib/imgproxy-loader.ts',
    // Still need remotePatterns in case any code bypasses the loader
    // (e.g., <img src=...> instead of <Image src=...>)
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.truthworldnews.com' },         // R2
      { protocol: 'https', hostname: 'news.truthworldnews.com' },        // Ghost
      { protocol: 'https', hostname: 'img.truthworldnews.com' },         // imgproxy itself
      { protocol: 'https', hostname: 'images.unsplash.com' },            // stock photos
      { protocol: 'https', hostname: 'supabase.co' },                    // legacy image URLs from migrated articles
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // ── 3. Transpile packages ──────────────────────────────────────────────
  transpilePackages: [
    '@tryghost/content-api',
    '@tryghost/admin-api',
    'mobiledoc-react-renderer',
  ],

  // ── 4. Rewrites — proxy Ghost's RSS/sitemap to our domain ───────────────
  async rewrites() {
    const ghostInternal = process.env.GHOST_INTERNAL_URL || GHOST_PUBLIC_URL;
    return [
      // Main RSS feed → Ghost /rss/
      { source: '/rss.xml', destination: `${ghostInternal}/rss/` },
      // Author RSS
      { source: '/author/:slug/rss/', destination: `${ghostInternal}/author/:slug/rss/` },
      // Tag RSS
      { source: '/tag/:slug/rss/', destination: `${ghostInternal}/tag/:slug/rss/` },
      // Ghost sitemap (we have our own /sitemap.ts but Ghost's is more complete)
      { source: '/sitemap.xml', destination: `${ghostInternal}/sitemap.xml` },
      { source: '/sitemap-:type.xml', destination: `${ghostInternal}/sitemap-:type.xml` },
      // Ghost robots.txt (proxy to allow Ghost to control crawl directives)
      { source: '/robots.txt', destination: `${ghostInternal}/robots.txt` },
    ];
  },

  // ── 5. Headers — security & caching ─────────────────────────────────────
  async headers() {
    const csp = [
      "default-src 'self'",
      // Allow scripts from TWN subdomains (Plausible, remark42, Ghost) + GA4 + Clarity + AdSense
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${REMARK42_URL} https://admin.truthworldnews.com https://www.googletagmanager.com https://www.clarity.ms https://pagead2.googlesyndication.com https://adservice.google.com`,
      // Styles: TWN subdomains + inline (Tailwind, CSS-in-JS)
      `style-src 'self' 'unsafe-inline' ${REMARK42_URL} https://fonts.googleapis.com`,
      // Images: all TWN subdomains + R2 + Unsplash + data: + blob: (imgproxy uses these)
      `img-src 'self' data: blob: ${IMGPROXY_URL} ${CDN_URL} https://news.truthworldnews.com https://images.unsplash.com https://pagead2.googlesyndication.com`,
      // Fonts
      `font-src 'self' data: https://fonts.gstatic.com`,
      // Connections: TWN subdomains + GA4 + Clarity + AdSense
      `connect-src 'self' ${REMARK42_URL} https://admin.truthworldnews.com https://*.truthworldnews.com https://www.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://pagead2.googlesyndication.com https://adservice.google.com`,
      // Frames: AdSense iframes
      `frame-src 'self' https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com`,
      // Forms: self only
      "form-action 'self'",
      // Block mixed content
      "upgrade-insecure-requests",
      // Base URL restriction
      "base-uri 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Don't cache admin pages
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
        ],
      },
      {
        // ISR pages: 60s at edge, 300s stale
        source: '/article/:slug',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },

  // ── 6. Experimental / future flags ──────────────────────────────────────
  experimental: {
    // Enable if you want faster ISR revalidation (Next.js 16+)
    optimisticClientCache: true,
  },

  // ── 7. Logging ──────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
