'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function ArticleContent() {
  const searchParams = useSearchParams()
  const articleId = searchParams.get('id')

  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      if (!articleId) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single()

      if (error) {
        console.error('Error fetching article:', error)
      } else {
        setArticle(data)
      }
      setLoading(false)
    }

    fetchArticle()
  }, [articleId])

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFFF00] animate-spin rounded-full mx-auto mb-4" />
          <p className="font-black uppercase">Loading article...</p>
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Article Not Found</h1>
          <p className="text-gray-500">No article ID provided or article doesn't exist.</p>
          <Link href="/" className="inline-block mt-6 bg-black text-white font-black uppercase px-6 py-3 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-gray-500 hover:text-black mb-6">
          &larr; Back to Home
        </Link>

        {article.image_url && (
          <div className="w-full h-[40vh] md:h-[50vh] border-4 border-black overflow-hidden relative bg-zinc-900 mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-[#FFFF00] text-black font-black uppercase px-3 py-1 text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {article.category || 'News'}
              </span>
            </div>
          </div>
        )}

        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 tracking-tighter uppercase">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-8">
          <div>
            <div className="font-inter font-black uppercase text-sm text-black">Zane Edge</div>
            <div className="font-inter font-bold uppercase text-xs text-gray-500">
              Published: {new Date(article.published_at || article.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          {article.content?.split('\n\n').map((paragraph: string, idx: number) => (
            <p key={idx} className="text-lg leading-relaxed mb-6">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 p-4 bg-[#FFFF00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black uppercase">Hype Meter: {article.hype_meter || '5/10'}</p>
        </div>
      </div>
    </main>
  )
}

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFFF00] animate-spin rounded-full mx-auto mb-4" />
          <p className="font-black uppercase">Loading article...</p>
        </div>
      </main>
    }>
      <ArticleContent />
    </Suspense>
  )
}
