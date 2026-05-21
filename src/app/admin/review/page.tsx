'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Edit3, Eye, Shield } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    content: string;
    status: string;
    reviewed_by: string | null;
    created_at: string;
}

export default function AdminReviewPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        const { data } = await supabase
            .from('posts')
            .select('id, title, content, status, reviewed_by, created_at')
            .order('created_at', { ascending: false });
        setPosts(data || []);
        setLoading(false);
    }

    async function approvePost(post: Post) {
        const { error } = await supabase
            .from('posts')
            .update({
                status: 'published',
                reviewed_by: 'Zane Edge',
                reviewed_at: new Date().toISOString(),
                is_published: true,
            })
            .eq('id', post.id);

        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage(`"${post.title}" approved and published.`);
            fetchPosts();
        }
    }

    async function saveEdit(postId: string) {
        const { error } = await supabase
            .from('posts')
            .update({ content: editContent })
            .eq('id', postId);

        if (error) {
            setMessage('Error saving: ' + error.message);
        } else {
            setMessage('Content updated.');
            setEditingId(null);
            fetchPosts();
        }
    }

    const drafts = posts.filter((p) => p.status === 'draft');
    const reviewed = posts.filter((p) => p.status === 'reviewed' || p.status === 'published');

    return (
        <main className="max-w-6xl mx-auto px-6 py-16 min-h-screen">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-5xl md:text-7xl font-inter font-black uppercase tracking-tighter">Review Desk</h1>
                    <p className="text-gray-500 mt-2 font-bold">Human editor review — AdSense compliance</p>
                </div>
                <Shield size={40} className="text-[#FFFF00]" />
            </div>

            {message && (
                <div className="bg-[#FFFF00] border-4 border-black p-4 mb-8 font-inter font-black uppercase text-sm">
                    {message}
                    <button onClick={() => setMessage('')} className="ml-4 underline">Dismiss</button>
                </div>
            )}

            {loading ? (
                <p className="text-gray-400">Loading posts...</p>
            ) : (
                <>
                    {/* Drafts — Needs Review */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-inter font-black uppercase border-b-4 border-red-600 pb-2 mb-6 flex items-center gap-2">
                            <Edit3 size={20} className="text-red-600" />
                            Needs Review ({drafts.length})
                        </h2>

                        {drafts.length === 0 ? (
                            <p className="text-gray-400 italic">All clear! No drafts waiting for review.</p>
                        ) : (
                            <div className="space-y-6">
                                {drafts.map((post) => (
                                    <div key={post.id} className="border-4 border-black bg-white p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-inter font-black uppercase">{post.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Created: {new Date(post.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="bg-red-600 text-white font-inter font-black uppercase text-xs px-3 py-1 border-2 border-black">
                                                Draft
                                            </span>
                                        </div>

                                        {editingId === post.id ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={8}
                                                    className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors resize-y"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveEdit(post.id)}
                                                        className="px-4 py-2 bg-[#FFFF00] text-black font-inter font-black uppercase text-sm border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-all"
                                                    >
                                                        Save Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="px-4 py-2 bg-gray-200 text-black font-inter font-black uppercase text-sm border-2 border-black hover:bg-gray-300 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-sm text-gray-600 line-clamp-3 font-serif">
                                                    {post.content?.substring(0, 300)}...
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(post.id);
                                                            setEditContent(post.content || '');
                                                        }}
                                                        className="px-4 py-2 bg-white text-black font-inter font-black uppercase text-sm border-2 border-black hover:border-[#FFFF00] transition-all flex items-center gap-1"
                                                    >
                                                        <Edit3 size={14} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => approvePost(post)}
                                                        className="px-4 py-2 bg-green-500 text-black font-inter font-black uppercase text-sm border-2 border-black hover:bg-green-400 transition-all flex items-center gap-1"
                                                    >
                                                        <CheckCircle size={14} /> Approve & Publish
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Published / Reviewed */}
                    <section>
                        <h2 className="text-2xl font-inter font-black uppercase border-b-4 border-green-500 pb-2 mb-6 flex items-center gap-2">
                            <Eye size={20} className="text-green-500" />
                            Published ({reviewed.length})
                        </h2>

                        {reviewed.length === 0 ? (
                            <p className="text-gray-400 italic">No published articles yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {reviewed.map((post) => (
                                    <div key={post.id} className="border-2 border-black bg-gray-50 p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-inter font-bold text-sm">{post.title}</h4>
                                            <p className="text-xs text-gray-500">
                                                Reviewed by: {post.reviewed_by || 'Unknown'} • {new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="bg-green-500 text-black font-inter font-black uppercase text-xs px-3 py-1 border-2 border-black">
                                            Published
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}