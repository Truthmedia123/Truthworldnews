'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Extend the global Window interface so TypeScript knows about adsbygoogle
// ---------------------------------------------------------------------------
declare global {
    interface Window {
        adsbygoogle?: Array<Record<string, unknown>>;
    }
}

// ---------------------------------------------------------------------------
// useAdReady
// ---------------------------------------------------------------------------
/**
 * Custom hook that tracks whether the Google AdSense base script has loaded
 * and `window.adsbygoogle` is available.
 *
 * Returns:
 *  - ready   — true once adsbygoogle is on the window object
 *  - pushAd  — a safe wrapper around (adsbygoogle = … || []).push({})
 */
export function useAdReady() {
    const [ready, setReady] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        // Already available (e.g. script loaded before this component mounted)
        if (typeof window !== 'undefined' && window.adsbygoogle) {
            setReady(true);
            return;
        }

        // Poll until adsbygoogle appears (the next/script lazyOnload will set it)
        intervalRef.current = setInterval(() => {
            if (typeof window !== 'undefined' && window.adsbygoogle) {
                setReady(true);
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }, 300);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const pushAd = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.warn('[useAdReady] AdSense push failed:', error);
        }
    }, []);

    return { ready, pushAd } as const;
}