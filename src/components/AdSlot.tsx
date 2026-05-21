'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdReady } from '@/hooks/useAdReady';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type AdFormat = 'horizontal' | 'vertical' | 'square';

interface AdSlotProps {
  /** Which shape / orientation the ad unit should take */
  format?: AdFormat;
  /** Additional Tailwind classes merged onto the wrapper */
  className?: string;
}

// ---------------------------------------------------------------------------
// Format → dimensions map (used for the skeleton & the <ins> element)
// ---------------------------------------------------------------------------
const FORMAT_MAP: Record<
  AdFormat,
  { width: number; height: number; style: string; dataAdFormat: string }
> = {
  horizontal: {
    width: 728,
    height: 90,
    style: 'display:block; width:100%; max-width:728px; height:90px;',
    dataAdFormat: 'horizontal',
  },
  vertical: {
    width: 160,
    height: 600,
    style: 'display:block; width:160px; height:600px;',
    dataAdFormat: 'vertical',
  },
  square: {
    width: 300,
    height: 250,
    style: 'display:block; width:300px; height:250px;',
    dataAdFormat: 'rectangle',
  },
};

// ---------------------------------------------------------------------------
// AdSlot
// ---------------------------------------------------------------------------
/**
 * A self-contained AdSense ad unit.
 *
 * - Renders a dark, glowing skeleton placeholder while the ad loads.
 * - Uses a CSS float-up animation (`animate-ad-float`) for a smooth entrance.
 * - Once `window.adsbygoogle` is ready, the real `<ins>` is injected and the
 *   skeleton fades out via `opacity` transition — no layout shift, no jank.
 */
export default function AdSlot({ format = 'horizontal', className = '' }: AdSlotProps) {
  const { ready, pushAd } = useAdReady();
  const insRef = useRef<HTMLModElement | null>(null);
  const [adPushed, setAdPushed] = useState(false);
  const [adVisible, setAdVisible] = useState(false);

  const { style, dataAdFormat } = FORMAT_MAP[format];

  // ------------------------------------------------------------------
  // Push the ad unit once the script is ready AND the <ins> is in the DOM
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!ready || adPushed) return;

    // Small delay so the <ins> element is definitely mounted
    const timer = setTimeout(() => {
      if (insRef.current) {
        pushAd();
        setAdPushed(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ready, adPushed, pushAd]);

  // ------------------------------------------------------------------
  // After pushing, wait a short beat then reveal the ad (fade skeleton out)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!adPushed) return;
    const timer = setTimeout(() => setAdVisible(true), 600);
    return () => clearTimeout(timer);
  }, [adPushed]);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div
      className={`relative mx-auto my-10 overflow-hidden ${className}`}
      style={{ minHeight: FORMAT_MAP[format].height }}
    >
      {/* ---- Skeleton placeholder ---- */}
      <div
        aria-hidden={adVisible}
        className={`
          absolute inset-0 z-10 flex flex-col items-center justify-center
          rounded-lg border border-white/10 bg-white/[0.03]
          backdrop-blur-sm
          transition-opacity duration-700 ease-out
          ${adVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          animate-ad-float
        `}
      >
        {/* Glowing pulse bar */}
        <div className="mb-3 h-1 w-2/3 rounded-full bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent animate-pulse" />

        {/* Skeleton lines mimicking ad content */}
        <div className="w-4/5 space-y-2">
          <div className="h-3 w-full rounded bg-white/10 animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="h-3 w-3/4 rounded bg-white/10 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-3 w-1/2 rounded bg-white/10 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Subtle label */}
        <span className="mt-4 font-inter text-[10px] font-black uppercase tracking-[0.25em] text-white/20">
          Ad
        </span>
      </div>

      {/* ---- Real AdSense <ins> ---- */}
      <ins
        ref={insRef}
        className="adsbygoogle block mx-auto"
        style={{ width: '100%', maxWidth: FORMAT_MAP[format].width, height: FORMAT_MAP[format].height }}
        data-ad-client="ca-pub-9117328583901959"
        data-ad-slot="" /* populated by AdSense auto-ads or leave empty for manual */
        data-ad-format={dataAdFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
