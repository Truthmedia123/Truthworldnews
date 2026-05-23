import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },

  // Note: Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
  // cannot be set via next.config.ts when using `output: "export"`.
  // Configure them at your hosting level:
  //   - Vercel: vercel.json `headers` array
  //   - Cloudflare Pages: _headers file in public/
  //   - Netlify: netlify.toml `[[headers]]`
  //
  // A _headers file for Cloudflare Pages is included in public/_headers
};

export default nextConfig;
