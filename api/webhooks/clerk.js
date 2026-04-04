import { Webhook } from 'svix'
import { query } from '../_lib/db.js'

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  const rawBody = await getRawBody(req)

  const wh = new Webhook(secret)
  let event
  try {
    event = wh.verify(rawBody, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    })
  } catch (err) {
    console.error('[webhook/clerk] Signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const { type, data } = event

  if (type === 'user.created') {
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Family Member'
    const email = data.email_addresses?.[0]?.email_address ?? null
    const avatar = data.image_url ?? null

    await query(
      `INSERT INTO users (clerk_id, name, email, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (clerk_id) DO UPDATE SET name = $2, email = $3, avatar_url = $4`,
      [data.id, name, email, avatar]
    )
  }

  if (type === 'user.updated') {
    const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Family Member'
    const email = data.email_addresses?.[0]?.email_address ?? null
    const avatar = data.image_url ?? null

    await query(
      `UPDATE users SET name = $2, email = $3, avatar_url = $4 WHERE clerk_id = $1`,
      [data.id, name, email, avatar]
    )
  }

  return res.status(200).json({ received: true })
}
