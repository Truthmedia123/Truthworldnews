'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function ConditionalAds() {
  const { consent, isReady } = useCookieConsent();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setShouldLoad((consent?.analytics ?? false) && (consent?.marketing ?? false));
  }, [consent, isReady]);

  if (!shouldLoad) return null;

  return (
    <>
      <Script
        id="adsense-script"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
        crossOrigin="anonymous"
      />
      <Script id="adsense-init" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({});
        `}
      </Script>
    </>
  );
}