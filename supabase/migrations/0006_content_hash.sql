-- Add content hash for deduplication
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS posts_content_hash_idx ON posts(content_hash);

-- Add fields for safety and verification
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_rumor BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS safety_score DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS verified_sources JSONB DEFAULT '[]'::jsonb;

-- Add editorial log fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS editorial_notes TEXT;

-- Ensure status enum is correct
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check 
  CHECK (status IN ('draft', 'review', 'published', 'rejected', 'archived'));
