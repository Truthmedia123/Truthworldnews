'use client';

import { useCookieConsent } from '@/hooks/useCookieConsent';
import AdSenseBaseScript from '@/components/AdSenseBaseScript';
import AdSlot from '@/components/AdSlot';

/**
 * Client wrapper that conditionally renders AdSense components
 * only when the user has consented to marketing cookies.
 *
 * Place this in the root layout — it reads localStorage to decide
 * whether to load the AdSense base script and ad units.
 */
export default function ConditionalAds() {
    const { marketingAllowed, hasChosen } = useCookieConsent();

    // Don't render ads until the user has made a choice AND opted in
    if (!hasChosen || !marketingAllowed) return null;

    return (
        <>
            <AdSenseBaseScript />
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <AdSlot format="horizontal" />
            </div>
        </>
    );
}