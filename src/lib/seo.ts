import { Metadata } from 'next';

interface SeoProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
}

export function generateSeoMeta({
  title,
  description = 'The cynical antidote to boring mainstream media.',
  image = '/default-og.jpg',
  url = '/',
  type = 'website',
  publishedAt,
  modifiedAt,
  author = 'Zane Edge',
}: SeoProps): Metadata {
  const fullUrl = `https://truthworldnews.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://truthworldnews.com${image}`;

  return {
    title: `${title} | Truth World News`,
    description,
    metadataBase: new URL("https://truthworldnews.com"),
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: "Truth World News",
      images: [{ url: fullImage, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      type,
      ...(publishedAt && { publishedTime: publishedAt }),
      ...(modifiedAt && { modifiedTime: modifiedAt }),
      ...(type === 'article' && { authors: [author] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullImage],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}
