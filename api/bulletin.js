import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    if (req.method === 'GET') {
      const { family_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const posts = await query(
        `SELECT p.*, u.name AS author_name
         FROM bulletin_posts p
         LEFT JOIN users u ON u.id = p.author_id
         WHERE p.family_id = $1
         ORDER BY p.pinned DESC, p.created_at DESC`,
        [family_id]
      )
      return res.status(200).json({ posts })
    }

    if (req.method === 'POST') {
      const { family_id, post_type, title, body, pinned, due_date, assigned_to } = req.body
      if (!family_id || !title) return res.status(400).json({ error: 'family_id and title required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const post = await queryOne(
        `INSERT INTO bulletin_posts (family_id, author_id, post_type, title, body, pinned, due_date, assigned_to)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [family_id, userId, post_type ?? 'announcement', title,
         body ?? null, pinned ?? false, due_date ?? null, assigned_to ?? null]
      )
      return res.status(201).json({ post })
    }

    if (req.method === 'PATCH') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const existing = await queryOne('SELECT family_id FROM bulletin_posts WHERE id = $1', [id])
      if (!existing) return res.status(404).json({ error: 'Post not found' })
      if (!await requireFamilyMember(req, res, existing.family_id, userId)) return

      const { pinned, completed } = req.body
      const post = await queryOne(
        `UPDATE bulletin_posts SET
           pinned = COALESCE($2, pinned),
           completed = COALESCE($3, completed)
         WHERE id = $1 RETURNING *`,
        [id, pinned ?? null, completed ?? null]
      )
      return res.status(200).json({ post })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const existing = await queryOne('SELECT author_id FROM bulletin_posts WHERE id = $1', [id])
      if (!existing) return res.status(404).json({ error: 'Post not found' })
      if (existing.author_id !== userId) return res.status(403).json({ error: 'Only the author can delete' })
      await query('DELETE FROM bulletin_posts WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/bulletin]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
