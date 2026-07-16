/**
 * src/app/search/page.tsx
 *
 * Search page. Client-side component that calls /api/search (Meilisearch proxy).
 *
 * Replaces the Supabase ilike search with Meilisearch full-text + highlighting.
 */

'use client';

import { useState, useEffect, useCallback, Suspense, type FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ArrowRight } from 'lucide-react';

interface SearchHit {
  slug: string;
  title: string;
  tldr_summary?: string;
  content?: string;
  excerpt?: string;
  primary_tag?: string;
  published_at?: string;
  _formatted?: {
    title: string;
    tldr_summary?: string;
    content?: string;
  };
}

interface SearchResponse {
  hits: SearchHit[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setHits([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=30`);
      const data: SearchResponse = await res.json();
      if (data.error) {
        setError(data.error);
        setHits([]);
        setTotal(0);
      } else {
        setHits(data.hits);
        setTotal(data.total);
      }
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setHits([]);
      setTotal(0);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, []);

  // Run on mount if q= in URL
  useEffect(() => {
    const q = searchParams.get('q') || '';
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  }, [searchParams, runSearch]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    runSearch(query);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black mb-6 uppercase tracking-tighter">
          Search Truth World News
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles..."
            autoFocus
            className="flex-1 px-4 py-3 bg-gray-100 border-2 border-black text-black font-bold focus:outline-none focus:border-[#FFFF00]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#FFFF00] hover:bg-black hover:text-[#FFFF00] border-2 border-black font-black flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? '...' : 'SEARCH'}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border-2 border-red-600 p-4 mb-6 font-bold text-red-700">
            Search is temporarily unavailable: {error}
            <p className="text-sm mt-2 font-normal text-red-600">
              Try again in a moment, or browse by <Link href="/category/news" className="underline">latest news</Link>.
            </p>
          </div>
        )}

        {hasSearched && !loading && hits.length === 0 && !error && (
          <p className="text-gray-500 font-bold uppercase tracking-wider">
            No results for &quot;{query}&quot;. The truth may be out there, but it&apos;s not here.
          </p>
        )}

        {hits.length > 0 && (
          <>
            <p className="text-sm text-gray-500 font-bold uppercase mb-4">
              {total} result{total === 1 ? '' : 's'} for &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hits.map((hit) => (
                <Link
                  key={hit.slug}
                  href={`/article/${hit.slug}`}
                  className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                >
                  <div className="p-4 flex flex-col flex-1">
                    {hit.primary_tag && (
                      <span className="text-red-600 text-xs font-black uppercase tracking-wider mb-2">
                        {hit.primary_tag}
                      </span>
                    )}
                    <h2
                      className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-red-600 transition mb-2"
                      dangerouslySetInnerHTML={{ __html: hit._formatted?.title || hit.title }}
                    />
                    {(hit._formatted?.tldr_summary || hit.tldr_summary) && (
                      <p
                        className="text-gray-600 text-sm line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: hit._formatted?.tldr_summary || hit.tldr_summary || '',
                        }}
                      />
                    )}
                    {hit.published_at && (
                      <div className="mt-auto pt-2 border-t border-gray-200 text-xs font-bold text-gray-500 uppercase">
                        {new Date(hit.published_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white text-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black border-t-[#FFFF00] animate-spin rounded-full mx-auto mb-4" />
            <p className="font-black uppercase">Loading search...</p>
          </div>
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
