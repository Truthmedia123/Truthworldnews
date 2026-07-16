/**
 * src/app/api/admin/upload-image/route.ts
 *
 * Uploads an image to Ghost's image store.
 * Used by the admin dashboard's "Upload Image" button.
 *
 * Auth: cookie-based JWT (middleware).
 * Body: multipart/form-data with `file` field
 */

import { NextResponse } from 'next/server';
import { ghostAdmin } from '@/lib/ghost-admin';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const purpose = formData.get('purpose') || 'image';

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const res = await ghostAdmin.uploadImage(buffer, file.name);
    return NextResponse.json({ url: res.url, ref: res.ref });
  } catch (err: any) {
    console.error('[admin/upload-image] failed:', err);
    return NextResponse.json(
      { error: 'Upload failed', details: err.message },
      { status: 502 },
    );
  }
}
