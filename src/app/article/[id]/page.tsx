import React from 'react';
import CynicalTLDR from '@/components/CynicalTLDR';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSeoMeta } from '@/lib/seo';
import Reactions from '@/components/Reactions';
import BottomNav from '@/components/BottomNav';
import ReviewedByBadge from '@/components/ReviewedByBadge';
import GiscusComments from '@/components/GiscusComments';
import { X, Share2, MessageCircle, Link as LinkIcon } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('is_published', true)
    .eq('status', 'published')
    .limit(100);

  const params = (posts || []).map((post) => ({
    id: post.id,
  }));

  // Static export requires at least one param; fallback for empty DB
  if (params.length === 0) {
    return [{ id: 'placeholder' }];
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('title, tldr_summary, image_url, created_at, updated_at, category')
    .eq('id', resolvedParams.id)
    .eq('is_published', true)
    .eq('status', 'published')
    .single();

  if (!post) {
    return generateSeoMeta({ title: 'Article Not Found' });
  }

  return generateSeoMeta({
    title: post.title,
    description: post.tldr_summary || undefined,
    image: post.image_url || undefined,
    url: `/article/${resolvedParams.id}/`,
    type: 'article',
    publishedAt: post.created_at,
    modifiedAt: post.updated_at || post.created_at,
    author: 'Zane Edge',
  });
}

