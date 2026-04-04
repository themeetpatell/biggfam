import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    if (req.method === 'GET') {
      const { family_id, month, year } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const expenses = await query(
        `SELECT e.*, u.name AS paid_by_name,
                COALESCE(
                  json_agg(
                    json_build_object('user_id', s.user_id, 'amount', s.amount, 'settled', s.settled)
                  ) FILTER (WHERE s.id IS NOT NULL), '[]'
                ) AS splits
         FROM expenses e
         LEFT JOIN users u ON u.id = e.paid_by
         LEFT JOIN expense_splits s ON s.expense_id = e.id
         WHERE e.family_id = $1
           AND ($2::int IS NULL OR EXTRACT(MONTH FROM e.expense_date) = $2)
           AND ($3::int IS NULL OR EXTRACT(YEAR  FROM e.expense_date) = $3)
         GROUP BY e.id, u.name
         ORDER BY e.expense_date DESC`,
        [family_id, month ?? null, year ?? null]
      )
      const [totals] = await query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE family_id = $1
           AND ($2::int IS NULL OR EXTRACT(MONTH FROM expense_date) = $2)
           AND ($3::int IS NULL OR EXTRACT(YEAR  FROM expense_date) = $3)`,
        [family_id, month ?? null, year ?? null]
      )
      return res.status(200).json({ expenses, total: totals.total })
    }

    if (req.method === 'POST') {
      const { family_id, title, amount, category, payment_mode, note, expense_date, splits } = req.body
      if (!family_id || !title || !amount) return res.status(400).json({ error: 'family_id, title, amount required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const expense = await queryOne(
        `INSERT INTO expenses (family_id, paid_by, title, amount, category, payment_mode, note, expense_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [family_id, userId, title, amount, category ?? 'other',
         payment_mode ?? 'upi', note ?? null, expense_date ?? new Date().toISOString().slice(0, 10)]
      )
      if (splits?.length) {
        for (const s of splits) {
          await query(
            'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES ($1,$2,$3)',
            [expense.id, s.user_id, s.amount]
          )
        }
      }
      return res.status(201).json({ expense })
    }

    if (req.method === 'PATCH') {
      const { split_id } = req.query
      if (!split_id) return res.status(400).json({ error: 'split_id required' })
      const split = await queryOne(
        'UPDATE expense_splits SET settled = true, settled_at = now() WHERE id = $1 RETURNING *',
        [split_id]
      )
      return res.status(200).json({ split })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/expenses]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
