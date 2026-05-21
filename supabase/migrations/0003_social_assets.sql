ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS social_assets JSONB DEFAULT '{}'::jsonb;
