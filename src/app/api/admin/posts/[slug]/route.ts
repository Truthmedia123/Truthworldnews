/**
 * src/app/api/admin/posts/[slug]/route.ts
 *
 * Per-post admin operations:
 *   PATCH  /api/admin/posts/{slug}  body={ action: 'publish'|'unpublish'|'update_content', content? }
 *   DELETE /api/admin/posts/{slug}
 *
 * Auth: cookie-based JWT (enforced by middleware).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ghostAdmin } from '@/lib/ghost-admin';
import { logEditorialAction, query } from '@/lib/postgres';
import { getSessionFromRequest } from '@/lib/auth';

const patchSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'update_content', 'update_title']),
  content: z.string().optional(),
  title: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function PATCH(request: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid body', details: err.flatten?.() }, { status: 400 });
  }

  // Look up post by slug
  const post = await ghostAdmin.getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(request);
  const performedBy = session?.email || 'unknown';

  try {
    if (body.action === 'publish') {
      await ghostAdmin.publishPost(post.id);
      await logEditorialAction({
        article_slug: slug,
        action: 'published',
        details: 'Approved via admin dashboard',
        performed_by: performedBy,
      });
    } else if (body.action === 'unpublish') {
      await ghostAdmin.unpublishPost(post.id);
      await logEditorialAction({
        article_slug: slug,
        action: 'unpublished',
        details: 'Reverted to draft',
        performed_by: performedBy,
      });
    } else if (body.action === 'update_content' && body.content) {
      // Convert content to mobiledoc
      const html = `<p>${body.content.split('\n\n').join('</p><p>')}</p>`;
      await ghostAdmin.updatePost(post.id, { html });
      await logEditorialAction({
        article_slug: slug,
        action: 'content_edited',
        details: `Edited via admin dashboard (${body.content.length} chars)`,
        performed_by: performedBy,
      });
    } else if (body.action === 'update_title' && body.title) {
      await ghostAdmin.updatePost(post.id, { title: body.title });
      await logEditorialAction({
        article_slug: slug,
        action: 'title_edited',
        details: `New title: ${body.title}`,
        performed_by: performedBy,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action or missing field' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, slug });
  } catch (err: any) {
    console.error('[admin/posts/[slug]] PATCH failed:', err);
    return NextResponse.json(
      { error: 'Ghost operation failed', details: err.message },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;

  const post = await ghostAdmin.getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const session = await getSessionFromRequest(request);
  const performedBy = session?.email || 'unknown';

  try {
    await ghostAdmin.deletePost(post.id);
    await logEditorialAction({
      article_slug: slug,
      action: 'deleted',
      details: `Deleted via admin dashboard`,
      performed_by: performedBy,
    });

    // Also remove from Meilisearch
    await fetch(`${process.env.MEILI_HOST}/indexes/twn_articles/documents/${slug}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.MEILI_API_KEY}` },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[admin/posts/[slug]] DELETE failed:', err);
    return NextResponse.json(
      { error: 'Ghost delete failed', details: err.message },
      { status: 502 },
    );
  }
}
