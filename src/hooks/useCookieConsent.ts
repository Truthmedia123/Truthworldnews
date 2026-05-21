'use client';

import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CookiePreferences {
    necessary: boolean;   // always true
    marketing: boolean;
    analytics: boolean;
    timestamp: number;
}

const STORAGE_KEY = 'tw_cookie_prefs';
const EXPIRY_DAYS = 30;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function loadPrefs(): CookiePreferences | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const prefs: CookiePreferences = JSON.parse(raw);
        // Expire after 30 days
        const age = Date.now() - prefs.timestamp;
        if (age > EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return prefs;
    } catch {
        return null;
    }
}

function savePrefs(prefs: CookiePreferences): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// ---------------------------------------------------------------------------
// useCookieConsent
// ---------------------------------------------------------------------------
/**
 * Hook to read and update cookie consent preferences.
 * Used by CookieConsent banner and by AdSlot / analytics components
 * to conditionally load third-party scripts.
 */
export function useCookieConsent() {
    const [prefs, setPrefs] = useState<CookiePreferences | null>(null);
    const [hasChosen, setHasChosen] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = loadPrefs();
        if (stored) {
            setPrefs(stored);
            setHasChosen(true);
        }
    }, []);

    const acceptAll = useCallback(() => {
        const newPrefs: CookiePreferences = {
            necessary: true,
            marketing: true,
            analytics: true,
            timestamp: Date.now(),
        };
        savePrefs(newPrefs);
        setPrefs(newPrefs);
        setHasChosen(true);
    }, []);

    const rejectAll = useCallback(() => {
        const newPrefs: CookiePreferences = {
            necessary: true,
            marketing: false,
            analytics: false,
            timestamp: Date.now(),
        };
        savePrefs(newPrefs);
        setPrefs(newPrefs);
        setHasChosen(true);
    }, []);

    const saveCustom = useCallback((marketing: boolean, analytics: boolean) => {
        const newPrefs: CookiePreferences = {
            necessary: true,
            marketing,
            analytics,
            timestamp: Date.now(),
        };
        savePrefs(newPrefs);
        setPrefs(newPrefs);
        setHasChosen(true);
    }, []);

    const reset = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setPrefs(null);
        setHasChosen(false);
    }, []);

    return {
        prefs,
        hasChosen,
        acceptAll,
        rejectAll,
        saveCustom,
        reset,
        marketingAllowed: prefs?.marketing ?? false,
        analyticsAllowed: prefs?.analytics ?? false,
    } as const;
}