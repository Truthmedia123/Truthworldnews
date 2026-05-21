-- Add human review tracking columns to posts table
-- This supports the AdSense "human editor review" requirement

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'published')),
ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Migrate existing data: if is_published is true, mark as published
UPDATE posts SET status = 'published' WHERE is_published = true AND status = 'draft';