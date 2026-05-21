'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type ReactionType = 'LOL' | 'OMFG' | 'TRASH' | 'WTF' | 'LEGEND';
const REACTION_TYPES: ReactionType[] = ['LOL', 'OMFG', 'TRASH', 'WTF', 'LEGEND'];

type ReactionCounts = Record<ReactionType, number>;

function spawnConfetti() {
  const colors = ['#FFFF00', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFA500'];
  for (let i = 0; i < 60; i++) {
    const particle = document.createElement('div');
    particle.className = 'fixed pointer-events-none z-[200]';
    particle.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      width: ${Math.random() * 10 + 6}px;
      height: ${Math.random() * 10 + 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation: confetti-fall ${Math.random() * 2 + 2}s ease-in forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3500);
  }
}

export default function Reactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<ReactionCounts>({
    LOL: 0, OMFG: 0, TRASH: 0, WTF: 0, LEGEND: 0
  });
  const [hasReacted, setHasReacted] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  // Fallback to randomized values for mock posts or if DB fails
  const isMockPost = postId.startsWith('mock-');

  useEffect(() => {
    const fetchReactions = async () => {
      if (isMockPost) {
        // Randomize some mock counts
        setCounts({
          LOL: Math.floor(Math.random() * 500) + 100,
          OMFG: Math.floor(Math.random() * 300) + 50,
          TRASH: Math.floor(Math.random() * 800) + 200,
          WTF: Math.floor(Math.random() * 1000) + 300,
          LEGEND: Math.floor(Math.random() * 100) + 10,
        });
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('reactions')
        .select('reaction_type');

      if (!error && data) {
        const fetchedCounts = { LOL: 0, OMFG: 0, TRASH: 0, WTF: 0, LEGEND: 0 };
        data.forEach(row => {
          if (fetchedCounts[row.reaction_type as ReactionType] !== undefined) {
            fetchedCounts[row.reaction_type as ReactionType]++;
          }
        });
        setCounts(fetchedCounts);
      }
    };

    fetchReactions();
  }, [postId, isMockPost]);

  const handleReact = useCallback(async (type: ReactionType) => {
    if (hasReacted) return;

    // Optimistic UI update
    setCounts(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
    setHasReacted(true);
    setShowResults(true);

    // Confetti for LEGEND vote
    if (type === 'LEGEND') {
      spawnConfetti();
    }

    if (!isMockPost) {
      // Async database save
      await supabase.from('reactions').insert([
        { post_id: postId, reaction_type: type }
      ]);
    }
  }, [hasReacted, isMockPost, postId]);

  const totalVotes = Object.values(counts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="py-4 mt-4 mb-6 flex flex-col items-center justify-center">
      <h3 className="text-lg md:text-xl font-inter font-black uppercase tracking-tighter mb-3 text-black text-center">
        HOW DOES THIS MAKE YOU FEEL?
      </h3>

      <div className="flex flex-wrap justify-center gap-1">
        {REACTION_TYPES.map((type) => {
          const EMOJI_MAP: Record<ReactionType, string> = {
            LOL: '😂',
            OMFG: '😱',
            TRASH: '🗑️',
            WTF: '🤯',
            LEGEND: '👑'
          };

          const percentage = totalVotes > 0 ? Math.round((counts[type] / totalVotes) * 100) : 0;

          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={hasReacted}
              className={`
                min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 border border-black
                font-inter font-black uppercase text-[10px]
                transition-all duration-300 transform relative overflow-hidden
                ${hasReacted
                  ? 'opacity-60 cursor-not-allowed bg-zinc-200 text-gray-500'
                  : 'hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFFF00] bg-white text-black cursor-pointer'
                }
              `}
            >
              <span className="text-[10px] font-bold text-red-600 tracking-widest">{counts[type]}</span>
              <span className="text-xl">{EMOJI_MAP[type]}</span>
              <span>{type}</span>
              {/* Animated result bar */}
              {showResults && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-[#FFFF00] transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
      {hasReacted && (
        <p className="mt-3 font-inter font-bold uppercase tracking-widest text-[10px] text-green-600 bg-green-100 px-2 py-1 border border-green-600 animate-bounce">
          YOUR REACTION HAS BEEN RECORDED
        </p>
      )}
    </div>
  );
}