export default async function ArticlePage({ params }: Props) {
  const resolvedParams = await params;
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_published', true)
    .eq('status', 'published')
    .single();

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    image: [
      post.image_url || 'https://truthworldnews.com/default-og.jpg'
    ],
    datePublished: new Date(post.created_at).toISOString(),
    dateModified: new Date(post.updated_at || post.created_at).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Zane Edge',
      url: 'https://truthworldnews.com/about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Truth World News',
      logo: {
        '@type': 'ImageObject',
        url: 'https://truthworldnews.com/default-og.jpg'
      }
    },
    description: post.tldr_summary || '',
    articleBody: post.content || '',
  };

  return (
    <main className="min-h-screen bg-white text-black pb-24 lg:pb-0">
      {/* Sticky Social Share Bar - Desktop */}
      <div className="hidden lg:flex fixed left-8 top-1/3 flex-col gap-4 z-50">
        <button className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-blue-400 hover:text-black hover:border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-full">
          <X size={20} />
        </button>
        <button className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-orange-500 hover:text-black hover:border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-full">
          <Share2 size={20} />
        </button>
        <button className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-green-500 hover:text-black hover:border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-full">
          <MessageCircle size={20} />
        </button>
        <button className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black hover:bg-blue-600 hover:text-white hover:border-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 rounded-full">
          <LinkIcon size={20} />
        </button>
      </div>

      <BottomNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pb-16 relative">
        {/* Floating Trust Badge */}
        <div className="hidden xl:flex fixed right-8 top-1/3 flex-col items-center justify-center border-4 border-black bg-[#FFFF00] p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-30 transform rotate-2 w-32 text-center">
          <span className="text-4xl mb-2">👁️</span>
          <span className="font-inter font-black uppercase text-sm leading-tight text-black">
            Truth<br />Verified
          </span>
        </div>

        {/* Massive Hero Image */}
        {post.image_url && (
          <div className="w-full h-[50vh] md:h-[70vh] border-b-8 border-black overflow-hidden relative bg-zinc-900">
            <img
              src={post.image_url}
              alt={post.title}
              className="object-cover w-full h-full"
            />
            {/* Category Tag anchored to the image */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 items-start">
              <span className="bg-[#FFFF00] text-black font-black uppercase px-4 py-2 text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                {post.category || 'News'}
              </span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pl-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <article className="lg:col-span-8 space-y-8">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs font-inter font-bold uppercase text-gray-400 tracking-wider">
                <Link href="/" className="hover:text-black transition-colors">Home</Link>
                <span>/</span>
                <Link href="/" className="hover:text-black transition-colors">{post.category || 'News'}</Link>
                <span>/</span>
                <span className="text-black">Article</span>
              </nav>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-4 tracking-tighter uppercase">
                {post.title}
              </h1>

              {/* Author Persona */}
              <div className="flex items-center gap-3 border-b-4 border-black pb-4">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                  alt="Zane Edge"
                  className="w-12 h-12 rounded-full border-2 border-black object-cover"
                />
                <div>
                  <div className="font-inter font-black uppercase text-sm text-black">Zane Edge</div>
                  <div className="font-inter font-bold uppercase text-xs text-gray-500">
                    Published: {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Human Review Badge — AdSense compliance */}
              {post.reviewed_by && (
                <ReviewedByBadge reviewerName={post.reviewed_by} className="mt-3" />
              )}

              <CynicalTLDR summary={post.tldr_summary} absurdityScore={post.absurdity_score || '10/10'} />

              {/* Social Proof: Reactions System — Above the fold */}
              <div id="reactions-poll" className="scroll-mt-32">
                <Reactions postId={post.id} />
              </div>

              <div className="article-body">
                {post.content?.split('\n\n').map((paragraph: string, idx: number, arr: string[]) => {
                  const isMiddle = Math.floor(arr.length / 2) === idx && arr.length >= 2;
                  return (
                    <React.Fragment key={idx}>
                      {/* Native Social Embed integration replacing Grey Ad Boxes */}
                      {isMiddle && (
                        <div className="border-4 border-black rounded-xl p-4 my-4 max-w-md mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white flex flex-col transform rotate-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-base border-2 border-black">X</div>
                            <div>
                              <div className="font-black uppercase text-sm leading-none">TechInsiderDoom</div>
                              <div className="font-mono text-[10px] text-gray-500">@TechInsiderDoom</div>
                            </div>
                          </div>
                          <p className="font-bold text-base leading-snug mb-3">"If the AI doesn't kill us, the panic-buying of bunkers definitely will. We are so cooked. 💀🤖"</p>
                          <div className="font-mono text-[10px] text-gray-500 uppercase border-t-2 border-gray-100 pt-2">
                            1.2M Views • 14K Reposts
                          </div>
                        </div>
                      )}
                      <p className="text-lg leading-relaxed first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-black">
                        {paragraph}
                      </p>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Mobile-First Hot Tape — Bottom of article */}
              <div className="lg:hidden my-10 bg-zinc-100 border-y-4 border-black py-6 -mx-4 px-4 sm:-mx-6 sm:px-6">
                <h3 className="font-black uppercase text-red-600 mb-4 border-b-2 border-black inline-block text-xl">🔥 Hot Tape</h3>
                <div className="flex overflow-x-auto snap-x gap-4 pb-4 hide-scrollbar">
                  <div className="snap-center shrink-0 w-56 border-4 border-black flex flex-col bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img src="https://picsum.photos/seed/x1/300/300" className="w-full h-40 object-cover border-b-4 border-black" />
                    <div className="p-3"><p className="font-black text-sm uppercase leading-tight line-clamp-3 hover:text-red-600">Local Man Discovers Sleep Is Actually Good</p></div>
                  </div>
                  <div className="snap-center shrink-0 w-56 border-4 border-black flex flex-col bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img src="https://picsum.photos/seed/x2/300/300" className="w-full h-40 object-cover border-b-4 border-black" />
                    <div className="p-3"><p className="font-black text-sm uppercase leading-tight line-clamp-3 hover:text-red-600">Why Your Smart Fridge Is Judging Your Diet</p></div>
                  </div>
                  <div className="snap-center shrink-0 w-56 border-4 border-black flex flex-col bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img src="https://picsum.photos/seed/x3/300/300" className="w-full h-40 object-cover border-b-4 border-black" />
                    <div className="p-3"><p className="font-black text-sm uppercase leading-tight line-clamp-3 hover:text-red-600">Top 10 Ways To Survive the 2026 AGI Takeover</p></div>
                  </div>
                </div>
              </div>

              {/* ── Giscus Comments ── */}
              <GiscusComments term={post.id} />

              {/* Topic Tags — Circular Navigation */}
              <div className="flex flex-wrap gap-3 pt-6 border-t-4 border-black">
                <Link href="/" className="bg-black text-white font-inter font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  #AGI
                </Link>
                <Link href="/" className="bg-black text-white font-inter font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  #SILICONVALLEY
                </Link>
                <Link href="/" className="bg-black text-white font-inter font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  #AI
                </Link>
                <Link href="/" className="bg-black text-white font-inter font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  #TECHNOLOGY
                </Link>
                <Link href="/" className="bg-black text-white font-inter font-black uppercase text-xs px-4 py-2 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
                  #BUNKERS
                </Link>
              </div>
            </article>

            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24 space-y-8">

                <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="font-inter font-black uppercase text-2xl border-b-4 border-black pb-2 mb-4 text-black bg-[#FFFF00] inline-block px-2 transform -rotate-1">Trending Now</h3>
                  <ul className="text-black mt-4">
                    <li className="flex flex-row gap-4 items-center group cursor-pointer mb-6">
                      <img src="https://picsum.photos/seed/news1/200/200" alt="Trending" className="w-24 h-24 shrink-0 object-cover border-2 border-black" />
                      <div>
                        <div className="text-xs font-black text-red-600 uppercase mb-1">Crypto</div>
                        <div className="text-sm md:text-base font-bold leading-snug group-hover:underline line-clamp-3">EXCLUSIVE: Alien Spaceship Runs On Crypto</div>
                      </div>
                    </li>
                    <li className="flex flex-row gap-4 items-center group cursor-pointer mb-6">
                      <img src="https://picsum.photos/seed/news2/200/200" alt="Trending" className="w-24 h-24 shrink-0 object-cover border-2 border-black" />
                      <div>
                        <div className="text-xs font-black text-red-600 uppercase mb-1">Health</div>
                        <div className="text-sm md:text-base font-bold leading-snug group-hover:underline line-clamp-3">Local Man Discovers Sleep Is Actually Good</div>
                      </div>
                    </li>
                    <li className="flex flex-row gap-4 items-center group cursor-pointer mb-0">
                      <img src="https://picsum.photos/seed/news4/200/200" alt="Trending" className="w-24 h-24 shrink-0 object-cover border-2 border-black" />
                      <div>
                        <div className="text-xs font-black text-red-600 uppercase mb-1">AI</div>
                        <div className="text-sm md:text-base font-bold leading-snug group-hover:underline line-clamp-3">Top 10 Ways To Survive the 2026 AGI Takeover</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}
