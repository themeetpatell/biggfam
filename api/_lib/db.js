import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// neon() returns a tagged-template sql function.
// For parameterized queries, use sql.query(text, params).
export const sql = neon(process.env.DATABASE_URL)

/**
 * Run a parameterized query and return all rows.
 * Usage: const rows = await query('SELECT * FROM users WHERE id = $1', [id])
 */
export async function query(text, params = []) {
  return sql.query(text, params)
}

/**
 * Run a parameterized query and return the first row (or null).
 */
export async function queryOne(text, params = []) {
  const rows = await sql.query(text, params)
  return rows[0] ?? null
}
