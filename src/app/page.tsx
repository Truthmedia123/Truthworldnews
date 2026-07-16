/**
 * src/app/page.tsx
 *
 * Homepage. Server component, ISR 60s.
 *
 * Replaces the client-side Supabase fetch with Ghost Content API.
 * Preserves 100% of the repo's brutalist UI (ViralGrid, Tech/Politics/
 * Entertainment sections, latest-news 4-column grid, load-more button).
 *
 * Fail-soft: if Ghost is down, render with empty arrays + a small notice.
 */

import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';
import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import { getPosts, getBreakingPosts, getGhostPublicUrl } from '@/lib/ghost';
import { getTldr } from '@/lib/custom-fields';
import { imgproxyPresets } from '@/lib/imgproxy-loader';
import Image from 'next/image';

export const revalidate = 60; // ISR: 60s

// ---------------------------------------------------------------------------
// Helper: build article URL (slug-based, not ?id=)
// ---------------------------------------------------------------------------

function articleUrl(slug: string): string {
  return `/article/${slug}`;
}

// ---------------------------------------------------------------------------
// Helper: feature image with imgproxy
// ---------------------------------------------------------------------------

function featuredImage(post: { feature_image: string | null; title: string; slug: string }) {
  if (!post.feature_image) return '/default-og.jpg';
  return post.feature_image;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  // Parallel fetch for the sections we need
  const [recentRes, breakingRes] = await Promise.all([
    getPosts({ limit: 30 }),
    getBreakingPosts(5),
  ]);

  const posts = recentRes.posts;
  const headlines = (breakingRes.length > 0 ? breakingRes : posts.slice(0, 5))
    .map(p => p.title);

  if (posts.length === 0) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="max-w-[1280px] mx-auto px-4 py-20 text-center">
          <Flame className="w-16 h-16 text-red-600 mx-auto mb-6" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Truth World News</h1>
          <p className="text-xl text-gray-500 mb-8">
            The cynical antidote to boring mainstream media.
          </p>
          <p className="text-gray-400">
            Articles will appear here once the pipeline runs. Check back shortly.
          </p>
        </div>
      </main>
    );
  }

  const mainViral = posts[0];
  const secondaryViral = posts.slice(1, 4);
  const techGrid = posts.filter(p =>
    p.primary_tag?.slug === 'ai' ||
    p.primary_tag?.name === 'AI' ||
    p.primary_tag?.name === 'Tech' ||
    p.primary_tag?.name === 'Weird Tech'
  ).slice(0, 4);
  const politicsPosts = posts.filter(p =>
    p.primary_tag?.name === 'Politics' ||
    p.primary_tag?.name === 'UK Politics' ||
    p.primary_tag?.name === 'World' ||
    p.primary_tag?.name === 'WORLD'
  ).slice(0, 5);
  const entertainmentPosts = posts.filter(p =>
    p.primary_tag?.name === 'Entertainment' ||
    p.primary_tag?.name === 'Weird Tech'
  ).slice(0, 7);
  const latestNews = posts.slice(3, 11);

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Breaking News Ticker */}
      {headlines.length > 0 && <BreakingNewsTicker headlines={headlines} />}

      {/* THE VIRAL FEED */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter text-black border-b-[6px] border-black pb-2 inline-block">
            THE VIRAL FEED
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Main Viral Card */}
          <div className="lg:w-[60%]">
            <Link
              href={articleUrl(mainViral.slug)}
              className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
            >
              <div className="bg-zinc-900 w-full relative aspect-video min-h-[350px] md:min-h-[480px]">
                <Image
                  src={featuredImage(mainViral)}
                  alt={mainViral.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  priority
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                    <Flame size={14} className="fill-current" /> HOT
                  </span>
                  {mainViral.primary_tag && (
                    <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {mainViral.primary_tag.name}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 flex flex-col justify-end z-10">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-inter font-black text-white leading-tight mb-4 drop-shadow-md line-clamp-3">
                    {mainViral.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-bold uppercase">
                      {mainViral.primary_author?.name || 'Zane Edge'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Viral Stack */}
          <div className="lg:w-[40%] flex flex-col gap-4">
            {secondaryViral.map((article) => (
              <Link
                key={article.slug}
                href={articleUrl(article.slug)}
                className="group flex gap-3 border-4 border-black hover:border-[#FFFF00] transition-colors p-0 overflow-hidden flex-1"
              >
                <div className="w-[40%] min-w-[120px] relative overflow-hidden">
                  <Image
                    src={featuredImage(article)}
                    alt={article.title}
                    fill
                    sizes="40vw"
                    className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center py-3 pr-3 flex-1">
                  {article.primary_tag && (
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">
                      {article.primary_tag.name}
                    </span>
                  )}
                  <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-3 group-hover:underline">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tertiary Row */}
        {posts.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.slice(4, 8).map((article) => (
              <Link
                key={article.slug}
                href={articleUrl(article.slug)}
                className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                  <Image
                    src={featuredImage(article)}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 flex flex-col flex-1">
                  {article.primary_tag && (
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">
                      {article.primary_tag.name}
                    </span>
                  )}
                  <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">
                    {article.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TECH SECTION */}
      {techGrid.length > 0 && (
        <section className="bg-gray-50 mt-10 py-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
                TECH
              </h2>
              <Link href="/category/ai" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
                MORE TECH <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                {techGrid[0] && (
                  <Link
                    href={articleUrl(techGrid[0].slug)}
                    className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                  >
                    <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                      <Image
                        src={featuredImage(techGrid[0])}
                        alt={techGrid[0].title}
                        fill
                        sizes="50vw"
                        className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      />
                      {techGrid[0].primary_tag && (
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {techGrid[0].primary_tag.name}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-l-4 border-[#FFFF00]">
                        <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                          {techGrid[0].title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="md:w-1/2 grid grid-cols-2 gap-4">
                {techGrid.slice(1, 5).map((article) => (
                  <Link
                    key={article.slug}
                    href={articleUrl(article.slug)}
                    className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                      <Image
                        src={featuredImage(article)}
                        alt={article.title}
                        fill
                        sizes="25vw"
                        className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      {article.primary_tag && (
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">
                          {article.primary_tag.name}
                        </span>
                      )}
                      <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* POLITICS SECTION (only if there are politics posts) */}
      {politicsPosts.length > 0 && (
        <section className="bg-white py-10">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
                POLITICS
              </h2>
              <Link href="/category/world" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
                MORE POLITICS <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 grid grid-cols-2 gap-4 order-2 md:order-1">
                {politicsPosts.slice(1, 5).map((article) => (
                  <Link
                    key={article.slug}
                    href={articleUrl(article.slug)}
                    className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-gray-50"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                      <Image
                        src={featuredImage(article)}
                        alt={article.title}
                        fill
                        sizes="25vw"
                        className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      {article.primary_tag && (
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">
                          {article.primary_tag.name}
                        </span>
                      )}
                      <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <Link
                  href={articleUrl(politicsPosts[0].slug)}
                  className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                >
                  <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                    <Image
                      src={featuredImage(politicsPosts[0])}
                      alt={politicsPosts[0].title}
                      fill
                      sizes="50vw"
                      className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    {politicsPosts[0].primary_tag && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {politicsPosts[0].primary_tag.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-r-4 border-[#FFFF00]">
                      <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                        {politicsPosts[0].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ENTERTAINMENT SECTION */}
      {entertainmentPosts.length > 0 && (
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
                  href={articleUrl(entertainmentPosts[0].slug)}
                  className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
                >
                  <div className="bg-zinc-900 w-full relative aspect-[4/5] min-h-[350px]">
                    <Image
                      src={featuredImage(entertainmentPosts[0])}
                      alt={entertainmentPosts[0].title}
                      fill
                      sizes="33vw"
                      className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    {entertainmentPosts[0].primary_tag && (
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {entertainmentPosts[0].primary_tag.name}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10">
                      <h3 className="text-lg md:text-xl font-inter font-black text-white leading-tight drop-shadow-md line-clamp-3">
                        {entertainmentPosts[0].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {entertainmentPosts.slice(1, 7).map((article) => (
                  <Link
                    key={article.slug}
                    href={articleUrl(article.slug)}
                    className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                      <Image
                        src={featuredImage(article)}
                        alt={article.title}
                        fill
                        sizes="22vw"
                        className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      {article.primary_tag && (
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">
                          {article.primary_tag.name}
                        </span>
                      )}
                      <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MORE LATEST NEWS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
          <h3 className="text-2xl md:text-3xl font-inter font-black uppercase tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-red-600" /> MORE LATEST NEWS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestNews.map((article) => (
            <Link
              key={article.slug}
              href={articleUrl(article.slug)}
              className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-200">
                <Image
                  src={featuredImage(article)}
                  alt={article.title}
                  fill
                  sizes="25vw"
                  className="absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                {article.primary_tag && (
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2">
                    {article.primary_tag.name}
                  </span>
                )}
                <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:underline mb-3">
                  {article.title}
                </h3>
                {getTldr(article) && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{getTldr(article)!}</p>
                )}
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    {article.primary_author?.name || 'Zane Edge'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/category/news"
            className="inline-flex items-center gap-2 font-inter font-black uppercase text-base px-8 py-3 border-2 border-[#FFFF00] text-black bg-transparent hover:bg-[#FFFF00] transition-colors"
          >
            LOAD MORE <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
