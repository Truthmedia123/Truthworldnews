CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('LOL', 'OMFG', 'TRASH', 'WTF', 'LEGEND')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster aggregation of reactions per post
CREATE INDEX IF NOT EXISTS reactions_post_id_idx ON public.reactions(post_id);

-- Add Row Level Security (RLS)
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can react)
CREATE POLICY "Allow anonymous inserts for reactions" 
ON public.reactions FOR INSERT 
TO public
WITH CHECK (true);

-- Allow anonymous selects (anyone can view reaction counts)
CREATE POLICY "Allow anonymous selects for reactions" 
ON public.reactions FOR SELECT 
TO public
USING (true);
