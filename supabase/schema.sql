-- ============================================
-- TRUTHWORLDNEWS DATABASE SCHEMA
-- Run this in Supabase SQL Editor (New query → Paste → Run)
-- ============================================

-- 1. NEWS ARTICLES (main table)
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hype_meter TEXT,
  tldr_summary TEXT,
  model_used TEXT,
  sources TEXT,
  content_hash TEXT UNIQUE,
  category TEXT DEFAULT 'News',
  image_url TEXT,
  is_rumor BOOLEAN DEFAULT false,
  safety_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_news_articles_status ON public.news_articles(status);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON public.news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_created ON public.news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles(published_at DESC);

-- 2. EDITORIAL LOG (compliance/audit)
CREATE TABLE IF NOT EXISTS public.editorial_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 4. SAFETY CACHE (deduplication)
CREATE TABLE IF NOT EXISTS public.safety_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT UNIQUE NOT NULL,
  safety_score INTEGER DEFAULT 0,
  is_safe BOOLEAN DEFAULT true,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. API KEYS (for external integrations)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- 7. SPONSOR SLOTS (monetization)
CREATE TABLE IF NOT EXISTS public.sponsor_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_name TEXT NOT NULL,
  sponsor_name TEXT,
  sponsor_link TEXT,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_slots ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now, restrict later)
CREATE POLICY "Allow all" ON public.news_articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.editorial_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.safety_cache FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.api_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.sponsor_slots FOR ALL USING (true) WITH CHECK (true);
