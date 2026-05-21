import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const articleSchema = z.object({
  title: z.string().min(10).max(200),
  content: z.string().min(100).max(10000),
  tldr_summary: z.string().min(20).max(500),
  image_url: z.string().url().optional().or(z.literal('')),
  category: z.enum(['AI', 'Crypto', 'Weird Tech', 'Leaks', 'Rants', 'Investigations', 'News', 'WORLD']),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url()
  })).min(1).max(5).optional(),
  video_script: z.string().optional(),
  image_description: z.string().optional(),
  content_hash: z.string().length(16),
  hype_meter: z.string().optional(),
  is_rumor: z.boolean().optional(),
  safety_score: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = articleSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([{ 
        ...result.data, 
        status: 'draft', 
        is_published: false 
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, post: data[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
