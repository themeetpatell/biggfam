import crypto from 'crypto'
import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    // GET /api/families — list families for current user
    if (req.method === 'GET' && !req.query.action) {
      const families = await query(
        `SELECT f.*, fm.role, fm.relationship
         FROM families f
         JOIN family_members fm ON fm.family_id = f.id
         WHERE fm.user_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
      )
      return res.status(200).json({ families })
    }

    // GET /api/families?action=members&family_id=... — list members
    if (req.method === 'GET' && req.query.action === 'members') {
      const { family_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const members = await query(
        `SELECT u.id, u.name, u.avatar_url, u.email, fm.role, fm.relationship, fm.joined_at
         FROM family_members fm
         JOIN users u ON u.id = fm.user_id
         WHERE fm.family_id = $1
         ORDER BY fm.joined_at ASC`,
        [family_id]
      )
      return res.status(200).json({ members })
    }

    // GET /api/families?action=invite-info&token=... — validate invite token
    if (req.method === 'GET' && req.query.action === 'invite-info') {
      const { token } = req.query
      if (!token) return res.status(400).json({ error: 'token required' })

      const invite = await queryOne(
        `SELECT it.*, f.name AS family_name
         FROM invite_tokens it
         JOIN families f ON f.id = it.family_id
         WHERE it.token = $1 AND it.used_at IS NULL AND it.expires_at > now()`,
        [token]
      )
      if (!invite) return res.status(404).json({ error: 'Invite link is invalid or expired' })
      return res.status(200).json({ family_name: invite.family_name, family_id: invite.family_id })
    }

    // POST /api/families — create family
    if (req.method === 'POST' && !req.query.action) {
      const { name, city } = req.body
      if (!name) return res.status(400).json({ error: 'name required' })

      const family = await queryOne(
        'INSERT INTO families (name, city, created_by) VALUES ($1, $2, $3) RETURNING *',
        [name, city ?? null, userId]
      )
      await query(
        `INSERT INTO family_members (family_id, user_id, role, relationship) VALUES ($1, $2, 'admin', 'Founder')`,
        [family.id, userId]
      )
      return res.status(201).json({ family })
    }

    // POST /api/families?action=invite — generate invite token
    if (req.method === 'POST' && req.query.action === 'invite') {
      const { family_id } = req.body
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await query(
        'INSERT INTO invite_tokens (family_id, created_by, token, expires_at) VALUES ($1, $2, $3, $4)',
        [family_id, userId, token, expiresAt.toISOString()]
      )
      return res.status(201).json({ token })
    }

    // POST /api/families?action=join — accept invite token
    if (req.method === 'POST' && req.query.action === 'join') {
      const { token } = req.body
      if (!token) return res.status(400).json({ error: 'token required' })

      const invite = await queryOne(
        'SELECT * FROM invite_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > now()',
        [token]
      )
      if (!invite) return res.status(404).json({ error: 'Invite link is invalid or expired' })

      // Check if already a member
      const existing = await queryOne(
        'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2',
        [invite.family_id, userId]
      )
      if (!existing) {
        await query(
          `INSERT INTO family_members (family_id, user_id, role) VALUES ($1, $2, 'member')`,
          [invite.family_id, userId]
        )
      }

      await query('UPDATE invite_tokens SET used_at = now() WHERE id = $1', [invite.id])

      const family = await queryOne('SELECT * FROM families WHERE id = $1', [invite.family_id])
      return res.status(200).json({ family })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/families]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
