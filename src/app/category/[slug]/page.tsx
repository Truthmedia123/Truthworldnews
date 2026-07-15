import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const VALID_CATEGORIES = ['AI', 'Crypto', 'Weird Tech', 'Leaks', 'Rants', 'Investigations', 'News'];

export async function generateStaticParams() {
  return VALID_CATEGORIES.map(cat => ({
    slug: cat.toLowerCase().replace(' ', '-'),
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const resolvedParams = await params;
  const category = resolvedParams.slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${category} | Truth World News`,
    description: `Latest ${category} news, unfiltered and cynical.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.slug;
  
  const category = VALID_CATEGORIES.find(
    c => c.toLowerCase().replace(' ', '-') === categorySlug
  );
  
  if (!category) {
    notFound();
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_published', true)
    .eq('status', 'published')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Category fetch error:', error);
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-black mb-2 text-red-600 uppercase tracking-tighter">{category}</h1>
        <p className="text-gray-500 mb-8">All the {category.toLowerCase()} news worth caring about.</p>
        
        {(!posts || posts.length === 0) ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/article/${post.id}`}>
                <article className="group cursor-pointer border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden">
                  <img 
                    src={post.image_url || '/default-og.jpg'} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <span className="text-red-600 text-xs font-black uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h2 className="font-bold text-lg group-hover:text-red-600 transition line-clamp-2">
                      {post.title}
                    </h2>
                    {post.tldr_summary && (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.tldr_summary}</p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
