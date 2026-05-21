'use client';

import Script from 'next/script';

// ---------------------------------------------------------------------------
// AdSenseBaseScript
// ---------------------------------------------------------------------------
/**
 * Loads the Google AdSense base script once, using next/script with the
 * `lazyOnload` strategy so it never blocks the initial page render.
 *
 * Place this component **once** in your root layout — it only needs to be
 * present on the page for `window.adsbygoogle` to become available.
 */
export default function AdSenseBaseScript() {
    return (
        <Script
            id="google-adsense-base"
            async
            strategy="lazyOnload"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9117328583901959"
            crossOrigin="anonymous"
        />
    );
}