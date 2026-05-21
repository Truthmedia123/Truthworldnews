'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`border-b-8 border-black p-4 bg-white flex justify-between items-center sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? 'shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : ''
                    }`}
            >
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#FFFF00] border-2 border-black"></div>
                    <h1 className="text-2xl font-inter font-black uppercase tracking-tighter hover:text-red-600 transition-colors">
                        TruthWorld<span className="text-[#FFFF00] px-1 bg-black">News</span>
                    </h1>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 font-inter font-bold uppercase text-sm">
                    {!isSearchOpen && (
                        <>
                            <Link href="/" className="hover:text-red-600 transition-colors">LATEST</Link>
                            <Link href="/" className="hover:text-red-600 transition-colors">TRENDING</Link>
                            <Link href="/" className="hover:text-red-600 transition-colors">TECH</Link>
                            <Link href="/" className="hover:text-red-600 transition-colors">POLITICS</Link>
                            <Link href="/quizzes" className="hover:text-red-600 transition-colors">QUIZZES</Link>
                            <Link href="/submit-tip" className="bg-[#FFFF00] text-black border-2 border-black font-black px-4 py-2 hover:bg-black hover:text-[#FFFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                                SUBMIT A TIP
                            </Link>
                        </>
                    )}
                    {isSearchOpen && (
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            className="border-b-2 border-black bg-transparent outline-none uppercase font-bold text-sm px-2 w-32 md:w-48 transition-all"
                            autoFocus
                        />
                    )}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-1 hover:text-red-600 transition-colors"
                        aria-label="Search"
                    >
                        <Search size={22} />
                    </button>
                </nav>

                {/* Mobile Actions */}
                <div className="flex items-center gap-2 md:hidden">
                    {isSearchOpen && (
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            className="border-b-2 border-black bg-transparent outline-none uppercase font-bold text-sm px-2 w-28 transition-all"
                            autoFocus
                        />
                    )}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 hover:text-red-600 transition-colors"
                        aria-label="Search"
                    >
                        <Search size={24} />
                    </button>
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={28} />
                    </button>
                </div>
            </header>

            {/* Full-Screen Overlay Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b-4 border-[#FFFF00]">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                            <div className="w-6 h-6 bg-[#FFFF00] border-2 border-black"></div>
                            <h1 className="text-2xl font-inter font-black uppercase tracking-tighter text-white">
                                TruthWorld<span className="text-[#FFFF00] px-1 bg-white text-black">News</span>
                            </h1>
                        </Link>
                        <button
                            onClick={() => setMenuOpen(false)}
                            className="p-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <nav className="flex flex-col items-center justify-center flex-grow gap-4">
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-inter font-black uppercase text-white hover:text-[#FFFF00] transition-colors tracking-tighter"
                        >
                            LATEST
                        </Link>
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-inter font-black uppercase text-white hover:text-[#FFFF00] transition-colors tracking-tighter"
                        >
                            TRENDING
                        </Link>
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-inter font-black uppercase text-white hover:text-[#FFFF00] transition-colors tracking-tighter"
                        >
                            TECH
                        </Link>
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-inter font-black uppercase text-white hover:text-[#FFFF00] transition-colors tracking-tighter"
                        >
                            POLITICS
                        </Link>
                        <Link
                            href="/quizzes"
                            onClick={() => setMenuOpen(false)}
                            className="text-2xl font-inter font-black uppercase text-[#FFFF00] hover:text-white transition-colors tracking-tighter bg-black px-4 py-2 border-2 border-[#FFFF00]"
                        >
                            QUIZZES
                        </Link>
                    </nav>

                    <div className="p-6 border-t-4 border-zinc-800 flex justify-center">
                        <Link
                            href="/submit-tip"
                            onClick={() => setMenuOpen(false)}
                            className="bg-[#FFFF00] text-black border-2 border-[#FFFF00] font-inter font-black uppercase px-8 py-4 text-xl hover:bg-black hover:text-[#FFFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        >
                            Submit A Tip
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}