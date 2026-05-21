import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 — Page Not Found',
};

export default function NotFoundPage() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
            <div className="max-w-lg text-center">
                {/* Glitchy 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[10rem] md:text-[14rem] font-inter font-black leading-none text-[#FFFF00] opacity-20 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-6xl font-inter font-black uppercase tracking-tighter text-white">
                            We lost that page...
                        </span>
                    </div>
                </div>

                <p className="text-xl md:text-2xl font-bold text-gray-400 mb-8 leading-relaxed">
                    Maybe it's in the bunker. Maybe the AI ate it. Maybe it never existed and this is all a simulation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 font-inter font-black uppercase text-lg bg-[#FFFF00] text-black border-4 border-[#FFFF00] hover:bg-black hover:text-[#FFFF00] transition-all shadow-[4px_4px_0px_0px_rgba(255,255,0,0.3)]"
                    >
                        Take Me Home
                    </Link>
                    <Link
                        href="/contact"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 font-inter font-black uppercase text-lg border-2 border-white/30 text-white hover:border-[#FFFF00] hover:text-[#FFFF00] transition-all"
                    >
                        Report This
                    </Link>
                </div>

                <p className="text-gray-600 text-sm mt-12">
                    If you believe this page should exist, contact{' '}
                    <a href="mailto:contact@truthworldnews.com" className="text-[#FFFF00] underline">contact@truthworldnews.com</a>
                </p>
            </div>
        </main>
    );
}