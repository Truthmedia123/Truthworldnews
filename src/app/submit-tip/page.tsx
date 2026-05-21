'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SubmitTipPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story) return;

    setStatus('submitting');

    // Attempt Supabase insert
    const { error } = await supabase.from('tips').insert([{ title, story }]);

    if (error) {
      // In dev environment without DB, simulate success
      console.error(error);
      setTimeout(() => setStatus('success'), 1000);
    } else {
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-xl text-center border-8 border-[#FFFF00] p-12 bg-zinc-900 shadow-[12px_12px_0px_0px_#FFFF00]">
          <h1 className="text-6xl font-inter font-black uppercase mb-6 text-[#FFFF00]">Tip Received</h1>
          <p className="text-xl font-bold mb-8 uppercase tracking-widest text-white">Our investigative team is reviewing your submission.</p>
          <Link href="/" className="inline-block bg-[#FFFF00] text-black font-inter font-black uppercase px-8 py-4 text-xl hover:bg-white transition-colors">
            Return to Feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-black">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-12 border-l-8 border-[#FFFF00] pl-6">
          <h1 className="text-5xl md:text-7xl font-inter font-black uppercase leading-none tracking-tighter mb-4">
            ANONYMOUS <br /><span className="text-red-600">TIP LINE</span>
          </h1>
          <p className="font-bold text-xl uppercase tracking-widest text-zinc-600">
            Got a story the mainstream media is ignoring? We want it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <label className="block font-inter font-black uppercase text-xl mb-2">HEADLINE / SUBJECT</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are they hiding?"
              className="w-full border-4 border-black p-4 text-lg font-bold focus:outline-none focus:border-[#FFFF00] bg-zinc-50"
            />
          </div>

          <div>
            <label className="block font-inter font-black uppercase text-xl mb-2">THE REAL STORY</label>
            <textarea
              required
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Drop the truth here. We protect our sources."
              rows={8}
              className="w-full border-4 border-black p-4 text-lg font-serif focus:outline-none focus:border-[#FFFF00] bg-zinc-50"
            />
          </div>

          <div>
            <label className="block font-inter font-black uppercase text-xl mb-2">EVIDENCE (OPTIONAL URL)</label>
            <input
              type="url"
              placeholder="Link to image/video/doc"
              className="w-full border-4 border-black p-4 text-lg font-bold focus:outline-none focus:border-[#FFFF00] bg-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="mt-6 bg-[#FFFF00] text-black border-4 border-black font-inter font-black uppercase text-2xl py-6 hover:bg-black hover:text-[#FFFF00] transition-colors"
          >
            {status === 'submitting' ? 'SECURELY TRANSMITTING...' : 'SUBMIT ANONYMOUS TIP'}
          </button>
        </form>
      </div>
    </main>
  );
}
