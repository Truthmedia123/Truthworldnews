import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/ghost';

export const revalidate = 3600;
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://truthworldnews.com';

  let posts: any[] = [];
  try {
    const res = await getPosts({ limit: 100 });
    posts = res.posts;
  } catch (err) {
    console.error('Sitemap fetch error:', err);
  }

  const articleEntries = posts.map((post) => ({
    url: `${baseUrl}/article/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || Date.now()),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const staticEntries = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/submit-tip`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const categories = ['ai', 'crypto', 'weird-tech', 'leaks', 'rants', 'investigations', 'news'];
  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
