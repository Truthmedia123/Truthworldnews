'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to fetch articles:', error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }

    fetchArticles();
  }, []);

  const headlines = posts.slice(0, 5).map(p => p.title);

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <Flame className="w-16 h-16 text-red-600 mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Truth World News</h1>
          <p className="text-xl text-gray-500">Loading articles...</p>
        </div>
      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <Flame className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Truth World News</h1>
          <p className="text-xl text-gray-500 mb-8">
            The cynical antidote to boring mainstream media.
          </p>
        </div>
      </main>
    );
  }

  const mainViral = posts[0];
  const secondaryViral = posts.slice(1, 4);
  const techGrid = posts.filter(p => p.category === 'AI' || p.category === 'Tech' || p.category === 'Weird Tech').slice(0, 4);
  const cryptoGrid = posts.filter(p => p.category === 'Crypto').slice(0, 4);
  const latestNews = posts.slice(3, 11);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* ── 2. Breaking News Ticker ────────────────────────────────── */}
      <BreakingNewsTicker headlines={headlines} />

      {/* ── 3. THE VIRAL FEED — Headlines Grid ──────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter text-black border-b-[6px] border-black pb-2 inline-block">
            THE VIRAL FEED
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Left 60% — Main Viral Card */}
          <div className="lg:w-[60%]">
            <Link
              href={`/article?id=${mainViral.id}`}
              className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
            >
              <div className="bg-zinc-900 w-full relative aspect-video min-h-[350px] md:min-h-[480px]">
                <img
                  src={mainViral.image_url || '/default-og.jpg'}
                  alt={mainViral.title}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                    <Flame size={14} className="fill-current" /> HOT
                  </span>
                  <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {mainViral.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 flex flex-col justify-end z-10">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-inter font-black text-white leading-tight mb-4 drop-shadow-md line-clamp-3">
                    {mainViral.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-bold uppercase">{mainViral.author_name || 'Zane Edge'}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right 40% — Secondary Viral Stack */}
          <div className="lg:w-[40%] flex flex-col gap-4">
            {secondaryViral.map((article) => (
              <Link
                key={article.id}
                href={`/article?id=${article.id}`}
                className="group flex gap-3 border-4 border-black hover:border-[#FFFF00] transition-colors p-0 overflow-hidden flex-1"
              >
                <div className="w-[40%] min-w-[120px] relative overflow-hidden">
                  <img
                    src={article.image_url || '/default-og.jpg'}
                    alt={article.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center py-3 pr-3 flex-1">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category || 'News'}</span>
                  <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-3 group-hover:underline">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tertiary Row — 4 small square cards */}
        {posts.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.slice(4, 8).map((article: any) => (
              <Link
                key={article.id}
                href={`/article?id=${article.id}`}
                className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                  <img
                    src={article.image_url || '/default-og.jpg'}
                    alt={article.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category || 'News'}</span>
                  <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 4A. TECH SECTION ────────────────────────────────────────── */}
      <section className="bg-gray-50 mt-10 py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
              TECH
            </h2>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
              MORE TECH <ArrowRight size={16} />
            </Link>
          </div>

          {techGrid.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left 50% — Top Story */}
              {techGrid[0] && (
                <div className="md:w-1/2">
                  <Link
                    href={`/article?id=${techGrid[0].id}`}
                    className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                  >
                    <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                      <img
                        src={techGrid[0].image_url || '/default-og.jpg'}
                        alt={techGrid[0].title}
                        className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {techGrid[0].category || 'Tech'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-l-4 border-[#FFFF00]">
                        <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                          {techGrid[0].title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Right 50% — 2×2 Grid */}
              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                {techGrid.slice(1, 5).map((article: any) => (
                  <Link
                    key={article.id}
                    href={`/article?id=${article.id}`}
                    className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                      <img
                        src={article.image_url || '/default-og.jpg'}
                        alt={article.title}
                        className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category || 'Tech'}</span>
                      <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-black bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-colors">
              MORE TECH <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4B. POLITICS SECTION (mirrored layout) ──────────────────── */}
      <section className="bg-white py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
              POLITICS
            </h2>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
              MORE POLITICS <ArrowRight size={16} />
            </Link>
          </div>

          {(() => {
            const politicsPosts = posts.filter((p: any) => p.category === 'Politics' || p.category === 'UK Politics' || p.category === 'World').slice(0, 5);
            if (politicsPosts.length === 0) return null;
            return (
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 grid grid-cols-2 gap-4 order-2 md:order-1">
                  {politicsPosts.slice(1, 5).map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/article?id=${article.id}`}
                      className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-gray-50"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                        <img
                          src={article.image_url || '/default-og.jpg'}
                          alt={article.title}
                          className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category || 'Politics'}</span>
                        <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="md:w-1/2 order-1 md:order-2">
                  <Link
                    href={`/article?id=${politicsPosts[0].id}`}
                    className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                  >
                    <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                      <img
                        src={politicsPosts[0].image_url || '/default-og.jpg'}
                        alt={politicsPosts[0].title}
                        className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {politicsPosts[0].category || 'Politics'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-r-4 border-[#FFFF00]">
                        <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                          {politicsPosts[0].title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })()}

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-black bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-colors">
              MORE POLITICS <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4C. QUIZZES & ENTERTAINMENT SECTION ─────────────────────── */}
      {(() => {
        const entertainmentPosts = posts.filter((p: any) => p.category === 'Entertainment' || p.category === 'Weird Tech').slice(0, 7);
        if (entertainmentPosts.length === 0) return null;
        const featured = entertainmentPosts[0];
        const grid = entertainmentPosts.slice(1, 7);
        return (
          <section className="bg-gray-50 py-10">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
                  ENTERTAINMENT
                </h2>
                <Link href="/quizzes" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
                  MORE QUIZZES <ArrowRight size={16} />
                </Link>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Link
                    href={`/article?id=${featured.id}`}
                    className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                  >
                    <div className="bg-zinc-900 w-full relative aspect-[4/5] min-h-[350px]">
                      <img
                        src={featured.image_url || '/default-og.jpg'}
                        alt={featured.title}
                        className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {featured.category || 'Entertainment'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10">
                        <h3 className="text-lg md:text-xl font-inter font-black text-white leading-tight drop-shadow-md line-clamp-3">
                          {featured.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {grid.map((article: any) => (
                    <Link
                      key={article.id}
                      href={`/article?id=${article.id}`}
                      className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                    >
                      <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                        <img
                          src={article.image_url || '/default-og.jpg'}
                          alt={article.title}
                          className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category || 'Entertainment'}</span>
                        <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── 5. MORE LATEST NEWS — 4-Column Card Grid ────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
          <h3 className="text-2xl md:text-3xl font-inter font-black uppercase tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-red-600" /> MORE LATEST NEWS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestNews.map((article: any) => (
            <Link
              key={article.id}
              href={`/article?id=${article.id}`}
              className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-200">
                <img
                  src={article.image_url || '/default-og.jpg'}
                  alt={article.title}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2">{article.category || 'News'}</span>
                <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:underline mb-3">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{article.author_name || 'Zane Edge'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 font-inter font-black uppercase text-base px-8 py-3 border-2 border-[#FFFF00] text-black bg-transparent hover:bg-[#FFFF00] transition-colors">
            LOAD MORE <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
