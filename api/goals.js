import { query, queryOne } from './_lib/db.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')

  try {
    if (req.method === 'GET') {
      const { family_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })

      const goals = await query(
        `SELECT g.*,
                COALESCE(
                  json_agg(
                    json_build_object('user_id', c.user_id, 'amount', c.amount, 'note', c.note, 'at', c.contributed_at)
                    ORDER BY c.contributed_at DESC
                  ) FILTER (WHERE c.id IS NOT NULL), '[]'
                ) AS contributions
         FROM family_goals g
         LEFT JOIN goal_contributions c ON c.goal_id = g.id
         WHERE g.family_id = $1
         GROUP BY g.id
         ORDER BY g.created_at DESC`,
        [family_id]
      )
      return res.status(200).json({ goals })
    }

    if (req.method === 'POST') {
      const { type } = req.query

      if (type === 'contribution') {
        const { goal_id, user_id, amount, note } = req.body
        if (!goal_id || !amount) return res.status(400).json({ error: 'goal_id and amount required' })

        const contribution = await queryOne(
          `INSERT INTO goal_contributions (goal_id, user_id, amount, note) VALUES ($1,$2,$3,$4) RETURNING *`,
          [goal_id, user_id ?? null, amount, note ?? null]
        )
        // Update current_amount
        await query(
          `UPDATE family_goals SET current_amount = current_amount + $2 WHERE id = $1`,
          [goal_id, amount]
        )
        return res.status(201).json({ contribution })
      }

      const { family_id, created_by, title, description, target_amount, currency, target_date } = req.body
      if (!family_id || !title || !target_amount) return res.status(400).json({ error: 'family_id, title, target_amount required' })

      const goal = await queryOne(
        `INSERT INTO family_goals (family_id, created_by, title, description, target_amount, currency, target_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [family_id, created_by ?? null, title, description ?? null, target_amount, currency ?? 'INR', target_date ?? null]
      )
      return res.status(201).json({ goal })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/goals]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
