import { query, queryOne } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method === 'GET') {
      const { id, email, phone } = req.query
      if (!id && !email && !phone) return res.status(400).json({ error: 'id, email, or phone required' })

      const user = await queryOne(
        `SELECT * FROM users WHERE id = $1 OR email = $2 OR phone = $3 LIMIT 1`,
        [id ?? null, email ?? null, phone ?? null]
      )
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ user })
    }

    if (req.method === 'POST') {
      const { name, email, phone, preferred_lang, avatar_url } = req.body
      if (!name || (!email && !phone)) return res.status(400).json({ error: 'name and email or phone required' })

      const user = await queryOne(
        `INSERT INTO users (name, email, phone, preferred_lang, avatar_url)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
         RETURNING *`,
        [name, email ?? null, phone ?? null, preferred_lang ?? 'en', avatar_url ?? null]
      )
      return res.status(201).json({ user })
    }

    if (req.method === 'PATCH') {
      const { id } = req.query
      const { name, preferred_lang, avatar_url } = req.body
      if (!id) return res.status(400).json({ error: 'id required' })

      const user = await queryOne(
        `UPDATE users SET
           name = COALESCE($2, name),
           preferred_lang = COALESCE($3, preferred_lang),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = now()
         WHERE id = $1 RETURNING *`,
        [id, name ?? null, preferred_lang ?? null, avatar_url ?? null]
      )
      return res.status(200).json({ user })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/users]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
