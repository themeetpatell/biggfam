import { query, queryOne } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method === 'GET') {
      const { user_id } = req.query
      if (!user_id) return res.status(400).json({ error: 'user_id required' })

      const families = await query(
        `SELECT f.*, fm.role, fm.relationship
         FROM families f
         JOIN family_members fm ON fm.family_id = f.id
         WHERE fm.user_id = $1
         ORDER BY f.created_at DESC`,
        [user_id]
      )
      return res.status(200).json({ families })
    }

    if (req.method === 'POST') {
      const { name, city, created_by } = req.body
      if (!name || !created_by) return res.status(400).json({ error: 'name and created_by required' })

      const family = await queryOne(
        `INSERT INTO families (name, city, created_by) VALUES ($1, $2, $3) RETURNING *`,
        [name, city ?? null, created_by]
      )
      // Add creator as admin
      await query(
        `INSERT INTO family_members (family_id, user_id, role, relationship) VALUES ($1, $2, 'admin', 'Founder')`,
        [family.id, created_by]
      )
      return res.status(201).json({ family })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/families]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
