import { query, queryOne } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method === 'GET') {
      const { family_id, from, to } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })

      const events = await query(
        `SELECT e.*, u.name AS created_by_name
         FROM calendar_events e
         LEFT JOIN users u ON u.id = e.created_by
         WHERE e.family_id = $1
           AND ($2::timestamptz IS NULL OR e.start_time >= $2)
           AND ($3::timestamptz IS NULL OR e.start_time <= $3)
         ORDER BY e.start_time ASC`,
        [family_id, from ?? null, to ?? null]
      )
      return res.status(200).json({ events })
    }

    if (req.method === 'POST') {
      const { family_id, created_by, title, description, event_type, start_time, end_time, all_day, location, reminder_min } = req.body
      if (!family_id || !title || !start_time) return res.status(400).json({ error: 'family_id, title, start_time required' })

      const event = await queryOne(
        `INSERT INTO calendar_events
           (family_id, created_by, title, description, event_type, start_time, end_time, all_day, location, reminder_min)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [family_id, created_by ?? null, title, description ?? null, event_type ?? 'general',
         start_time, end_time ?? null, all_day ?? false, location ?? null, reminder_min ?? 60]
      )
      return res.status(201).json({ event })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      await query(`DELETE FROM calendar_events WHERE id = $1`, [id])
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/events]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
