CREATE TABLE IF NOT EXISTS public.tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone can submit a tip)
CREATE POLICY "Allow anonymous inserts for tips" 
ON public.tips FOR INSERT 
TO public
WITH CHECK (true);

-- Allow admins to view tips (assuming authenticated means admin for now, or just true for simplicity in prototype)
CREATE POLICY "Allow selects for tips" 
ON public.tips FOR SELECT 
TO public
USING (true);
