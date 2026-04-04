import { query } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const userId = await requireAuth(req, res)
  if (!userId) return

  const { family_id } = req.query
  if (!family_id) return res.status(400).json({ error: 'family_id required' })
  if (!await requireFamilyMember(req, res, family_id, userId)) return

  try {
    const now = new Date()
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [events, pinnedPosts, expenseTotals, goals] = await Promise.all([
      // Upcoming events (next 7 days, max 5)
      query(
        `SELECT id, title, event_type, start_time, location
         FROM calendar_events
         WHERE family_id = $1 AND start_time >= $2 AND start_time <= $3
         ORDER BY start_time ASC LIMIT 5`,
        [family_id, now.toISOString(), sevenDaysLater.toISOString()]
      ),
      // Pinned bulletin posts (max 3)
      query(
        `SELECT id, title, post_type, created_at FROM bulletin_posts
         WHERE family_id = $1 AND pinned = true
         ORDER BY created_at DESC LIMIT 3`,
        [family_id]
      ),
      // Current month expense total
      query(
        `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
         WHERE family_id = $1 AND expense_date >= $2`,
        [family_id, monthStart.toISOString().slice(0, 10)]
      ),
      // Top 2 active goals
      query(
        `SELECT id, title, target_amount, current_amount, target_date, status
         FROM family_goals
         WHERE family_id = $1 AND status = 'active'
         ORDER BY created_at ASC LIMIT 2`,
        [family_id]
      ),
    ])

    return res.status(200).json({
      events,
      pinnedPosts,
      monthlyExpenseTotal: expenseTotals[0]?.total ?? 0,
      goals,
    })
  } catch (err) {
    console.error('[api/dashboard]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
