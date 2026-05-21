'use client';

import React from 'react';

export default function BreakingNewsTicker({ headlines }: { headlines: string[] }) {
  if (!headlines || headlines.length === 0) return null;

  return (
    <div className="bg-black text-white font-inter font-black uppercase text-lg flex overflow-hidden whitespace-nowrap items-stretch h-12 border-l-4 border-[#FFFF00] border-b-4 border-black">
      <div className="bg-[#FFFF00] text-black px-4 flex items-center z-10 font-black uppercase relative shrink-0 text-sm tracking-wider">
        BREAKING
        <div className="absolute top-0 right-[-12px] w-0 h-0 border-t-[24px] border-b-[24px] border-l-[12px] border-t-transparent border-b-transparent border-l-[#FFFF00]"></div>
      </div>
      <div className="relative flex overflow-hidden items-center flex-grow group">
        <div className="animate-ticker flex items-center space-x-12 absolute whitespace-nowrap group-hover:[animation-play-state:paused]">
          {headlines.map((headline, index) => (
            <span key={index} className="inline-block shrink-0 text-white">{headline}</span>
          ))}
          {/* Duplicate for seamless scrolling */}
          {headlines.map((headline, index) => (
            <span key={`dup-${index}`} className="inline-block shrink-0 text-white">{headline}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
