import * as db from './_lib/db.js'

/**
 * Health check endpoint - no auth required
 * Performs a lightweight DB ping and returns system status
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Lightweight DB ping
    await db.query('SELECT 1')

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'ok',
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      db: 'unreachable',
    })
  }
}
