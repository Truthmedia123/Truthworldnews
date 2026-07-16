/**
 * src/lib/postgres.ts
 *
 * Postgres connection pool for non-article data.
 *
 * Used for:
 * - tips (anonymous tip line)
 * - reactions (article reactions)
 * - newsletter_subscribers (parallel to listmonk — for in-site captures)
 * - editorial_log (compliance audit trail)
 * - dmca_requests, data_requests (legal workflows)
 * - quiz_submissions (quiz engine)
 *
 * Articles live in Ghost, NOT here.
 *
 * Connection: POSTGRES_URL env var (e.g., postgres://twn:pass@postgres:5432/twn)
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  // ssl: { rejectUnauthorized: false }  // enable if Postgres is remote w/ TLS
});

pool.on('error', (err) => {
  console.error('[postgres] Pool error:', err);
});

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

/**
 * Run a parameterized query. Returns the full result.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params as any);
  } finally {
    client.release();
  }
}

/**
 * Run a query and return the first row, or null.
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const res = await query<T>(text, params);
  return res.rows[0] ?? null;
}

/**
 * Run a query and return all rows.
 */
export async function queryMany<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await query<T>(text, params);
  return res.rows;
}

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export interface Tip {
  id: string;
  title: string;
  story: string;
  evidence_url?: string | null;
  submitted_at: string;
  reviewed: boolean;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface Reaction {
  article_slug: string;
  reaction_type: 'fire' | 'mind_blown' | 'fake_news' | 'boring' | 'agree' | 'disagree';
  count: number;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  unsubscribed_at?: string | null;
  source: string;
}

export interface EditorialLogEntry {
  id: string;
  article_slug: string;
  action: string;
  details?: string | null;
  performed_by: string;
  created_at: string;
}

export interface DmcaRequest {
  id: string;
  complainant_name: string;
  complainant_email: string;
  infringing_url: string;
  original_url?: string | null;
  description?: string | null;
  good_faith: boolean;
  accuracy: boolean;
  signature?: string | null;
  submitted_at: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
}

export interface DataRequest {
  id: string;
  email: string;
  request_type: 'access' | 'deletion' | 'correction' | 'export';
  details?: string | null;
  submitted_at: string;
  status: 'pending' | 'reviewing' | 'resolved';
}

// ---------------------------------------------------------------------------
// Convenience methods
// ---------------------------------------------------------------------------

// Tips -----------------------------------------------------------------------

export async function createTip(input: { title: string; story: string; evidence_url?: string }) {
  const row = await queryOne<Tip>(
    `INSERT INTO tips (title, story, evidence_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.title, input.story, input.evidence_url ?? null],
  );
  return row;
}

export async function listTips(limit = 50) {
  return queryMany<Tip>(
    `SELECT * FROM tips ORDER BY submitted_at DESC LIMIT $1`,
    [limit],
  );
}

// Reactions ------------------------------------------------------------------

export async function addReaction(articleSlug: string, reactionType: Reaction['reaction_type']) {
  // Upsert: increment count if exists, insert if not
  await query(
    `INSERT INTO reactions (article_slug, reaction_type, count)
     VALUES ($1, $2, 1)
     ON CONFLICT (article_slug, reaction_type)
     DO UPDATE SET count = reactions.count + 1`,
    [articleSlug, reactionType],
  );
}

export async function getReactionsForArticle(articleSlug: string): Promise<Reaction[]> {
  return queryMany<Reaction>(
    `SELECT article_slug, reaction_type, count
     FROM reactions WHERE article_slug = $1`,
    [articleSlug],
  );
}

// Newsletter -----------------------------------------------------------------

export async function addSubscriber(email: string, source = 'site-footer') {
  await query(
    `INSERT INTO newsletter_subscribers (email, source)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING`,
    [email, source],
  );
}

export async function listSubscribers(limit = 100) {
  return queryMany<NewsletterSubscriber>(
    `SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC LIMIT $1`,
    [limit],
  );
}

// Editorial log --------------------------------------------------------------

export async function logEditorialAction(input: {
  article_slug: string;
  action: string;
  details?: string;
  performed_by?: string;
}) {
  await query(
    `INSERT INTO editorial_log (article_slug, action, details, performed_by)
     VALUES ($1, $2, $3, $4)`,
    [input.article_slug, input.action, input.details ?? null, input.performed_by ?? 'system'],
  );
}

export async function listEditorialLog(articleSlug?: string, limit = 100) {
  if (articleSlug) {
    return queryMany<EditorialLogEntry>(
      `SELECT * FROM editorial_log WHERE article_slug = $1 ORDER BY created_at DESC LIMIT $2`,
      [articleSlug, limit],
    );
  }
  return queryMany<EditorialLogEntry>(
    `SELECT * FROM editorial_log ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
}

// DMCA -----------------------------------------------------------------------

export async function createDmcaRequest(input: Omit<DmcaRequest, 'id' | 'submitted_at' | 'status'>) {
  return queryOne<DmcaRequest>(
    `INSERT INTO dmca_requests
      (complainant_name, complainant_email, infringing_url, original_url,
       description, good_faith, accuracy, signature)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      input.complainant_name, input.complainant_email, input.infringing_url,
      input.original_url ?? null, input.description ?? null,
      input.good_faith, input.accuracy, input.signature ?? null,
    ],
  );
}

// Data requests --------------------------------------------------------------

export async function createDataRequest(input: {
  email: string;
  request_type: DataRequest['request_type'];
  details?: string;
}) {
  return queryOne<DataRequest>(
    `INSERT INTO data_requests (email, request_type, details)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.email, input.request_type, input.details ?? null],
  );
}

// Health check ---------------------------------------------------------------

export async function pingPostgres(): Promise<boolean> {
  try {
    const res = await query('SELECT 1');
    return res.rowCount === 1;
  } catch {
    return false;
  }
}

// Cleanup --------------------------------------------------------------------

export async function closePool(): Promise<void> {
  await pool.end();
}
