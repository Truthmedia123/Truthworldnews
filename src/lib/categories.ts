/**
 * src/lib/categories.ts
 *
 * Canonical 8 category list for TruthWorldNews.
 * Matches the repo's hardcoded list in src/app/category/[slug]/page.tsx + the
 * zod schema in src/app/api/post-news/route.ts (which adds 'WORLD').
 *
 * These MUST match the tags created in Ghost Admin (see migration runbook §1.3).
 */

export interface Category {
  /** Display name (e.g., "Weird Tech") — used in UI */
  name: string;
  /** URL slug (e.g., "weird-tech") — used in URLs */
  slug: string;
  /** Ghost tag name (usually same as display name) */
  ghostTag: string;
  /** Navbar label (shorter if needed) */
  navLabel?: string;
  /** Description for SEO / tag pages */
  description: string;
  /** Accent color (tailwind class) */
  accent: string;
}

export const CATEGORIES: Category[] = [
  {
    name: 'AI',
    slug: 'ai',
    ghostTag: 'AI',
    navLabel: 'AI',
    description: 'Artificial intelligence news, unfiltered. The hype, the reality, the cynicism.',
    accent: 'text-blue-600',
  },
  {
    name: 'Crypto',
    slug: 'crypto',
    ghostTag: 'Crypto',
    navLabel: 'Crypto',
    description: 'Crypto and Web3 news without the moonboy cheerleading.',
    accent: 'text-orange-500',
  },
  {
    name: 'Weird Tech',
    slug: 'weird-tech',
    ghostTag: 'Weird Tech',
    navLabel: 'Weird',
    description: 'Tech that makes you ask "but why?"',
    accent: 'text-purple-600',
  },
  {
    name: 'Leaks',
    slug: 'leaks',
    ghostTag: 'Leaks',
    navLabel: 'Leaks',
    description: 'Sources spoke. We listened.',
    accent: 'text-red-600',
  },
  {
    name: 'Rants',
    slug: 'rants',
    ghostTag: 'Rants',
    navLabel: 'Rants',
    description: 'Sometimes we just need to vent.',
    accent: 'text-yellow-600',
  },
  {
    name: 'Investigations',
    slug: 'investigations',
    ghostTag: 'Investigations',
    navLabel: 'Investigates',
    description: 'Long-form reporting. Slow journalism.',
    accent: 'text-emerald-700',
  },
  {
    name: 'News',
    slug: 'news',
    ghostTag: 'News',
    navLabel: 'Latest',
    description: 'Straight news with a cynical edge.',
    accent: 'text-black',
  },
  {
    name: 'WORLD',
    slug: 'world',
    ghostTag: 'WORLD',
    navLabel: 'World',
    description: 'Global news from outside the US/EU bubble.',
    accent: 'text-cyan-700',
  },
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name) as readonly string[];

export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug) as readonly string[];

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export function getCategoryBySlug(slug: string): Category | null {
  return CATEGORIES.find(c => c.slug === slug) ?? null;
}

export function getCategoryByName(name: string): Category | null {
  return CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase()) ?? null;
}

export function getCategoryByGhostTag(tag: string): Category | null {
  return CATEGORIES.find(c => c.ghostTag.toLowerCase() === tag.toLowerCase()) ?? null;
}

/**
 * Convert a category name (from a Supabase article) to a Ghost tag slug.
 * Returns null if not in the canonical list (the article's category column was wrong).
 */
export function categoryToGhostTag(categoryName: string): string | null {
  return getCategoryByName(categoryName)?.ghostTag ?? null;
}

/**
 * Generate the static params for /category/[slug] (Next.js generateStaticParams).
 */
export function generateCategoryParams(): { slug: string }[] {
  return CATEGORY_SLUGS.map(slug => ({ slug }));
}
