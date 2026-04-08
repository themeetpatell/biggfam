import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

function validateRequired(val, name) {
  if (!val || (typeof val === 'string' && !val.trim())) {
    return `${name} is required`
  }
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    if (req.method === 'GET') {
      const { family_id, owner_id, doc_type } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const docs = await query(
        `SELECT d.*, u.name AS owner_name
         FROM documents d
         LEFT JOIN users u ON u.id = d.owner_id
         WHERE d.family_id = $1
           AND ($2::uuid IS NULL OR d.owner_id = $2)
           AND ($3::text IS NULL OR d.doc_type = $3)
         ORDER BY d.expiry_date ASC NULLS LAST, d.created_at DESC`,
        [family_id, owner_id ?? null, doc_type ?? null]
      )

      // Flag expiring soon (within 90 days)
      const withFlags = docs.map(d => ({
        ...d,
        expiring_soon: d.expiry_date
          ? new Date(d.expiry_date) < new Date(Date.now() + 90 * 86400 * 1000)
          : false
      }))
      return res.status(200).json({ documents: withFlags })
    }

    if (req.method === 'POST') {
      const { family_id, owner_id, doc_type, title, document_url, expiry_date, notes } = req.body

      if (!family_id) return res.status(400).json({ error: 'family_id is required' })

      const docTypeErr = validateRequired(doc_type, 'doc_type')
      if (docTypeErr) return res.status(400).json({ error: docTypeErr })

      if (document_url && !document_url.startsWith('http')) {
        return res.status(400).json({ error: 'document_url must start with http' })
      }

      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const doc = await queryOne(
        `INSERT INTO documents (family_id, owner_id, doc_type, title, document_url, expiry_date, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [family_id, owner_id ?? userId, doc_type, title, document_url ?? null, expiry_date ?? null, notes ?? null]
      )
      return res.status(201).json({ document: doc })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const existing = await queryOne('SELECT family_id FROM documents WHERE id = $1', [id])
      if (!existing) return res.status(404).json({ error: 'Document not found' })
      if (!await requireFamilyMember(req, res, existing.family_id, userId)) return
      await query('DELETE FROM documents WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/documents]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
