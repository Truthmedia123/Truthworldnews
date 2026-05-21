'use client';

import React from 'react';
import Link from 'next/link';
import { X, MessageCircle, Share2, Link as LinkIcon, ArrowRight } from 'lucide-react';

export default function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-[#FFFF00] border-t-4 border-black z-50 py-3 flex justify-between items-center px-6 lg:hidden shadow-[0_-4px_0px_0px_rgba(0,0,0,0.1)]">
            {/* Left: Sharing Icons */}
            <div className="flex items-center gap-4">
                <button className="flex flex-col items-center gap-1 text-black hover:text-blue-500 transition-colors" aria-label="Share on X">
                    <X size={22} />
                    <span className="text-[9px] font-black uppercase">Post</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-black hover:text-green-600 transition-colors" aria-label="Share on WhatsApp">
                    <MessageCircle size={22} />
                    <span className="text-[9px] font-black uppercase">WhatsApp</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-black hover:text-blue-800 transition-colors" aria-label="Copy link">
                    <LinkIcon size={22} />
                    <span className="text-[9px] font-black uppercase">Copy Link</span>
                </button>
            </div>

            {/* Right: Next Article */}
            <Link
                href="/article/mock-2"
                className="flex items-center gap-2 bg-black text-[#FFFF00] border-2 border-black font-black uppercase px-4 py-2 text-sm hover:bg-white hover:text-black transition-colors shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
                <span>Next Article</span>
                <ArrowRight size={18} />
            </Link>
        </div>
    );
}