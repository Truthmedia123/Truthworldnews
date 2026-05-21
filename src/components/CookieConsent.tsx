'use client';

import { useState, useEffect } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { X, Shield, Cookie, BarChart3 } from 'lucide-react';

// ---------------------------------------------------------------------------
// CookieConsent
// ---------------------------------------------------------------------------
/**
 * Fixed bottom cookie consent banner with a "Manage Preferences" modal.
 *
 * - Stores preferences in localStorage (30-day expiry).
 * - Blocks AdSense / analytics scripts unless consent is given.
 * - Auto-hides if the user has already made a choice within 30 days.
 */
export default function CookieConsent() {
    const { hasChosen, acceptAll, rejectAll, saveCustom, prefs } = useCookieConsent();
    const [modalOpen, setModalOpen] = useState(false);

    // Local toggle state for the modal (synced from stored prefs)
    const [marketing, setMarketing] = useState(prefs?.marketing ?? false);
    const [analytics, setAnalytics] = useState(prefs?.analytics ?? false);

    useEffect(() => {
        setMarketing(prefs?.marketing ?? false);
        setAnalytics(prefs?.analytics ?? false);
    }, [prefs]);

    // Don't render anything if the user already chose
    if (hasChosen) return null;

    const handleSavePreferences = () => {
        saveCustom(marketing, analytics);
        setModalOpen(false);
    };

    return (
        <>
            {/* ── Bottom Banner ── */}
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-ad-float">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-black border-2 border-[#FFFF00] rounded-lg p-4 sm:p-6 shadow-[0_-4px_24px_rgba(255,255,0,0.15)] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Icon + Text */}
                        <div className="flex items-start gap-3 flex-1">
                            <Cookie size={24} className="text-[#FFFF00] shrink-0 mt-0.5" />
                            <p className="text-white text-sm font-bold leading-relaxed">
                                We use cookies to personalize ads and analyze traffic. By clicking{' '}
                                <strong>"Accept All"</strong>, you consent to our use of cookies.{' '}
                                <a href="/cookie-policy" className="text-[#FFFF00] underline hover:text-white transition-colors">
                                    Learn more
                                </a>
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-4 py-2 text-sm font-inter font-black uppercase border-2 border-white/30 text-white rounded hover:border-white hover:bg-white/10 transition-all"
                            >
                                Manage
                            </button>
                            <button
                                onClick={rejectAll}
                                className="px-4 py-2 text-sm font-inter font-black uppercase border-2 border-gray-500 text-gray-400 rounded hover:border-gray-300 hover:text-gray-200 transition-all"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={acceptAll}
                                className="px-6 py-2 text-sm font-inter font-black uppercase bg-[#FFFF00] text-black border-2 border-[#FFFF00] rounded hover:bg-black hover:text-[#FFFF00] transition-all"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Preferences Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setModalOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-zinc-900 border-2 border-[#FFFF00] rounded-lg max-w-md w-full p-6 shadow-[0_0_40px_rgba(255,255,0,0.2)]">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-inter font-black uppercase text-white flex items-center gap-2">
                                <Shield size={20} className="text-[#FFFF00]" />
                                Cookie Preferences
                            </h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Choose which cookies you allow. Necessary cookies are always enabled — they keep the site functional.
                        </p>

                        {/* Toggle: Necessary (always on) */}
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-green-400" />
                                <div>
                                    <p className="text-white font-bold text-sm">Necessary Cookies</p>
                                    <p className="text-gray-500 text-xs">Required for the site to function.</p>
                                </div>
                            </div>
                            <div className="w-10 h-6 bg-green-500/30 rounded-full flex items-center px-0.5">
                                <div className="w-5 h-5 bg-green-400 rounded-full shadow ml-auto" />
                            </div>
                        </div>

                        {/* Toggle: Marketing */}
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <Cookie size={18} className="text-yellow-400" />
                                <div>
                                    <p className="text-white font-bold text-sm">Marketing / Ad Cookies</p>
                                    <p className="text-gray-500 text-xs">Google AdSense personalized ads.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMarketing((v) => !v)}
                                className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${marketing ? 'bg-[#FFFF00]' : 'bg-white/20'
                                    }`}
                                aria-label="Toggle marketing cookies"
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${marketing ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Toggle: Analytics */}
                        <div className="flex items-center justify-between py-3 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={18} className="text-blue-400" />
                                <div>
                                    <p className="text-white font-bold text-sm">Analytics Cookies</p>
                                    <p className="text-gray-500 text-xs">Google Analytics, Microsoft Clarity.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnalytics((v) => !v)}
                                className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${analytics ? 'bg-[#FFFF00]' : 'bg-white/20'
                                    }`}
                                aria-label="Toggle analytics cookies"
                            >
                                <div
                                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${analytics ? 'translate-x-4' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSavePreferences}
                            className="mt-6 w-full py-3 font-inter font-black uppercase text-sm bg-[#FFFF00] text-black border-2 border-[#FFFF00] rounded hover:bg-black hover:text-[#FFFF00] transition-all"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}