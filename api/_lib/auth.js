import { createClerkClient } from '@clerk/backend'
import { queryOne } from './db.js'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

/**
 * Verifies the Bearer token and returns the internal user UUID.
 * Returns null and sends 401 if auth fails — caller must `return` after null check.
 *
 * Usage:
 *   const userId = await requireAuth(req, res)
 *   if (!userId) return
 */
export async function requireAuth(req, res) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  let clerkUserId
  try {
    const payload = await clerkClient.verifyToken(token)
    clerkUserId = payload.sub
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }

  try {
    let user = await queryOne('SELECT id FROM users WHERE clerk_id = $1', [clerkUserId])

    if (!user) {
      // Auto-provision: webhook may not have fired yet for new sign-ups
      const clerkUser = await clerkClient.users.getUser(clerkUserId)
      const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() ||
        clerkUser.username ||
        'Family Member'
      const avatarUrl = clerkUser.imageUrl ?? null

      user = await queryOne(
        `INSERT INTO users (clerk_id, name, email, avatar_url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (clerk_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
         RETURNING id`,
        [clerkUserId, name, email, avatarUrl]
      )
    }

    return user.id
  } catch (err) {
    console.error('[requireAuth] DB error:', err.message)
    res.status(500).json({ error: `DB error: ${err.message}` })
    return null
  }
}

/**
 * Checks that userId is a member of familyId.
 * Returns false and sends 403 if not a member.
 */
export async function requireFamilyMember(req, res, familyId, userId) {
  const member = await queryOne(
    'SELECT id FROM family_members WHERE family_id = $1 AND user_id = $2',
    [familyId, userId]
  )
  if (!member) {
    res.status(403).json({ error: 'Access denied — not a member of this family' })
    return false
  }
  return true
}
