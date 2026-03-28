import { query, queryOne } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method === 'GET') {
      const { family_id, member_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })

      const [records, medications] = await Promise.all([
        query(
          `SELECT h.*, u.name AS member_name
           FROM health_records h
           LEFT JOIN users u ON u.id = h.member_id
           WHERE h.family_id = $1 AND ($2::uuid IS NULL OR h.member_id = $2)
           ORDER BY h.record_date DESC`,
          [family_id, member_id ?? null]
        ),
        query(
          `SELECT m.*, u.name AS member_name
           FROM medications m
           LEFT JOIN users u ON u.id = m.member_id
           WHERE m.family_id = $1 AND ($2::uuid IS NULL OR m.member_id = $2)
             AND m.active = true
           ORDER BY m.name ASC`,
          [family_id, member_id ?? null]
        )
      ])
      return res.status(200).json({ records, medications })
    }

    if (req.method === 'POST') {
      const { type } = req.query  // ?type=record or ?type=medication

      if (type === 'medication') {
        const { family_id, member_id, name, dosage, frequency, times, start_date, end_date, notes } = req.body
        if (!family_id || !name) return res.status(400).json({ error: 'family_id and name required' })
        const med = await queryOne(
          `INSERT INTO medications (family_id, member_id, name, dosage, frequency, times, start_date, end_date, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
          [family_id, member_id ?? null, name, dosage ?? null, frequency ?? 'daily',
           times ?? null, start_date ?? null, end_date ?? null, notes ?? null]
        )
        return res.status(201).json({ medication: med })
      }

      // Default: health record
      const { family_id, member_id, record_type, title, doctor_name, hospital, document_url, notes, record_date } = req.body
      if (!family_id || !title) return res.status(400).json({ error: 'family_id and title required' })
      const record = await queryOne(
        `INSERT INTO health_records (family_id, member_id, record_type, title, doctor_name, hospital, document_url, notes, record_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [family_id, member_id ?? null, record_type ?? 'general', title,
         doctor_name ?? null, hospital ?? null, document_url ?? null, notes ?? null, record_date ?? null]
      )
      return res.status(201).json({ record })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/health]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
