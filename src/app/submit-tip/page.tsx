'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SubmitTipPage() {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch('/api/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, story }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }
      setStatus('success');
      setTitle('');
      setStory('');
    } catch (err: any) {
      console.error('Tip submission error:', err);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-2 text-red-600">Submit a Tip</h1>
        <p className="text-gray-600 mb-8">
          Got a story we should know about? Anonymous tips welcome. We protect our sources.
        </p>

        {status === 'success' && (
          <div className="bg-[#FFFF00] border-4 border-black p-4 mb-6">
            <p className="font-black uppercase">Tip received. Thanks.</p>
            <p className="text-sm mt-1">If we publish, you'll see it on the front page.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-100 border-4 border-red-600 p-4 mb-6">
            <p className="font-black uppercase">Something went wrong.</p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-black uppercase">Headline (what's the story?)</span>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="block w-full mt-1 border-2 border-black p-3"
              placeholder="e.g., Leaked docs show..."
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase">The full story</span>
            <textarea
              required
              minLength={50}
              maxLength={5000}
              rows={8}
              value={story}
              onChange={e => setStory(e.target.value)}
              className="block w-full mt-1 border-2 border-black p-3"
              placeholder="Tell us what you know. Links, dates, names, whatever you've got."
            />
          </label>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Anonymous. No email required. No tracking.
            </p>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-[#FFFF00] border-4 border-black px-6 py-3 font-black uppercase disabled:opacity-50"
            >
              {status === 'submitting' ? 'Sending...' : 'Send Tip'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-sm">
          <Link href="/" className="text-red-600 font-black uppercase">← Back to homepage</Link>
        </div>
      </div>
    </main>
  );
}
