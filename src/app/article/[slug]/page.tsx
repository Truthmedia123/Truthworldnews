/**
 * src/app/article/[slug]/page.tsx
 *
 * Article page. Server component, ISR 60s.
 *
 * Replaces /article?id=UUID with /article/[slug].
 * Renders the brutalist TWN layout with TL;DR callout, hype meter, rumor flag,
 * safety badge, video player, remark42 comments, JSON-LD schema.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Flame, AlertTriangle, ShieldCheck, ShieldAlert, Video } from 'lucide-react';
import {
  getPostBySlug,
  getAdjacentPosts,
  getGhostPublicUrl,
} from '@/lib/ghost';
import {
  getTldrBullets,
  getHypeLabel,
  getSafetyLabel,
  isRumor,
  getSources,
  getContentHash,
  hasVideo,
  getVideoUrl,
  getReviewedBy,
} from '@/lib/custom-fields';
import Remark42Comments from '@/components/Remark42Comments';
import { imgproxyPresets } from '@/lib/imgproxy-loader';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ---------------------------------------------------------------------------
// generateMetadata (SEO)
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getGhostPublicUrl();
  const ogImage = post.feature_image
    ? imgproxyPresets.og(post.feature_image)
    : `${siteUrl}/default-og.jpg`;

  return {
    title: post.title,
    description: post.excerpt || post.tldr_summary || '',
    alternates: {
      canonical: `${siteUrl}/article/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.tldr_summary || '',
      url: `${siteUrl}/article/${post.slug}`,
      siteName: 'Truth World News',
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || undefined,
      authors: post.authors?.map(a => a.name) || ['Zane Edge'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.feature_image_alt || post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.tldr_summary || '',
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || !post.published_at) notFound();

  const tldrBullets = getTldrBullets(post);
  const hype = getHypeLabel(post);
  const safety = getSafetyLabel(post);
  const rumor = isRumor(post);
  const sources = getSources(post);
  const contentHash = getContentHash(post);
  const reviewedBy = getReviewedBy(post);
  const videoUrl = hasVideo(post) ? getVideoUrl(post) : null;

  // Adjacent posts for prev/next nav
  const { prev, next } = await getAdjacentPosts(post.slug, post.published_at!);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getGhostPublicUrl();
  const heroImage = post.feature_image
    ? imgproxyPresets.hero(post.feature_image)
    : '/default-og.jpg';

  // JSON-LD NewsArticle schema with TWN extensions
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: post.authors?.map(a => ({ '@type': 'Person', name: a.name })) || [{ '@type': 'Person', name: 'Zane Edge' }],
    publisher: {
      '@type': 'Organization',
      name: 'Truth World News',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/default-og.jpg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/article/${post.slug}` },
    image: [heroImage],
    articleBody: post.plaintext,
    description: post.excerpt || post.tldr_summary || '',
    // Custom extensions
    editorTrustScore: safety?.level === 'clean' ? 90 : safety?.level === 'minor-concerns' ? 70 : 40,
    isRumorUnverified: rumor,
    contentHash,
  };

  return (
    <main className="min-h-screen bg-white text-black pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-gray-500 hover:text-black mb-6">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Hero Image */}
        <div className="w-full h-[40vh] md:h-[50vh] border-4 border-black overflow-hidden relative bg-zinc-900 mb-8">
          <Image
            src={heroImage}
            alt={post.feature_image_alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {post.primary_tag && (
              <span className="bg-[#FFFF00] text-black font-black uppercase px-3 py-1 text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {post.primary_tag.name}
              </span>
            )}
            {rumor && (
              <span className="bg-red-600 text-white font-black uppercase px-3 py-1 text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                <AlertTriangle size={14} /> RUMOR
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tighter uppercase">
          {post.title}
        </h1>

        {/* Byline */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-8">
          <div>
            <div className="font-inter font-black uppercase text-sm text-black">
              {post.primary_author?.name || 'Zane Edge'}
            </div>
            <div className="font-inter font-bold uppercase text-xs text-gray-500">
              Published: {new Date(post.published_at).toLocaleDateString()}
              {reviewedBy && <span className="ml-2">· Reviewed by {reviewedBy}</span>}
            </div>
          </div>
        </div>

        {/* TL;DR Callout */}
        {tldrBullets.length > 0 && (
          <div className="mb-8 bg-[#FFFF00] border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-inter font-black uppercase mb-3 flex items-center gap-2">
              <Flame size={20} className="fill-current" /> TL;DR
            </h2>
            <ul className="space-y-2">
              {tldrBullets.map((b, i) => (
                <li key={i} className="font-bold text-lg leading-snug flex gap-2">
                  <span className="text-red-600">→</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Badges: Hype + Safety */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className={`${hype.bg} ${hype.color} border-4 border-black px-4 py-2 font-inter font-black uppercase text-sm flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
            <span>{hype.emoji}</span>
            Hype: {hype.label}
          </div>
          {safety && (
            <div className={`${safety.bg} ${safety.color} border-4 border-black px-4 py-2 font-inter font-black uppercase text-sm flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
              {safety.level === 'clean' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              {safety.label}
            </div>
          )}
        </div>

        {/* Video Player (if video_url set) */}
        {videoUrl && (
          <div className="mb-8 border-4 border-black p-2 bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-[#FFFF00] font-inter font-black uppercase text-xs mb-2 px-2">
              <Video size={14} /> AI-Generated Video
            </div>
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video object-cover"
              poster={heroImage}
            />
          </div>
        )}

        {/* Article Body — render plaintext (rich renderer is a future enhancement) */}
        <div className="prose prose-lg max-w-none">
          {post.plaintext?.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-lg leading-relaxed mb-6 font-serif">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-12 border-t-4 border-black pt-6">
            <h3 className="text-xl font-inter font-black uppercase mb-4">Sources</h3>
            <ul className="space-y-2">
              {sources.map((src, i) => (
                <li key={i} className="font-bold">
                  <span className="text-red-600 mr-2">[{i + 1}]</span>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-red-600">
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content-hash provenance footer */}
        {contentHash && (
          <div className="mt-8 text-xs text-gray-500 font-mono border-t border-gray-200 pt-4">
            Content Hash: <code className="bg-gray-100 px-2 py-0.5 rounded">{contentHash}</code>
            <span className="ml-2">·</span>
            <span className="ml-2">Last verified: {new Date(post.updated_at || post.published_at || post.created_at).toLocaleDateString()}</span>
          </div>
        )}

        {/* Prev/Next Nav */}
        {(prev || next) && (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {prev ? (
              <Link href={`/article/${prev.slug}`} className="group border-4 border-black hover:border-[#FFFF00] p-4 transition-colors">
                <div className="text-xs font-black uppercase text-gray-500 mb-1">← Previous</div>
                <div className="font-bold line-clamp-2 group-hover:underline">{prev.title}</div>
              </Link>
            ) : <div />}
            {next ? (
              <Link href={`/article/${next.slug}`} className="group border-4 border-black hover:border-[#FFFF00] p-4 transition-colors text-right">
                <div className="text-xs font-black uppercase text-gray-500 mb-1">Next →</div>
                <div className="font-bold line-clamp-2 group-hover:underline">{next.title}</div>
              </Link>
            ) : <div />}
          </div>
        )}

        {/* Remark42 Comments */}
        <Remark42Comments term={post.slug} />
      </article>
    </main>
  );
}
