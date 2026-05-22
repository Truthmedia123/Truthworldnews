'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);
    
    setResults(data || []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black mb-6 uppercase tracking-tighter">Search Truth World News</h1>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-3 bg-gray-100 border-2 border-black text-black font-bold"
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-[#FFFF00] hover:bg-black hover:text-[#FFFF00] border-2 border-black font-black flex items-center gap-2 transition-colors"
          >
            <Search className="w-5 h-5" />
            SEARCH
          </button>
        </form>

        {loading && <p className="text-gray-500">Searching...</p>}

        {!loading && results.length === 0 && query && (
          <p className="text-gray-500">No results for &quot;{query}&quot;</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((post: any) => (
            <Link key={post.id} href={`/article/${post.id}`}>
              <article className="group cursor-pointer flex gap-4 border-4 border-black hover:border-[#FFFF00] transition-colors p-3">
                <img 
                  src={post.image_url || '/default-og.jpg'} 
                  alt={post.title}
                  className="w-32 h-24 object-cover border-2 border-black"
                />
                <div>
                  <span className="text-red-600 text-xs font-black uppercase">{post.category || 'News'}</span>
                  <h2 className="font-bold group-hover:text-red-600 transition line-clamp-2">{post.title}</h2>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
