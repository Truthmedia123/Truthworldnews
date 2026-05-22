'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Latest' },
    { href: '/category/ai/', label: 'AI' },
    { href: '/category/crypto/', label: 'Crypto' },
    { href: '/category/weird-tech/', label: 'Weird Tech' },
    { href: '/search/', label: 'Search' },
    { href: '/quizzes', label: 'Quizzes' },
    { href: '/premium/', label: 'Premium' },
] as const;

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // White header on: homepage and quizzes only
    const isWhiteHeaderRoute =
        pathname === '/' ||
        pathname.startsWith('/quizzes');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-colors duration-300 border-b-2 border-[#FFFF00] ${isWhiteHeaderRoute ? 'bg-white' : 'bg-black'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link
                    href="/"
                    className={`text-2xl font-black tracking-tighter uppercase font-inter transition-colors ${isWhiteHeaderRoute
                        ? 'text-black hover:text-yellow-600'
                        : 'text-white hover:text-[#FFFF00]'
                        }`}
                >
                    TRUTHWORLD<span className="text-[#FFFF00]">NEWS</span>
                </Link>

                {/* Desktop Category Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className={`text-sm font-black tracking-widest uppercase transition-colors ${isWhiteHeaderRoute
                                ? 'text-black hover:text-yellow-600'
                                : 'text-white hover:text-[#FFFF00]'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side: Search + CTA + Hamburger */}
                <div className="flex items-center gap-3">
                    {/* Desktop Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className={`hidden lg:flex items-center border px-3 py-1 transition-colors ${isWhiteHeaderRoute
                            ? 'bg-transparent border-black/20 text-black'
                            : 'bg-[#111] border-white/20 text-white hover:border-[#FFFF00] focus-within:border-[#FFFF00]'
                            }`}
                    >
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`bg-transparent text-xs font-bold tracking-widest outline-none w-32 focus:w-48 transition-all placeholder-gray-500 ${isWhiteHeaderRoute ? 'text-black' : 'text-white'
                                }`}
                        />
                        <button type="submit" className="ml-2 font-black">
                            ↗
                        </button>
                    </form>

                    {/* Submit Tip CTA — always yellow/black, brutalist, never changes */}
                    <Link
                        href="/submit-tip"
                        className="bg-[#FFFF00] !text-black px-4 py-1.5 text-xs font-black tracking-widest uppercase transition-all duration-200 hover:bg-white hover:scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        Submit Tip
                    </Link>

                    {/* Hamburger — mobile only */}
                    <button
                        onClick={() => setIsMobileMenuOpen((v) => !v)}
                        className="md:hidden flex flex-col gap-1 p-1"
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                    >
                        <span
                            className={`block w-5 h-0.5 transition-all duration-200 ${isWhiteHeaderRoute ? 'bg-black' : 'bg-white'
                                } ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
                        />
                        <span
                            className={`block w-5 h-0.5 transition-all duration-200 ${isWhiteHeaderRoute ? 'bg-black' : 'bg-white'
                                } ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                        />
                        <span
                            className={`block w-5 h-0.5 transition-all duration-200 ${isWhiteHeaderRoute ? 'bg-black' : 'bg-white'
                                } ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <nav
                    className={`absolute top-full left-0 w-full border-b-2 border-[#FFFF00] flex flex-col p-4 gap-2 md:hidden ${isWhiteHeaderRoute ? 'bg-white' : 'bg-black'
                        }`}
                >
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="w-full mb-4 px-4 pt-4">
                        <input
                            type="text"
                            placeholder="SEARCH LEAKS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/20 text-white p-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#FFFF00] placeholder-gray-500"
                        />
                    </form>

                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`text-xl font-black uppercase block py-2 border-b transition-colors ${isWhiteHeaderRoute
                                ? 'text-black border-black/10 hover:text-yellow-600'
                                : 'text-white border-white/5 hover:text-[#FFFF00]'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}