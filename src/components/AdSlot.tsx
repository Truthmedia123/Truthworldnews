'use client';

import { useEffect, useRef } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';

interface AdSlotProps {
  slot: 'in-article' | 'sidebar' | 'header' | 'footer';
  className?: string;
}

const AD_CONFIG = {
  'in-article': { width: 300, height: 250, class: 'adsbygoogle' },
  'sidebar': { width: 160, height: 600, class: 'adsbygoogle' },
  'header': { width: 728, height: 90, class: 'adsbygoogle' },
  'footer': { width: 728, height: 90, class: 'adsbygoogle' },
};

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  const { consent } = useCookieConsent();
  const adRef = useRef<HTMLDivElement>(null);
  const config = AD_CONFIG[slot];

  useEffect(() => {
    if (!consent?.marketing || !adRef.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [consent?.marketing]);

  if (!consent?.marketing) {
    return (
      <div className={`bg-gray-900 border border-gray-800 rounded p-4 ${className}`}>
        <p className="text-gray-600 text-xs text-center">
          [Ads disabled &mdash; accept marketing cookies to support Truth World News]
        </p>
      </div>
    );
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className={config.class}
        style={{ display: 'inline-block', width: config.width, height: config.height }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={`${slot}-placeholder`}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
