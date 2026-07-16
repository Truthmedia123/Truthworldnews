'use client';

import { useEffect, useState } from 'react';
import { Trash2, Edit, CheckCircle, XCircle, Upload } from 'lucide-react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/posts').then(r => r.json()),
      fetch('/api/admin/tips').then(r => r.json()),
    ])
      .then(([postsData, tipsData]) => {
        setPosts(postsData.posts || []);
        setTips(tipsData.tips || []);
      })
      .catch(err => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async (slug: string) => {
    await fetch(`/api/admin/posts/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    setPosts(prev => prev.map(p => p.slug === slug ? { ...p, status: 'published' } : p));
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.slug !== slug));
  };

  if (loading) {
    return <div className="min-h-screen bg-white p-8 text-black">Loading admin dashboard...</div>;
  }

  return (
    <main className="min-h-screen bg-white text-black p-8">
      <h1 className="text-3xl font-black uppercase mb-6">Admin Dashboard</h1>

      <section className="mb-12">
        <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Drafts & Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet. The pipeline is running.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <div key={post.slug} className="border-2 border-black p-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{post.title}</h3>
                  <p className="text-xs text-gray-500">/{post.slug} • {post.status}</p>
                </div>
                <div className="flex gap-2">
                  {post.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(post.slug)}
                      className="bg-[#FFFF00] border-2 border-black px-3 py-1 font-black uppercase text-xs"
                    >
                      <CheckCircle className="inline w-4 h-4" /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="bg-red-600 text-white border-2 border-black px-3 py-1 font-black uppercase text-xs"
                  >
                    <Trash2 className="inline w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2">Anonymous Tips</h2>
        {tips.length === 0 ? (
          <p className="text-gray-500">No tips submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {tips.map((tip) => (
              <div key={tip.id} className="border-2 border-black p-3">
                <h3 className="font-bold">{tip.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{tip.story}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(tip.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
