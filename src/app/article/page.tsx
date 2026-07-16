/**
 * src/app/article/page.tsx
 *
 * Redirect handler for legacy /article?id=UUID URLs.
 *
 * Background:
 *   The original repo used client-side fetching via /article?id=UUID. After v6
 *   migration, articles live at /article/[slug]. Old URLs (still in Google's
 *   index, in old tweets, in newsletter archives) must 301-redirect to the
 *   new slug-based URL.
 *
 * Behavior:
 *   - ?id=UUID found in uuid-slug map → 301 to /article/{slug}
 *   - ?id=UUID not found → render 404
 *   - no ?id= → 302 to homepage (someone typed /article manually)
 */

import { redirect, notFound } from 'next/navigation';
import { getSlugBySupabaseUuid } from '@/lib/ghost';

export const dynamic = 'force-dynamic'; // always run on request — never cache redirects

interface ArticleRedirectProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ArticleRedirect({ searchParams }: ArticleRedirectProps) {
  const { id } = await searchParams;

  // No ?id= param → bounce to homepage
  if (!id) {
    redirect('/');
  }

  // Look up slug
  const slug = await getSlugBySupabaseUuid(id);

  if (slug) {
    redirect(`/article/${slug}`);
  }

  // UUID not in map — render 404
  notFound();
}
