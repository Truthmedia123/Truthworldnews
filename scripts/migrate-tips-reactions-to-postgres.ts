/**
 * scripts/migrate-tips-reactions-to-postgres.ts
 *
 * Migrates non-article data from Supabase to Postgres:
 *   - tips
 *   - newsletter_subscribers (also pushed to listmonk separately)
 *   - editorial_log
 *   - reactions (if the table exists)
 *   - quiz_submissions (if the table exists)
 *   - dmca_requests (if the table exists)
 *   - data_requests (if the table exists)
 *
 * Articles are NOT migrated here — they go to Ghost via migrate-supabase-to-ghost.ts.
 *
 * Usage:
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_KEY=... \
 *   POSTGRES_URL=postgres://twn:pass@localhost:5432/twn \
 *   npx tsx scripts/migrate-tips-reactions-to-postgres.ts
 */

import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const DRY_RUN = process.env.DRY_RUN === 'true';
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const POSTGRES_URL = process.env.POSTGRES_URL!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !POSTGRES_URL) {
  console.error('Missing env vars. Required: SUPABASE_URL, SUPABASE_SERVICE_KEY, POSTGRES_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pool = new Pool({ connectionString: POSTGRES_URL, max: 5 });

// ---------------------------------------------------------------------------
// Generic table migrator
// ---------------------------------------------------------------------------

async function migrateTable<T extends Record<string, any>>(
  sourceTable: string,
  targetTable: string,
  columnMap: (row: T) => { columns: string[]; values: any[] },
): Promise<{ count: number; skipped: number; failed: number }> {
  console.log(`\n[migrate] ${sourceTable} → ${targetTable}`);

  // Fetch all rows from Supabase
  const allRows: T[] = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from(sourceTable)
      .select('*')
      .range(offset, offset + 999);
    if (error) {
      console.warn(`  Warning: failed to fetch ${sourceTable}: ${error.message}`);
      return { count: 0, skipped: 0, failed: 0 };
    }
    if (!data || data.length === 0) break;
    allRows.push(...data as T[]);
    if (data.length < 1000) break;
    offset += 1000;
  }

  console.log(`  Fetched: ${allRows.length} rows from Supabase`);

  if (DRY_RUN) {
    console.log(`  DRY RUN — would insert ${allRows.length} rows into ${targetTable}`);
    return { count: 0, skipped: 0, failed: 0 };
  }

  let count = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of allRows) {
    try {
      const { columns, values } = columnMap(row);

      // ON CONFLICT DO NOTHING (idempotency — assumes PK or unique constraint)
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const conflictTarget = columns.includes('id') ? 'id' :
                              columns.includes('email') ? 'email' :
                              'DO NOTHING';

      const sql = conflictTarget === 'DO NOTHING'
        ? `INSERT INTO ${targetTable} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`
        : `INSERT INTO ${targetTable} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT (${conflictTarget}) DO NOTHING`;

      const res = await pool.query(sql, values);
      if (res.rowCount && res.rowCount > 0) count++;
      else skipped++;
    } catch (err: any) {
      console.error(`  Failed row: ${err.message}`);
      failed++;
    }
  }

  console.log(`  ✓ Inserted: ${count} | Skipped (existing): ${skipped} | Failed: ${failed}`);
  return { count, skipped, failed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('─'.repeat(60));
  console.log(`[migrate-tips] DRY_RUN=${DRY_RUN}`);
  console.log(`[migrate-tips] Supabase: ${SUPABASE_URL}`);
  console.log(`[migrate-tips] Postgres: ${POSTGRES_URL.replace(/:[^:@]+@/, ':***@')}`);
  console.log('─'.repeat(60));

  // Tips
  await migrateTable<any>('tips', 'tips', row => ({
    columns: ['title', 'story', 'evidence_url', 'submitted_at', 'reviewed', 'reviewed_by', 'reviewed_at'],
    values: [
      row.title, row.story, row.evidence_url || null,
      row.submitted_at || row.created_at || new Date().toISOString(),
      row.reviewed || false, row.reviewed_by || null, row.reviewed_at || null,
    ],
  }));

  // Newsletter subscribers
  await migrateTable<any>('newsletter_subscribers', 'newsletter_subscribers', row => ({
    columns: ['email', 'status', 'subscribed_at', 'unsubscribed_at', 'source'],
    values: [
      row.email, row.status || 'active',
      row.subscribed_at || row.created_at || new Date().toISOString(),
      row.unsubscribed_at || null,
      row.source || 'supabase-migration',
    ],
  }));

  // Editorial log
  await migrateTable<any>('editorial_log', 'editorial_log', row => ({
    columns: ['article_slug', 'action', 'details', 'performed_by', 'created_at'],
    values: [
      row.article_slug || row.article_id || 'unknown',
      row.action || 'unknown',
      row.details || null,
      row.performed_by || 'system',
      row.created_at || new Date().toISOString(),
    ],
  }));

  // Reactions (if table exists)
  await migrateTable<any>('reactions', 'reactions', row => ({
    columns: ['article_slug', 'reaction_type', 'count'],
    values: [
      row.article_slug || row.article_id || 'unknown',
      row.reaction_type || row.type || 'fire',
      row.count || 1,
    ],
  }));

  // Quiz submissions (if table exists)
  await migrateTable<any>('quiz_submissions', 'quiz_submissions', row => ({
    columns: ['quiz_id', 'user_session', 'answers', 'score', 'submitted_at'],
    values: [
      row.quiz_id || 'unknown',
      row.user_session || row.user_id || null,
      JSON.stringify(row.answers || {}),
      row.score || 0,
      row.submitted_at || row.created_at || new Date().toISOString(),
    ],
  }));

  // DMCA requests (if table exists)
  await migrateTable<any>('dmca_requests', 'dmca_requests', row => ({
    columns: ['complainant_name', 'complainant_email', 'infringing_url', 'original_url',
              'description', 'good_faith', 'accuracy', 'signature', 'submitted_at', 'status'],
    values: [
      row.complainant_name || 'Unknown', row.complainant_email || 'unknown',
      row.infringing_url || '', row.original_url || null, row.description || null,
      row.good_faith || false, row.accuracy || false, row.signature || null,
      row.submitted_at || row.created_at || new Date().toISOString(),
      row.status || 'pending',
    ],
  }));

  // Data requests (if table exists)
  await migrateTable<any>('data_requests', 'data_requests', row => ({
    columns: ['email', 'request_type', 'details', 'submitted_at', 'status'],
    values: [
      row.email || '', row.request_type || 'access', row.details || null,
      row.submitted_at || row.created_at || new Date().toISOString(),
      row.status || 'pending',
    ],
  }));

  console.log('\n' + '─'.repeat(60));
  console.log('[migrate-tips] Done.');
  console.log('─'.repeat(60));

  await pool.end();
}

main().catch(err => {
  console.error('[migrate-tips] Unhandled error:', err);
  process.exit(1);
});
