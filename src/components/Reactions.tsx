'use client';

import React, { useState, useEffect, useCallback } from 'react';

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

interface ReactionsProps {
  articleId: string;
}

export default function Reactions({ articleId }: ReactionsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({
    LOL: 0, OMFG: 0, TRASH: 0, WTF: 0, LEGEND: 0,
  });
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?articleId=${encodeURIComponent(articleId)}`);
      if (!res.ok) return;
      const data = await res.json();
      const next: ReactionCounts = { LOL: 0, OMFG: 0, TRASH: 0, WTF: 0, LEGEND: 0 };
      for (const r of (data.counts || [])) {
        if (next.hasOwnProperty(r.reaction_type)) {
          next[r.reaction_type as ReactionType] = r.count;
        }
      }
      setCounts(next);
      if (data.userReactions) {
        setUserReactions(new Set(data.userReactions as ReactionType[]));
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const handleReact = async (type: ReactionType) => {
    if (submitting) return;
    setSubmitting(type);
    const wasReacted = userReactions.has(type);

    // Optimistic update
    setCounts(prev => ({
      ...prev,
      [type]: wasReacted ? Math.max(0, prev[type] - 1) : prev[type] + 1,
    }));
    setUserReactions(prev => {
      const next = new Set(prev);
      if (wasReacted) next.delete(type);
      else next.add(type);
      return next;
    });

    if (!wasReacted) spawnConfetti();

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, reactionType: type }),
      });
    } catch (err) {
      // Revert on failure
      setCounts(prev => ({
        ...prev,
        [type]: wasReacted ? prev[type] + 1 : Math.max(0, prev[type] - 1),
      }));
      setUserReactions(prev => {
        const next = new Set(prev);
        if (wasReacted) next.add(type);
        else next.delete(type);
        return next;
      });
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="border-4 border-black p-4 bg-white">
        <div className="text-black font-black uppercase text-sm mb-3">Loading reactions...</div>
      </div>
    );
  }

  return (
    <div className="border-4 border-black p-4 bg-white">
      <div className="text-black font-black uppercase text-sm mb-3">React to this</div>
      <div className="grid grid-cols-5 gap-2">
        {REACTION_TYPES.map((type) => {
          const isReacted = userReactions.has(type);
          const count = counts[type];
          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={submitting !== null}
              className={`
                flex flex-col items-center justify-center p-3 border-2 border-black
                font-black uppercase text-xs transition-all
                ${isReacted
                  ? 'bg-[#FFFF00] text-black scale-105'
                  : 'bg-white text-black hover:bg-[#FFFF00] hover:scale-105'}
                ${submitting === type ? 'animate-pulse' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-pressed={isReacted}
              aria-label={`React ${type}`}
            >
              <span className="text-lg leading-none">{type}</span>
              <span className="text-sm mt-1">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
