'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function AdminReviewPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/posts?status=draft')
      .then(r => r.json())
      .then(data => setDrafts(data.posts || []))
      .catch(err => console.error('Review fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (slug: string) => {
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    setDrafts(prev => prev.filter(p => p.slug !== slug));
  };

  const handleReject = async (slug: string) => {
    if (!confirm(`Reject and delete "${slug}"?`)) return;
    await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
    setDrafts(prev => prev.filter(p => p.slug !== slug));
  };

  if (loading) {
    return <div className="min-h-screen bg-white p-8 text-black">Loading review queue...</div>;
  }

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-black uppercase mb-6">Review Queue</h1>

      {drafts.length === 0 ? (
        <p className="text-gray-500">No drafts awaiting review. Pipeline is idle.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <article key={draft.slug} className="border-4 border-black p-4">
              <h2 className="text-xl font-black">{draft.title}</h2>
              <p className="text-xs text-gray-500 mb-3">/{draft.slug}</p>
              {draft.custom_excerpt && (
                <p className="text-gray-700 italic mb-3">"{draft.custom_excerpt}"</p>
              )}
              <div
                className="prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: draft.html || '' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(draft.slug)}
                  className="bg-[#FFFF00] border-2 border-black px-4 py-2 font-black uppercase text-xs"
                >
                  <CheckCircle className="inline w-4 h-4" /> Approve & Publish
                </button>
                <button
                  onClick={() => handleReject(draft.slug)}
                  className="bg-red-600 text-white border-2 border-black px-4 py-2 font-black uppercase text-xs"
                >
                  <XCircle className="inline w-4 h-4" /> Reject & Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
