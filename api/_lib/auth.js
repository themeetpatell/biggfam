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

  const user = await queryOne('SELECT id FROM users WHERE clerk_id = $1', [clerkUserId])
  if (!user) {
    res.status(401).json({ error: 'User not found — complete sign-up first' })
    return null
  }

  return user.id
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
