/**
 * src/components/PlausibleScript.tsx
 *
 * Adds the Plausible analytics script tag to every page.
 * Loaded from admin.truthworldnews.com/plausible/js/script.js (self-hosted per v5.7).
 *
 * Plausible runs IN PARALLEL with GA4 and Microsoft Clarity (both already in
 * layout.tsx). It is NOT a replacement — see discrepancy report §7.
 *
 * Privacy:
 * - No cookies
 * - No PII
 * - GDPR-compliant out of the box (no consent banner needed for Plausible)
 */

export default function PlausibleScript() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC;

  if (!domain || !src) return null;

  return (
    <script
      defer
      data-domain={domain}
      src={src}
      // Plausible respects Do Not Track by default — no extra config needed
    />
  );
}
