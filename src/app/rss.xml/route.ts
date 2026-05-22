import { supabase } from '@/lib/supabase';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, content, tldr_summary, created_at, category')
    .eq('is_published', true)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  const baseUrl = 'https://truthworldnews.com';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Truth World News</title>
    <link>${baseUrl}</link>
    <description>The cynical antidote to boring mainstream media. Powered by AI and blunt honesty.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${(posts || []).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/article/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/article/${post.id}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <category>${post.category || 'News'}</category>
      <description><![CDATA[${post.tldr_summary || post.content?.substring(0, 200) || ''}]]></description>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
