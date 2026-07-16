/**
 * src/app/category/[slug]/page.tsx
 *
 * Category page. Server component, ISR 60s.
 *
 * Replaces Supabase filter with Ghost tag browse.
 * Uses the canonical 8 categories from src/lib/categories.ts.
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getPostsByTag, getGhostPublicUrl } from '@/lib/ghost';
import { CATEGORIES, getCategoryBySlug, generateCategoryParams } from '@/lib/categories';
import { getTldr } from '@/lib/custom-fields';
import { imgproxyPresets } from '@/lib/imgproxy-loader';
import type { Metadata } from 'next';

export const revalidate = 60;

// ---------------------------------------------------------------------------
// generateStaticParams
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return generateCategoryParams();
}

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) return { title: 'Category Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || getGhostPublicUrl();
  return {
    title: `${cat.name} | Truth World News`,
    description: cat.description,
    alternates: { canonical: `${siteUrl}/category/${cat.slug}` },
    openGraph: {
      type: 'website',
      title: `${cat.name} | Truth World News`,
      description: cat.description,
      url: `${siteUrl}/category/${cat.slug}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr || 1));

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const res = await getPostsByTag(category.ghostTag, page, 20);
  const posts = res.posts;
  const pagination = res.meta.pagination;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-black mb-2 text-red-600 uppercase tracking-tighter">
          {category.name}
        </h1>
        <p className="text-gray-500 mb-8 font-bold uppercase text-sm tracking-widest">
          {category.description}
        </p>

        {/* Other categories row */}
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b-4 border-black">
          {CATEGORIES.filter(c => c.slug !== category.slug).map(c => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="text-xs font-black uppercase px-3 py-1 border-2 border-black hover:bg-[#FFFF00] transition-colors"
            >
              {c.navLabel || c.name}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-400 font-bold uppercase tracking-wider">
            No articles in {category.name} yet. Pipeline is running.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/article/${post.slug}`}
                className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-200">
                  {post.feature_image ? (
                    <Image
                      src={imgproxyPresets.card(post.feature_image)}
                      alt={post.feature_image_alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Image
                      src="/default-og.jpg"
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-red-600 text-xs font-black uppercase tracking-wider mb-2">
                    {post.primary_tag?.name || category.name}
                  </span>
                  <h2 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-red-600 transition mb-2">
                    {post.title}
                  </h2>
                  {getTldr(post) && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">{getTldr(post)}</p>
                  )}
                  <div className="mt-auto pt-2 border-t border-gray-200 text-xs font-bold text-gray-500 uppercase">
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {pagination.prev && (
              <Link
                href={`/category/${slug}?page=${pagination.prev}`}
                className="px-4 py-2 border-2 border-black font-black uppercase text-sm hover:bg-black hover:text-white transition-colors"
              >
                ← Newer
              </Link>
            )}
            <span className="font-bold text-sm uppercase">
              Page {pagination.page} of {pagination.pages}
            </span>
            {pagination.next && (
              <Link
                href={`/category/${slug}?page=${pagination.next}`}
                className="px-4 py-2 border-2 border-black font-black uppercase text-sm hover:bg-[#FFFF00] transition-colors flex items-center gap-1"
              >
                Older <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
