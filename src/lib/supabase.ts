import { createClient } from '@supabase/supabase-js'

// Temporary hardcoded for testing - revert to env vars later
const supabaseUrl = 'https://vimwmyheupvmwpxtftvg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXdteWhldXB2bXdweHRmdHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTQ4MzUsImV4cCI6MjA5NDk5MDgzNX0.5A27-t_7ND3IA7qMrlSwA1aedXKnKB90GBUTPCip-Y8'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Server-side client (for API routes, scraping, admin ops)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
