import pg from 'pg'
const { Pool } = pg

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

/**
 * Run a parameterized query and return all rows.
 * Usage: const rows = await query('SELECT * FROM users WHERE id = $1', [id])
 */
export async function query(text, params = []) {
  const { rows } = await pool.query(text, params)
  return rows
}

/**
 * Run a parameterized query and return the first row (or null).
 */
export async function queryOne(text, params = []) {
  const { rows } = await pool.query(text, params)
  return rows[0] ?? null
}
