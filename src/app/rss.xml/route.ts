import { getPosts } from '@/lib/ghost';

export const revalidate = 3600;
export const dynamic = 'force-static';

export async function GET() {
  let posts: any[] = [];
  try {
    const res = await getPosts({ limit: 20 });
    posts = res.posts;
  } catch (err) {
    console.error('RSS fetch error:', err);
  }

  const baseUrl = 'https://truthworldnews.com';

  const items = posts.map((post) => {
    const url = `${baseUrl}/article/${post.slug}`;
    const pubDate = new Date(post.published_at || Date.now()).toUTCString();
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt || post.custom_excerpt || ''}]]></description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Truth World News</title>
    <link>${baseUrl}</link>
    <description>The cynical antidote to boring mainstream media.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
