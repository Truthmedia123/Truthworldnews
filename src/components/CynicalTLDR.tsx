import React from 'react';

export default function CynicalTLDR({ summary, absurdityScore }: { summary: string; absurdityScore?: string }) {
  if (!summary) return null;

  return (
    <div className="border-4 border-[#FFFF00] bg-black text-white p-6 my-8 relative mt-12">
      <div className="absolute top-[-18px] left-4 bg-[#FFFF00] text-black font-inter font-black uppercase px-3 py-1 text-sm tracking-wider flex items-center gap-2">
        TL;DR (If you have 5 seconds)
      </div>

      <div className="flex flex-col justify-between h-full min-h-[80px]">
        <p className="text-sm font-serif leading-relaxed mt-2 text-gray-200">
          {summary}
        </p>
        <div className="flex justify-end mt-auto pt-3">
          <div className="bg-red-600 text-white font-inter font-black uppercase px-3 py-1 text-xs border border-white/20 tracking-wider">
            ABSURDITY RATING: {absurdityScore || '10/10'}
          </div>
        </div>
      </div>
    </div>
  );
}
