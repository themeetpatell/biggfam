# BiggFam Launch Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the BiggFam MVP from a localStorage-auth, hardcoded-data facade into a launch-ready SaaS with real Clerk auth, live Neon DB wiring, mobile-first navigation, and all 8 feature sections operational.

**Architecture:** React 19 + Vite SPA. `FamilyApp.jsx` (3,339-line monolith) is split into a shell + `FamilyContext` + 6 custom hooks + 9 section components. Clerk handles auth (frontend `<ClerkProvider>` + backend JWT verification via `requireAuth()`). All API handlers are secured. Gemini AI is renamed Maahi. No Tailwind/shadcn — keep existing CSS system, extend it.

**Tech Stack:** React 19, Vite 7, Vercel Functions (Node.js), Neon PostgreSQL, `@clerk/react`, `@clerk/backend`, `svix`, `@google/generative-ai`

**All paths are relative to `/Users/themeetpatel/Startups/biggFam/`**

---

## File Map — What Gets Created or Modified

### New files
```
api/_lib/auth.js                    ← requireAuth() helper
api/webhooks/clerk.js               ← user.created / user.updated sync
api/dashboard.js                    ← aggregate endpoint (home widget data)
src/contexts/FamilyContext.jsx      ← family + members state, maahiContext string
src/hooks/useBulletin.js
src/hooks/useExpenses.js
src/hooks/useEvents.js
src/hooks/useGoals.js
src/hooks/useDocuments.js
src/hooks/useHealth.js
src/sections/HomeSection.jsx
src/sections/BulletinSection.jsx
src/sections/WealthSection.jsx
src/sections/CalendarSection.jsx
src/sections/CareSection.jsx
src/sections/GoalsSection.jsx
src/sections/DocumentsSection.jsx   ← currently missing entirely
src/sections/MemorySection.jsx
src/sections/SettingsSection.jsx
src/sections/MaahiAI.jsx            ← renamed from MaahiAI.jsx
src/sections/MaahiAI.css            ← renamed from MaahiAI.css
src/components/ErrorBoundary.jsx
src/components/EmptyState.jsx
src/components/SectionSkeleton.jsx
src/components/Toast.jsx
src/components/ScrollToTop.jsx
src/components/Onboarding.jsx
db/migrations/002_clerk_invite.sql  ← clerk_id + invite_tokens + completed col
```

### Modified files
```
package.json                    ← add @clerk/react @clerk/backend svix
src/main.jsx                    ← ClerkProvider wrap, new RequireAuth
src/Auth.jsx                    ← replace fake form with Clerk SignIn/SignUp
src/FamilyApp.jsx               ← gutted to ~150-line shell
src/lib/api.js                  ← add token param to all functions
api/users.js                    ← add requireAuth + family check
api/families.js                 ← add requireAuth + members endpoint + invite endpoints
api/bulletin.js                 ← add requireAuth + family check
api/expenses.js                 ← add requireAuth + family check
api/events.js                   ← add requireAuth + family check
api/health.js                   ← add requireAuth + family check
api/documents.js                ← add requireAuth + family check
api/goals.js                    ← add requireAuth + family check
api/ai/chat.js                  ← Maahi AI prompt (renamed from Dadi)
```

---

## Phase 1 — Foundation: Dependencies & DB

### Task 1: Install dependencies + run DB migration

**Files:**
- Modify: `package.json`
- Create: `db/migrations/002_clerk_invite.sql`

- [ ] **Step 1: Install Clerk + svix**

```bash
cd /Users/themeetpatel/Startups/biggFam
npm install @clerk/react @clerk/backend svix
```

Expected: `package.json` now lists `@clerk/react`, `@clerk/backend`, `svix` in dependencies. No errors.

- [ ] **Step 2: Create DB migration file**

Create `db/migrations/002_clerk_invite.sql`:

```sql
-- Add clerk_id to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add completed flag to bulletin_posts (for task-type posts)
ALTER TABLE bulletin_posts ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;

-- Invite tokens table (for family member invite flow)
CREATE TABLE IF NOT EXISTS invite_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES users(id),
  token       VARCHAR(64) UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);

-- Add preferred_currency to families (INR default)
ALTER TABLE families ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10) NOT NULL DEFAULT 'INR';

-- Index for bulletin pinned posts (dashboard performance)
CREATE INDEX IF NOT EXISTS idx_bulletin_pinned ON bulletin_posts(family_id, pinned);
```

- [ ] **Step 3: Run the migration**

Check that `db/migrate.js` exists, then run:

```bash
node db/migrate.js
```

If `db/migrate.js` doesn't handle the migration directory, run it directly:
```bash
node -e "
import('@neondatabase/serverless').then(({neon}) => {
  const fs = await import('fs');
  const sql = neon(process.env.DATABASE_URL);
  const migration = fs.readFileSync('db/migrations/002_clerk_invite.sql', 'utf8');
  await sql(migration);
  console.log('Migration complete');
});
"
```

Or use the Neon console SQL editor to paste and run `002_clerk_invite.sql` directly.

- [ ] **Step 4: Update .env.local with required keys**

Add to `.env.local` (get values from Clerk dashboard at clerk.com → API Keys):

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_<your-key>
CLERK_SECRET_KEY=sk_test_<your-key>
CLERK_WEBHOOK_SECRET=whsec_<fill-in-after-task-3>
GEMINI_API_KEY=<your-gemini-key>
```

> Note: `VITE_` prefix is mandatory for Vite to expose the key to the frontend. `CLERK_SECRET_KEY` must NOT have `VITE_` prefix — server only.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json db/migrations/002_clerk_invite.sql
git commit -m "chore: add Clerk deps + DB migration for clerk_id and invite_tokens"
```

---

## Phase 2 — Backend: requireAuth + secure all API handlers

### Task 2: Create `api/_lib/auth.js`

**Files:**
- Create: `api/_lib/auth.js`

- [ ] **Step 1: Create the auth helper**

Create `api/_lib/auth.js`:

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/auth.js
git commit -m "feat: add requireAuth and requireFamilyMember helpers"
```

---

### Task 3: Create Clerk webhook handler

**Files:**
- Create: `api/webhooks/clerk.js`

- [ ] **Step 1: Create the webhook handler**

Create `api/webhooks/clerk.js`:

```js
import { Webhook } from 'svix'
import { query, queryOne } from '../_lib/db.js'

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
```

- [ ] **Step 2: Register in vercel.json**

Read the current `vercel.json`. It likely has a routes/rewrites config. Add the webhook endpoint so it bypasses body-parser:

Open `vercel.json` and verify `api/webhooks/clerk.js` is reachable at `/api/webhooks/clerk`. The default Vercel file-based routing handles this automatically.

- [ ] **Step 3: Register webhook in Clerk dashboard**

1. Deploy to Vercel (or use your current deployment URL)
2. In Clerk Dashboard → Webhooks → Add Endpoint
3. URL: `https://YOUR_DOMAIN/api/webhooks/clerk`
4. Subscribe to: `user.created`, `user.updated`
5. Copy the Signing Secret → add to `.env.local` as `CLERK_WEBHOOK_SECRET=whsec_...`
6. Also add to Vercel environment variables

- [ ] **Step 4: Commit**

```bash
git add api/webhooks/clerk.js
git commit -m "feat: Clerk webhook handler — sync user.created/updated to users table"
```

---

### Task 4: Secure all 8 API handlers

**Files:**
- Modify: `api/users.js`, `api/families.js`, `api/bulletin.js`, `api/expenses.js`, `api/events.js`, `api/health.js`, `api/documents.js`, `api/goals.js`

The pattern for every handler is:
1. `import { requireAuth, requireFamilyMember } from './_lib/auth.js'`
2. `const userId = await requireAuth(req, res); if (!userId) return`
3. For data endpoints with `family_id`: verify membership
4. Remove `user_id`/`author_id`/`created_by` from `req.body` — use `userId` from step 2

- [ ] **Step 1: Secure `api/bulletin.js`**

Replace entire `api/bulletin.js` with:

```js
import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    if (req.method === 'GET') {
      const { family_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const posts = await query(
        `SELECT p.*, u.name AS author_name
         FROM bulletin_posts p
         LEFT JOIN users u ON u.id = p.author_id
         WHERE p.family_id = $1
         ORDER BY p.pinned DESC, p.created_at DESC`,
        [family_id]
      )
      return res.status(200).json({ posts })
    }

    if (req.method === 'POST') {
      const { family_id, post_type, title, body, pinned, due_date, assigned_to } = req.body
      if (!family_id || !title) return res.status(400).json({ error: 'family_id and title required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const post = await queryOne(
        `INSERT INTO bulletin_posts (family_id, author_id, post_type, title, body, pinned, due_date, assigned_to)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [family_id, userId, post_type ?? 'announcement', title,
         body ?? null, pinned ?? false, due_date ?? null, assigned_to ?? null]
      )
      return res.status(201).json({ post })
    }

    if (req.method === 'PATCH') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const existing = await queryOne('SELECT family_id FROM bulletin_posts WHERE id = $1', [id])
      if (!existing) return res.status(404).json({ error: 'Post not found' })
      if (!await requireFamilyMember(req, res, existing.family_id, userId)) return

      const { pinned, completed } = req.body
      const post = await queryOne(
        `UPDATE bulletin_posts SET
           pinned = COALESCE($2, pinned),
           completed = COALESCE($3, completed)
         WHERE id = $1 RETURNING *`,
        [id, pinned ?? null, completed ?? null]
      )
      return res.status(200).json({ post })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id required' })
      const existing = await queryOne('SELECT author_id FROM bulletin_posts WHERE id = $1', [id])
      if (!existing) return res.status(404).json({ error: 'Post not found' })
      if (existing.author_id !== userId) return res.status(403).json({ error: 'Only the author can delete' })
      await query('DELETE FROM bulletin_posts WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/bulletin]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

- [ ] **Step 2: Secure `api/expenses.js`**

Replace entire `api/expenses.js` with:

```js
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
```

- [ ] **Step 3: Secure `api/goals.js`**

Replace entire `api/goals.js` with:

```js
import { query, queryOne } from './_lib/db.js'
import { requireAuth, requireFamilyMember } from './_lib/auth.js'

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  const userId = await requireAuth(req, res)
  if (!userId) return

  try {
    if (req.method === 'GET') {
      const { family_id } = req.query
      if (!family_id) return res.status(400).json({ error: 'family_id required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

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
        const { goal_id, amount, note } = req.body
        if (!goal_id || !amount) return res.status(400).json({ error: 'goal_id and amount required' })

        const contribution = await queryOne(
          'INSERT INTO goal_contributions (goal_id, user_id, amount, note) VALUES ($1,$2,$3,$4) RETURNING *',
          [goal_id, userId, amount, note ?? null]
        )
        await query(
          'UPDATE family_goals SET current_amount = current_amount + $2 WHERE id = $1',
          [goal_id, amount]
        )
        return res.status(201).json({ contribution })
      }

      const { family_id, title, description, target_amount, currency, target_date } = req.body
      if (!family_id || !title || !target_amount) return res.status(400).json({ error: 'family_id, title, target_amount required' })
      if (!await requireFamilyMember(req, res, family_id, userId)) return

      const goal = await queryOne(
        `INSERT INTO family_goals (family_id, created_by, title, description, target_amount, currency, target_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [family_id, userId, title, description ?? null, target_amount, currency ?? 'INR', target_date ?? null]
      )
      return res.status(201).json({ goal })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/goals]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
```

- [ ] **Step 4: Secure `api/events.js`, `api/health.js`, `api/documents.js`, `api/users.js`**

For each of these files, apply the same pattern:
1. Add import at top: `import { requireAuth, requireFamilyMember } from './_lib/auth.js'`
2. First line of handler body: `const userId = await requireAuth(req, res); if (!userId) return`
3. For GET/POST that take `family_id`: add `if (!await requireFamilyMember(req, res, family_id, userId)) return`
4. Replace any `req.body.user_id` / `req.body.created_by` / `req.body.author_id` with `userId`

Read each file first, then apply edits. The pattern is identical to bulletin and expenses above.

For `api/users.js` specifically: the GET endpoint currently takes `id` query param — after securing, it should also allow `?me=true` to return the current user by their verified userId.

- [ ] **Step 5: Commit**

```bash
git add api/bulletin.js api/expenses.js api/goals.js api/events.js api/health.js api/documents.js api/users.js
git commit -m "security: add requireAuth + family membership check to all API handlers"
```

---

### Task 5: Extend `api/families.js` with new endpoints

**Files:**
- Modify: `api/families.js`

Replace entire `api/families.js` with:

```js
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

    // GET /api/families?action=invite-info&token=... — validate invite token (no auth needed but fine to have)
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
```

- [ ] **Step 2: Commit**

```bash
git add api/families.js
git commit -m "feat: families API — add members, invite-token, and join endpoints"
```

---

### Task 6: Create `api/dashboard.js` aggregate endpoint

**Files:**
- Create: `api/dashboard.js`

- [ ] **Step 1: Create the dashboard endpoint**

Create `api/dashboard.js`:

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add api/dashboard.js
git commit -m "feat: add /api/dashboard aggregate endpoint for home widget data"
```

---

### Task 7: Update `api/ai/chat.js` — Maahi AI prompt

**Files:**
- Modify: `api/ai/chat.js`

- [ ] **Step 1: Replace the system prompt name and add graceful error**

In `api/ai/chat.js`, make these changes:

1. Rename `MAAHI_SYSTEM_PROMPT` → `MAAHI_SYSTEM_PROMPT`
2. In the prompt text, all self-references use "Maahi"  
3. Change the opening line from "You are Maahi" to "You are Maahi"
4. Update the error message from `'Maahi is resting...'` to `'Maahi is resting, try again in a moment'`
5. Add graceful handling when GEMINI_API_KEY is missing (return 503 with a friendly message, not 500)
6. Add CORS restriction (replace `*` with specific origins in production):

```js
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://biggfam.com', /https:\/\/.*\.vercel\.app$/]
  : ['http://localhost:5173', 'http://localhost:3000']

const origin = req.headers.origin
const isAllowed = allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))
res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : allowedOrigins[0])
```

7. When `GEMINI_API_KEY` is missing, return:
```js
return res.status(503).json({ error: 'MAAHI_UNAVAILABLE', message: 'Maahi is being set up. She\'ll be ready soon.' })
```

- [ ] **Step 2: Commit**

```bash
git add api/ai/chat.js
git commit -m "feat: Maahi AI chat handler with graceful key-missing error"
```

---

## Phase 3 — Frontend: Auth Layer

### Task 8: Update `src/lib/api.js` — add token to all requests

**Files:**
- Modify: `src/lib/api.js`

- [ ] **Step 1: Replace `src/lib/api.js`**

```js
/**
 * BiggFam API client — all requests include Bearer token from Clerk
 */

const BASE = '/api'

async function req(path, options = {}) {
  const { token, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
    ...rest,
    body: rest.body ? JSON.stringify(rest.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`)
  return data
}

export const users = {
  me: (token) => req('/users?me=true', { token }),
  update: (id, body, token) => req(`/users?id=${id}`, { method: 'PATCH', body, token }),
}

export const families = {
  list: (token) => req('/families', { token }),
  create: (body, token) => req('/families', { method: 'POST', body, token }),
  members: (family_id, token) => req(`/families?action=members&family_id=${family_id}`, { token }),
  createInvite: (family_id, token) => req('/families?action=invite', { method: 'POST', body: { family_id }, token }),
  getInviteInfo: (inviteToken) => req(`/families?action=invite-info&token=${inviteToken}`, {}),
  join: (inviteToken, token) => req('/families?action=join', { method: 'POST', body: { token: inviteToken }, token }),
}

export const dashboard = {
  get: (family_id, token) => req(`/dashboard?family_id=${family_id}`, { token }),
}

export const events = {
  list: (family_id, from, to, token) => {
    const params = new URLSearchParams({ family_id })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return req(`/events?${params}`, { token })
  },
  create: (body, token) => req('/events', { method: 'POST', body, token }),
  delete: (id, token) => req(`/events?id=${id}`, { method: 'DELETE', token }),
}

export const expenses = {
  list: (family_id, month, year, token) => {
    const params = new URLSearchParams({ family_id })
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    return req(`/expenses?${params}`, { token })
  },
  create: (body, token) => req('/expenses', { method: 'POST', body, token }),
  settle: (split_id, token) => req(`/expenses?split_id=${split_id}`, { method: 'PATCH', body: {}, token }),
}

export const bulletin = {
  list: (family_id, token) => req(`/bulletin?family_id=${family_id}`, { token }),
  create: (body, token) => req('/bulletin', { method: 'POST', body, token }),
  patch: (id, body, token) => req(`/bulletin?id=${id}`, { method: 'PATCH', body, token }),
  delete: (id, token) => req(`/bulletin?id=${id}`, { method: 'DELETE', token }),
}

export const health = {
  list: (family_id, member_id, token) => {
    const params = new URLSearchParams({ family_id })
    if (member_id) params.set('member_id', member_id)
    return req(`/health?${params}`, { token })
  },
  addRecord: (body, token) => req('/health', { method: 'POST', body, token }),
  addMedication: (body, token) => req('/health?type=medication', { method: 'POST', body, token }),
}

export const documents = {
  list: (family_id, token) => req(`/documents?family_id=${family_id}`, { token }),
  create: (body, token) => req('/documents', { method: 'POST', body, token }),
  delete: (id, token) => req(`/documents?id=${id}`, { method: 'DELETE', token }),
}

export const goals = {
  list: (family_id, token) => req(`/goals?family_id=${family_id}`, { token }),
  create: (body, token) => req('/goals', { method: 'POST', body, token }),
  contribute: (body, token) => req('/goals?type=contribution', { method: 'POST', body, token }),
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/api.js
git commit -m "feat: add auth token to all API client methods"
```

---

### Task 9: Update `src/main.jsx` with ClerkProvider

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Replace `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Website from './Website.jsx'
import FamilyApp from './FamilyApp.jsx'
import Auth from './Auth.jsx'

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()

  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontSize: '18px', color: '#888'
      }}>
        Loading…
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/app/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />
          <Route path="/family/*" element={<RequireAuth><FamilyApp /></RequireAuth>} />
          <Route path="/*" element={<Website />} />
        </Routes>
      </Router>
    </ClerkProvider>
  </StrictMode>
)
```

- [ ] **Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "feat: wrap app in ClerkProvider, replace localStorage RequireAuth"
```

---

### Task 10: Replace `src/Auth.jsx` with Clerk components

**Files:**
- Modify: `src/Auth.jsx`

- [ ] **Step 1: Replace `src/Auth.jsx`**

Note: No `<form>` tags. Use Clerk's built-in components which handle forms internally.

```jsx
import { useState } from 'react'
import { SignIn, SignUp } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const navigate = useNavigate()

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">🏠</div>
            <span>BiggFam</span>
          </div>
          <h1>{mode === 'signin' ? 'Welcome back' : 'Join BiggFam'}</h1>
          <p>
            {mode === 'signin'
              ? 'Sign in to your family space'
              : "India's family OS — built for your parivar"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'signin' ? 'active' : ''}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="clerk-widget-wrapper">
          {mode === 'signin' ? (
            <SignIn
              appearance={{
                variables: { colorPrimary: '#E67E22' },
                elements: {
                  card: 'clerk-card',
                  formButtonPrimary: 'clerk-btn-primary',
                }
              }}
              afterSignInUrl="/family"
              routing="hash"
            />
          ) : (
            <SignUp
              appearance={{
                variables: { colorPrimary: '#E67E22' },
                elements: {
                  card: 'clerk-card',
                  formButtonPrimary: 'clerk-btn-primary',
                }
              }}
              afterSignUpUrl="/family"
              routing="hash"
            />
          )}
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add Clerk widget styles to `src/Auth.css`**

Append to `src/Auth.css`:

```css
.clerk-widget-wrapper {
  margin-top: 16px;
}

.clerk-widget-wrapper .cl-card {
  box-shadow: none !important;
  border: 1px solid #E0DDD8 !important;
  border-radius: 12px !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/Auth.jsx src/Auth.css
git commit -m "feat: replace fake localStorage auth with Clerk SignIn/SignUp components"
```

---

## Phase 4 — Split the Monolith

### Task 11: Create `src/contexts/FamilyContext.jsx`

**Files:**
- Create: `src/contexts/FamilyContext.jsx`

- [ ] **Step 1: Create the context**

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { families as familiesApi } from '../lib/api.js'

const FamilyContext = createContext(null)

export function FamilyProvider({ children }) {
  const { getToken } = useAuth()
  const [family, setFamily] = useState(undefined)  // undefined = loading, null = no family
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadFamily() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { families } = await familiesApi.list(token)

      if (!families || families.length === 0) {
        setFamily(null)
        setMembers([])
        setLoading(false)
        return
      }

      const f = families[0]
      setFamily(f)

      const { members: m } = await familiesApi.members(f.id, token)
      setMembers(m ?? [])
    } catch (err) {
      console.error('[FamilyContext]', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFamily() }, [])

  // Build Maahi context string — summarizes family for the AI
  const maahiContext = family
    ? [
        `Family: ${family.name}`,
        members.length > 0
          ? `Members: ${members.map(m => `${m.name} (${m.relationship || m.role})`).join(', ')}`
          : '',
        family.city ? `Location: ${family.city}` : '',
      ].filter(Boolean).join('. ')
    : ''

  return (
    <FamilyContext.Provider value={{ family, members, loading, error, refetch: loadFamily, maahiContext }}>
      {children}
    </FamilyContext.Provider>
  )
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used inside FamilyProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add src/contexts/FamilyContext.jsx
git commit -m "feat: add FamilyContext with family/members state and maahiContext string"
```

---

### Task 12: Create the 6 data hooks

**Files:**
- Create: `src/hooks/useBulletin.js`
- Create: `src/hooks/useExpenses.js`
- Create: `src/hooks/useEvents.js`
- Create: `src/hooks/useGoals.js`
- Create: `src/hooks/useDocuments.js`
- Create: `src/hooks/useHealth.js`

- [ ] **Step 1: Create `src/hooks/useBulletin.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { bulletin as bulletinApi } from '../lib/api.js'

export function useBulletin() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchPosts() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { posts: p } = await bulletinApi.list(family.id, token)
      setPosts(p ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [family?.id])

  async function createPost(data) {
    const token = await getToken()
    const { post } = await bulletinApi.create({ ...data, family_id: family.id }, token)
    setPosts(prev => [post, ...prev])
    return post
  }

  async function deletePost(id) {
    const token = await getToken()
    await bulletinApi.delete(id, token)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  async function pinPost(id, pinned) {
    const token = await getToken()
    const { post } = await bulletinApi.patch(id, { pinned }, token)
    setPosts(prev => prev.map(p => p.id === id ? post : p))
  }

  async function completePost(id, completed) {
    const token = await getToken()
    const { post } = await bulletinApi.patch(id, { completed }, token)
    setPosts(prev => prev.map(p => p.id === id ? post : p))
  }

  return { posts, loading, error, refetch: fetchPosts, createPost, deletePost, pinPost, completePost }
}
```

- [ ] **Step 2: Create `src/hooks/useExpenses.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { expenses as expensesApi } from '../lib/api.js'

export function useExpenses(month, year) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [expenseList, setExpenseList] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchExpenses() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await expensesApi.list(family.id, month, year, token)
      setExpenseList(res.expenses ?? [])
      setTotal(res.total ?? 0)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExpenses() }, [family?.id, month, year])

  async function addExpense(data) {
    const token = await getToken()
    const { expense } = await expensesApi.create({ ...data, family_id: family.id }, token)
    setExpenseList(prev => [expense, ...prev])
    setTotal(prev => Number(prev) + Number(data.amount))
    return expense
  }

  return { expenses: expenseList, total, loading, error, refetch: fetchExpenses, addExpense }
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
```

- [ ] **Step 3: Create `src/hooks/useEvents.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { events as eventsApi } from '../lib/api.js'

export function useEvents(from, to) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [eventList, setEventList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchEvents() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { events } = await eventsApi.list(family.id, from, to, token)
      setEventList(events ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEvents() }, [family?.id, from, to])

  async function createEvent(data) {
    const token = await getToken()
    const { event } = await eventsApi.create({ ...data, family_id: family.id }, token)
    setEventList(prev => [...prev, event].sort((a, b) => new Date(a.start_time) - new Date(b.start_time)))
    return event
  }

  async function deleteEvent(id) {
    const token = await getToken()
    await eventsApi.delete(id, token)
    setEventList(prev => prev.filter(e => e.id !== id))
  }

  return { events: eventList, loading, error, refetch: fetchEvents, createEvent, deleteEvent }
}
```

- [ ] **Step 4: Create `src/hooks/useGoals.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { goals as goalsApi } from '../lib/api.js'

export function useGoals() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [goalList, setGoalList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchGoals() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { goals } = await goalsApi.list(family.id, token)
      setGoalList(goals ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchGoals() }, [family?.id])

  async function createGoal(data) {
    const token = await getToken()
    const { goal } = await goalsApi.create({ ...data, family_id: family.id }, token)
    setGoalList(prev => [goal, ...prev])
    return goal
  }

  async function contribute(goal_id, amount, note) {
    const token = await getToken()
    await goalsApi.contribute({ goal_id, amount, note }, token)
    await fetchGoals() // refetch to get updated amounts
  }

  return { goals: goalList, loading, error, refetch: fetchGoals, createGoal, contribute }
}
```

- [ ] **Step 5: Create `src/hooks/useDocuments.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { documents as documentsApi } from '../lib/api.js'

export function useDocuments() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [docList, setDocList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchDocs() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const { documents } = await documentsApi.list(family.id, token)
      // Sort by expiry date ascending (soonest expiring first, null last)
      const sorted = (documents ?? []).sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return new Date(a.expiry_date) - new Date(b.expiry_date)
      })
      setDocList(sorted)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [family?.id])

  async function addDocument(data) {
    const token = await getToken()
    const { document } = await documentsApi.create({ ...data, family_id: family.id }, token)
    setDocList(prev => [...prev, document])
    return document
  }

  async function deleteDocument(id) {
    const token = await getToken()
    await documentsApi.delete(id, token)
    setDocList(prev => prev.filter(d => d.id !== id))
  }

  return { documents: docList, loading, error, refetch: fetchDocs, addDocument, deleteDocument }
}
```

- [ ] **Step 6: Create `src/hooks/useHealth.js`**

```js
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { health as healthApi } from '../lib/api.js'

export function useHealth(memberId) {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [records, setRecords] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchHealth() {
    if (!family?.id) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await healthApi.list(family.id, memberId, token)
      setRecords(res.records ?? [])
      setMedications(res.medications ?? [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchHealth() }, [family?.id, memberId])

  async function addRecord(data) {
    const token = await getToken()
    const { record } = await healthApi.addRecord({ ...data, family_id: family.id }, token)
    setRecords(prev => [record, ...prev])
    return record
  }

  async function addMedication(data) {
    const token = await getToken()
    const { medication } = await healthApi.addMedication({ ...data, family_id: family.id }, token)
    setMedications(prev => [medication, ...prev])
    return medication
  }

  return { records, medications, loading, error, refetch: fetchHealth, addRecord, addMedication }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/hooks/
git commit -m "feat: add 6 data hooks (bulletin, expenses, events, goals, documents, health)"
```

---

### Task 13: Create shared UI micro-components

**Files:**
- Create: `src/components/ErrorBoundary.jsx`
- Create: `src/components/EmptyState.jsx`
- Create: `src/components/SectionSkeleton.jsx`
- Create: `src/components/ScrollToTop.jsx`

- [ ] **Step 1: Create `src/components/ErrorBoundary.jsx`**

```jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</p>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Something went wrong in this section.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              background: 'none', border: '1px solid #E0DDD8', borderRadius: '8px',
              padding: '10px 20px', cursor: 'pointer', fontSize: '15px', color: '#333'
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 2: Create `src/components/EmptyState.jsx`**

```jsx
export default function EmptyState({ icon, title, description, cta, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{
        fontSize: '20px', fontWeight: 700, marginBottom: '8px',
        color: '#1A2E5C', margin: '0 0 8px'
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '15px', color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {cta && (
        <button
          onClick={onAction}
          style={{
            background: '#E67E22', color: '#fff', border: 'none',
            borderRadius: '8px', padding: '14px 24px', fontSize: '15px',
            fontWeight: 600, cursor: 'pointer', minHeight: '48px'
          }}
        >
          {cta}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/SectionSkeleton.jsx`**

```jsx
export default function SectionSkeleton({ rows = 3 }) {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '72px',
            background: '#F5F3EE',
            borderRadius: '12px',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ScrollToTop.jsx`**

```jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: add ErrorBoundary, EmptyState, SectionSkeleton, ScrollToTop components"
```

---

### Task 14: Create `src/components/Onboarding.jsx`

**Files:**
- Create: `src/components/Onboarding.jsx`

- [ ] **Step 1: Create Onboarding**

```jsx
import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { families as familiesApi } from '../lib/api.js'

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [familyName, setFamilyName] = useState('')
  const [city, setCity] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [inviteToken, setInviteToken] = useState(null)
  const { getToken } = useAuth()
  const { refetch } = useFamily()

  async function handleCreate() {
    if (!familyName.trim()) { setError('Please enter your family name'); return }
    setError('')
    setCreating(true)
    try {
      const token = await getToken()
      const { family } = await familiesApi.create(
        { name: familyName.trim(), city: city.trim() || undefined },
        token
      )
      // Generate invite token
      const { token: invTok } = await familiesApi.createInvite(family.id, token)
      setInviteToken(invTok)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const inviteLink = inviteToken ? `${window.location.origin}/join?token=${inviteToken}` : ''

  async function handleFinish() {
    await refetch()
  }

  if (step === 2) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>👨‍👩‍👧‍👦</div>
          <h1 style={titleStyle}>{familyName} is ready!</h1>
          <p style={subtitleStyle}>Invite your family to join. The more, the better!</p>

          <div style={{ background: '#F5F3EE', borderRadius: '8px', padding: '12px 16px', margin: '20px 0', wordBreak: 'break-all', fontSize: '13px', color: '#555' }}>
            {inviteLink}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                const msg = encodeURIComponent(`I've set up our family space on BiggFam. Join here: ${inviteLink}`)
                window.open(`https://wa.me/?text=${msg}`, '_blank')
              }}
              style={primaryBtnStyle}
            >
              Share via WhatsApp
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              style={ghostBtnStyle}
            >
              Copy link
            </button>
            <button onClick={handleFinish} style={{ ...ghostBtnStyle, color: '#888', borderColor: 'transparent' }}>
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>🏠</div>
        <h1 style={titleStyle}>Namaste!</h1>
        <p style={subtitleStyle}>Let's set up your family space.</p>

        {error && (
          <div style={{ background: '#FFF0F0', border: '1px solid #CC0000', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#CC0000', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle} htmlFor="family-name">Family Name *</label>
          <input
            id="family-name"
            type="text"
            value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            placeholder="e.g. Patel Parivar"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={labelStyle} htmlFor="family-city">City (optional)</label>
          <input
            id="family-city"
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="e.g. Mumbai"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !familyName.trim()}
          style={{ ...primaryBtnStyle, opacity: creating || !familyName.trim() ? 0.5 : 1 }}
        >
          {creating ? 'Creating…' : 'Create My Family →'}
        </button>
      </div>
    </div>
  )
}

const containerStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: '#F5F3EE', padding: '24px',
}
const cardStyle = {
  background: '#fff', borderRadius: '16px', padding: '40px 32px',
  maxWidth: '440px', width: '100%', border: '1px solid #E0DDD8',
}
const titleStyle = {
  fontSize: '26px', fontWeight: 700, color: '#1A2E5C',
  margin: '0 0 8px', textAlign: 'center',
}
const subtitleStyle = {
  fontSize: '16px', color: '#666', margin: '0 0 28px', textAlign: 'center',
}
const labelStyle = {
  display: 'block', fontSize: '14px', fontWeight: 500,
  color: '#333', marginBottom: '8px',
}
const inputStyle = {
  width: '100%', height: '52px', border: '1px solid #E0DDD8',
  borderRadius: '8px', padding: '0 14px', fontSize: '16px',
  outline: 'none', boxSizing: 'border-box',
}
const primaryBtnStyle = {
  width: '100%', height: '52px', background: '#E67E22', color: '#fff',
  border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600,
  cursor: 'pointer',
}
const ghostBtnStyle = {
  width: '100%', height: '48px', background: '#fff', color: '#333',
  border: '1px solid #E0DDD8', borderRadius: '8px', fontSize: '15px',
  cursor: 'pointer',
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Onboarding.jsx
git commit -m "feat: add Onboarding component for first-run family creation + invite"
```

---

### Task 15: Rename MaahiAI → MaahiAI

**Files:**
- Create: `src/sections/MaahiAI.jsx` (copy + edit MaahiAI.jsx)
- Create: `src/sections/MaahiAI.css` (copy + edit MaahiAI.css)

- [ ] **Step 1: Copy and update MaahiAI.jsx → MaahiAI.jsx**

Read `src/sections/MaahiAI.jsx`, then create `src/sections/MaahiAI.jsx` with these changes:
1. Import: `import './MaahiAI.css'` (not MaahiAI.css)
2. Welcome message uses `'Maahi'` and `'maahi'`
3. Function name: `MaahiAI`
4. CSS classes: `maahi-` (in JSX classNames and in the CSS file)
5. Header title: `Maahi` → `Maahi`
6. Pass `familyContext` from props to the fetch body:

```jsx
// Change the component signature to accept familyContext
export default function MaahiAI({ familyContext = '' }) {
  // ...existing state...
  
  async function sendMessage(text) {
    // In the fetch body, add familyContext:
    body: JSON.stringify({ messages: newMessages, familyContext }),
    // ...
  }
}
```

7. Update the greeting message:
```
'Namaste beta! 🙏 Main hoon Maahi — aapke parivar ki AI companion. Finances ho, health ho, family ke sawaal ho — sab pooch sakte ho. Aaj main kaise madad kar sakti hoon?'
```

8. Add MAAHI_UNAVAILABLE error handling:
```jsx
if (err.message === 'MAAHI_UNAVAILABLE') {
  // replace the last message with the setup message
  setMessages(prev => {
    const updated = [...prev]
    updated[updated.length - 1] = {
      role: 'assistant',
      content: 'Maahi is being set up. She\'ll be ready soon. 🙏',
    }
    return updated
  })
  return
}
```

- [ ] **Step 2: Copy MaahiAI.css → MaahiAI.css**

CSS classes in `src/sections/MaahiAI.css` all use `.maahi-` prefix.

- [ ] **Step 3: Commit**

```bash
git add src/sections/MaahiAI.jsx src/sections/MaahiAI.css
git commit -m "feat: rename MaahiAI → MaahiAI (files, classes, UI text, greeting)"
```

---

### Task 16: Create section components (BulletinSection, WealthSection, CalendarSection, CareSection, GoalsSection, DocumentsSection, MemorySection, HomeSection, SettingsSection)

This is the largest task. Each section follows an identical pattern: hook call → skeleton → error → empty → list.

**Files:**
- Create: `src/sections/BulletinSection.jsx`
- Create: `src/sections/WealthSection.jsx`
- Create: `src/sections/CalendarSection.jsx`
- Create: `src/sections/CareSection.jsx`
- Create: `src/sections/GoalsSection.jsx`
- Create: `src/sections/DocumentsSection.jsx`
- Create: `src/sections/MemorySection.jsx`
- Create: `src/sections/HomeSection.jsx`
- Create: `src/sections/SettingsSection.jsx`

- [ ] **Step 1: Create `src/sections/BulletinSection.jsx`**

```jsx
import { useState } from 'react'
import { useBulletin } from '../hooks/useBulletin.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const POST_TYPES = ['announcement', 'task', 'grocery', 'reminder']

export default function BulletinSection() {
  const { posts, loading, error, refetch, createPost, deletePost, pinPost, completePost } = useBulletin()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [postType, setPostType] = useState('announcement')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    try {
      await createPost({ title: title.trim(), body: body.trim() || undefined, post_type: postType })
      setTitle(''); setBody(''); setPostType('announcement')
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    await deletePost(id)
    setDeleteConfirm(null)
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return (
    <div style={{ padding: '24px', textAlign: 'center', color: '#CC0000' }}>
      <p>{error}</p>
      <button onClick={refetch} style={{ marginTop: '12px', padding: '10px 20px', cursor: 'pointer', border: '1px solid #E0DDD8', borderRadius: '8px' }}>Retry</button>
    </div>
  )

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Bulletin</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Post
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="post-type">Post type</label>
            <select
              id="post-type"
              value={postType}
              onChange={e => setPostType(e.target.value)}
              style={inputStyle}
            >
              {POST_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle} htmlFor="post-title">Title *</label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's the update?"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle} htmlFor="post-body">Details (optional)</label>
            <textarea
              id="post-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Add more context…"
              rows={3}
              style={{ ...inputStyle, height: 'auto', padding: '12px 14px', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCreate}
              disabled={saving || !title.trim()}
              style={{ flex: 1, height: '48px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: saving || !title.trim() ? 0.5 : 1 }}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>
            <button
              onClick={() => { setShowForm(false); setTitle(''); setBody('') }}
              style={{ height: '48px', padding: '0 20px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '8px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState icon="📌" title="Nothing posted yet" description="Share an update, reminder, or task with your family." cta="Add first post" onAction={() => setShowForm(true)} />
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ background: '#fff', border: `1px solid ${post.pinned ? '#E67E22' : '#E0DDD8'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#C0622A', background: '#FFF6EF', borderRadius: '4px', padding: '2px 8px' }}>
                    {post.post_type}
                  </span>
                  {post.pinned && <span style={{ fontSize: '11px', color: '#888' }}>📌 Pinned</span>}
                </div>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>{post.title}</p>
                {post.body && <p style={{ fontSize: '14px', color: '#555', margin: 0, lineHeight: 1.5 }}>{post.body}</p>}
                <p style={{ fontSize: '13px', color: '#888', margin: '8px 0 0' }}>by {post.author_name || 'Family member'}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => pinPost(post.id, !post.pinned)}
                  style={iconBtnStyle}
                  aria-label={post.pinned ? 'Unpin' : 'Pin'}
                  title={post.pinned ? 'Unpin' : 'Pin'}
                >
                  📌
                </button>
                <button
                  onClick={() => setDeleteConfirm(post.id)}
                  style={{ ...iconBtnStyle, color: '#CC0000' }}
                  aria-label="Delete post"
                >
                  🗑️
                </button>
              </div>
            </div>

            {deleteConfirm === post.id && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#FFF0F0', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ flex: 1, fontSize: '14px', color: '#333' }}>Delete this post?</span>
                <button onClick={() => handleDelete(post.id)} style={{ height: '40px', padding: '0 16px', background: '#CC0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{ height: '40px', padding: '0 16px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '8px', minHeight: '40px', minWidth: '40px', borderRadius: '6px' }
```

- [ ] **Step 2: Create `src/sections/WealthSection.jsx`**

```jsx
import { useState } from 'react'
import { useExpenses, formatINR } from '../hooks/useExpenses.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const CATEGORIES = ['Grocery', 'Medical', 'School', 'Utilities', 'EMI', 'Festival', 'Travel', 'Rent', 'Other']
const PAYMENT_MODES = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque']

export default function WealthSection() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const { expenses, total, loading, error, refetch, addExpense } = useExpenses(month, year)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Other', payment_mode: 'UPI', expense_date: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.title.trim() || !form.amount) return
    setSaving(true)
    try {
      await addExpense({ ...form, amount: Number(form.amount) })
      setForm({ title: '', amount: '', category: 'Other', payment_mode: 'UPI', expense_date: new Date().toISOString().slice(0, 10) })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={5} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Ghar Ka Hisaab</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Expense</button>
      </div>

      {/* Month selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setMonth(i + 1)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: '1px solid #E0DDD8',
              background: month === i + 1 ? '#E67E22' : '#fff',
              color: month === i + 1 ? '#fff' : '#333',
              fontWeight: month === i + 1 ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '36px', fontSize: '14px',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Monthly summary card */}
      <div style={{ background: '#1A2E5C', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', color: '#fff' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', opacity: 0.7 }}>Total spent — {MONTHS[month - 1]} {year}</p>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>{formatINR(total)}</p>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="exp-title">What was it for? *</label>
              <input id="exp-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Monthly groceries" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-amount">Amount (₹) *</label>
              <input id="exp-amount" type="number" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="0" style={inputStyle} min="0" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-date">Date *</label>
              <input id="exp-date" type="date" value={form.expense_date} onChange={e => setForm(p => ({...p, expense_date: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-cat">Category</label>
              <select id="exp-cat" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="exp-mode">Payment mode</label>
              <select id="exp-mode" value={form.payment_mode} onChange={e => setForm(p => ({...p, payment_mode: e.target.value}))} style={inputStyle}>
                {PAYMENT_MODES.map(m => <option key={m} value={m.toLowerCase()}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} disabled={saving || !form.title.trim() || !form.amount} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title.trim() || !form.amount ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Expense'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState icon="💸" title="No expenses this month" description="Track your family's spending to see where the money goes." cta="Add first expense" onAction={() => setShowForm(true)} />
      ) : (
        expenses.map(exp => (
          <div key={exp.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '14px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{exp.title}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                {exp.category} · {exp.payment_mode?.toUpperCase()} · {exp.paid_by_name || 'You'} · {new Date(exp.expense_date).toLocaleDateString('en-IN')}
              </p>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>{formatINR(exp.amount)}</p>
          </div>
        ))
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
```

- [ ] **Step 3: Create `src/sections/CalendarSection.jsx`**

```jsx
import { useState } from 'react'
import { useEvents } from '../hooks/useEvents.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

const EVENT_TYPES = ['Festival', 'Medical', 'School', 'EMI', 'Birthday', 'General']
const TYPE_COLORS = { Festival: '#9333EA', Medical: '#CC0000', School: '#2563EB', EMI: '#C0622A', Birthday: '#DB2777', General: '#666' }

// Pre-loaded Indian festivals 2025-2026 (display only, not from DB)
const FESTIVALS = [
  { id: 'holi-2026', title: 'Holi', start_time: '2026-03-24T00:00:00', event_type: 'Festival', system: true },
  { id: 'diwali-2025', title: 'Diwali', start_time: '2025-10-20T00:00:00', event_type: 'Festival', system: true },
  { id: 'eid-2026', title: 'Eid al-Fitr', start_time: '2026-03-31T00:00:00', event_type: 'Festival', system: true },
]

export default function CalendarSection() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()
  const { events, loading, error, refetch, createEvent } = useEvents(monthStart, monthEnd)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', event_type: 'General', start_time: '', location: '' })
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!form.title.trim() || !form.start_time) return
    setSaving(true)
    try {
      await createEvent({ ...form })
      setForm({ title: '', event_type: 'General', start_time: '', location: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  // Merge family events + system festivals, sort by date
  const allEvents = [...FESTIVALS, ...events].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const upcomingEvents = allEvents.filter(e => new Date(e.start_time) >= new Date(Date.now() - 24*60*60*1000))

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Saath Mein</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Event</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="evt-title">Event name *</label>
              <input id="evt-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Doctor appointment" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="evt-date">Date & time *</label>
              <input id="evt-date" type="datetime-local" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="evt-type">Type</label>
              <select id="evt-type" value={form.event_type} onChange={e => setForm(p => ({...p, event_type: e.target.value}))} style={inputStyle}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="evt-loc">Location (optional)</label>
              <input id="evt-loc" type="text" value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="e.g. Apollo Hospital, Bandra" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.start_time} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title || !form.start_time ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Event'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 ? (
        <EmptyState icon="📅" title="No upcoming events" description="Add family events, appointments, and festivals to keep everyone in sync." cta="Add first event" onAction={() => setShowForm(true)} />
      ) : (
        upcomingEvents.map(evt => (
          <div key={evt.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderLeft: `4px solid ${TYPE_COLORS[evt.event_type] || '#666'}`, borderRadius: '12px', padding: '14px 20px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: TYPE_COLORS[evt.event_type] || '#666', background: '#F5F3EE', borderRadius: '4px', padding: '2px 8px' }}>
                    {evt.event_type}
                  </span>
                  {evt.system && <span style={{ fontSize: '11px', color: '#888' }}>🇮🇳 National festival</span>}
                </div>
                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{evt.title}</p>
                <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
                  {new Date(evt.start_time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {evt.location && ` · ${evt.location}`}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
```

- [ ] **Step 4: Create `src/sections/DocumentsSection.jsx` (currently missing entirely)**

```jsx
import { useState } from 'react'
import { useDocuments } from '../hooks/useDocuments.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import { useFamily } from '../contexts/FamilyContext.jsx'

const DOC_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar', icon: '🪪' },
  { value: 'pan', label: 'PAN', icon: '📄' },
  { value: 'passport', label: 'Passport', icon: '🛂' },
  { value: 'property', label: 'Property', icon: '🏠' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { value: 'will', label: 'Will', icon: '📜' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'emirates_id', label: 'Emirates ID', icon: '🪪' },
  { value: 'uae_visa', label: 'UAE Visa', icon: '✈️' },
  { value: 'labour_card', label: 'Labour Card', icon: '💼' },
  { value: 'tenancy_contract', label: 'Tenancy Contract', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '📁' },
]

function getDaysUntilExpiry(expiry_date) {
  if (!expiry_date) return null
  return Math.ceil((new Date(expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
}

export default function DocumentsSection() {
  const { documents, loading, error, refetch, addDocument, deleteDocument } = useDocuments()
  const { members } = useFamily()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ doc_type: 'aadhaar', title: '', document_url: '', expiry_date: '', owner_id: '' })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterOwner, setFilterOwner] = useState('all')

  async function handleAdd() {
    if (!form.title.trim() || !form.document_url.trim()) return
    setSaving(true)
    try {
      await addDocument({
        doc_type: form.doc_type,
        title: form.title.trim(),
        document_url: form.document_url.trim(),
        expiry_date: form.expiry_date || undefined,
        owner_id: form.owner_id || undefined,
      })
      setForm({ doc_type: 'aadhaar', title: '', document_url: '', expiry_date: '', owner_id: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  const filtered = filterOwner === 'all' ? documents : documents.filter(d => d.owner_id === filterOwner)

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Kagaz</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Document</button>
      </div>

      {/* Owner filter */}
      {members.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
          <button onClick={() => setFilterOwner('all')} style={filterBtnStyle(filterOwner === 'all')}>All</button>
          {members.map(m => (
            <button key={m.id} onClick={() => setFilterOwner(m.id)} style={filterBtnStyle(filterOwner === m.id)}>{m.name}</button>
          ))}
        </div>
      )}

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle} htmlFor="doc-type">Document type *</label>
              <select id="doc-type" value={form.doc_type} onChange={e => setForm(p => ({...p, doc_type: e.target.value}))} style={inputStyle}>
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="doc-owner">For (family member)</label>
              <select id="doc-owner" value={form.owner_id} onChange={e => setForm(p => ({...p, owner_id: e.target.value}))} style={inputStyle}>
                <option value="">Anyone</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="doc-title">Title *</label>
              <input id="doc-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Dad's Passport" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="doc-url">Document link * (Google Drive, Dropbox, etc.)</label>
              <input id="doc-url" type="url" value={form.document_url} onChange={e => setForm(p => ({...p, document_url: e.target.value}))} placeholder="https://drive.google.com/..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="doc-expiry">Expiry date (optional)</label>
              <input id="doc-expiry" type="date" value={form.expiry_date} onChange={e => setForm(p => ({...p, expiry_date: e.target.value}))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd} disabled={saving || !form.title.trim() || !form.document_url.trim()} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title.trim() || !form.document_url.trim() ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Add Document'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon="📁" title="No documents yet" description="Store Aadhaar, PAN, Passport, insurance and all important family papers in one place." cta="Add first document" onAction={() => setShowForm(true)} />
      ) : (
        filtered.map(doc => {
          const days = getDaysUntilExpiry(doc.expiry_date)
          const typeInfo = DOC_TYPES.find(t => t.value === doc.doc_type) || { icon: '📁', label: doc.doc_type }
          const owner = members.find(m => m.id === doc.owner_id)
          return (
            <div key={doc.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '14px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                <span style={{ fontSize: '28px' }}>{typeInfo.icon}</span>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '15px', color: '#1A1A1A' }}>{doc.title}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#888' }}>
                    {typeInfo.label}{owner ? ` · ${owner.name}` : ''}
                  </p>
                  {days !== null && (
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: days < 30 ? '#FFF0F0' : days < 90 ? '#FFF6EF' : '#F5F3EE',
                      color: days < 30 ? '#CC0000' : days < 90 ? '#C0622A' : '#666',
                    }}>
                      {days < 0 ? 'Expired' : `Expires in ${days} days`}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                <a href={doc.document_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', minHeight: '40px', borderRadius: '6px', background: '#F5F3EE', textDecoration: 'none', fontSize: '16px' }} aria-label="Open document">🔗</a>
                {deleteConfirm === doc.id ? (
                  <>
                    <button onClick={() => { deleteDocument(doc.id); setDeleteConfirm(null) }} style={{ height: '36px', padding: '0 12px', background: '#CC0000', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ height: '36px', padding: '0 12px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>No</button>
                  </>
                ) : (
                  <button onClick={() => setDeleteConfirm(doc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', minWidth: '40px', minHeight: '40px', borderRadius: '6px', color: '#CC0000' }} aria-label="Delete">🗑️</button>
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
const filterBtnStyle = (active) => ({ padding: '6px 14px', borderRadius: '20px', border: '1px solid #E0DDD8', background: active ? '#1A2E5C' : '#fff', color: active ? '#fff' : '#333', fontWeight: active ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '36px', fontSize: '14px' })
```

- [ ] **Step 5: Create `src/sections/GoalsSection.jsx`**

```jsx
import { useState } from 'react'
import { useGoals } from '../hooks/useGoals.js'
import { formatINR } from '../hooks/useExpenses.js'
import EmptyState from '../components/EmptyState.jsx'
import SectionSkeleton from '../components/SectionSkeleton.jsx'

export default function GoalsSection() {
  const { goals, loading, error, refetch, createGoal, contribute } = useGoals()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_amount: '', target_date: '' })
  const [saving, setSaving] = useState(false)
  const [contributeModal, setContributeModal] = useState(null)
  const [contribAmount, setContribAmount] = useState('')

  async function handleCreate() {
    if (!form.title.trim() || !form.target_amount) return
    setSaving(true)
    try {
      await createGoal({ ...form, target_amount: Number(form.target_amount) })
      setForm({ title: '', description: '', target_amount: '', target_date: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function handleContribute() {
    if (!contribAmount || !contributeModal) return
    await contribute(contributeModal, Number(contribAmount))
    setContribAmount('')
    setContributeModal(null)
  }

  if (loading) return <SectionSkeleton rows={3} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>

  return (
    <div className="section-content" style={{ maxWidth: '720px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: 0 }}>Sapne</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtnStyle}>+ Goal</button>
      </div>

      {showForm && (
        <div style={formCardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="goal-title">Goal name *</label>
              <input id="goal-title" type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. Family trip to Goa" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="goal-amount">Target amount (₹) *</label>
              <input id="goal-amount" type="number" value={form.target_amount} onChange={e => setForm(p => ({...p, target_amount: e.target.value}))} placeholder="100000" style={inputStyle} min="0" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="goal-date">Target date (optional)</label>
              <input id="goal-date" type="date" value={form.target_date} onChange={e => setForm(p => ({...p, target_date: e.target.value}))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="goal-desc">Description (optional)</label>
              <input id="goal-desc" type="text" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="What's this goal for?" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleCreate} disabled={saving || !form.title.trim() || !form.target_amount} style={{ ...primaryBtnStyle, flex: 1, opacity: saving || !form.title || !form.target_amount ? 0.5 : 1 }}>
              {saving ? 'Saving…' : 'Create Goal'}
            </button>
            <button onClick={() => setShowForm(false)} style={ghostBtnStyle}>Cancel</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <EmptyState icon="🌟" title="No goals yet" description="Save together as a family — for a trip, wedding, home, or education." cta="Create first goal" onAction={() => setShowForm(true)} />
      ) : (
        goals.map(goal => {
          const pct = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0
          return (
            <div key={goal.id} style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '17px', color: '#1A2E5C' }}>{goal.title}</p>
                  {goal.description && <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{goal.description}</p>}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 700, color: pct >= 100 ? '#1A7A4A' : '#1A2E5C', flexShrink: 0 }}>{pct}%</span>
              </div>
              {/* Progress bar */}
              <div style={{ background: '#F5F3EE', borderRadius: '4px', height: '8px', marginBottom: '8px', overflow: 'hidden' }} aria-label={`${pct}% progress towards ${goal.title}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#1A7A4A' : '#E67E22', borderRadius: '4px', transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {formatINR(goal.current_amount)} of {formatINR(goal.target_amount)}
                  {goal.target_date && ` · by ${new Date(goal.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                </span>
                {pct < 100 && (
                  <button onClick={() => setContributeModal(goal.id)} style={{ background: '#FFF6EF', color: '#C0622A', border: '1px solid #E67E22', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, minHeight: '40px' }}>
                    + Contribute
                  </button>
                )}
              </div>
              {contributeModal === goal.id && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#F5F3EE', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label htmlFor={`contrib-${goal.id}`} style={{ fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>Amount (₹)</label>
                  <input id={`contrib-${goal.id}`} type="number" value={contribAmount} onChange={e => setContribAmount(e.target.value)} placeholder="0" style={{ ...inputStyle, height: '40px', flex: 1 }} min="1" />
                  <button onClick={handleContribute} disabled={!contribAmount} style={{ height: '40px', padding: '0 16px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, flexShrink: 0, opacity: !contribAmount ? 0.5 : 1 }}>Add</button>
                  <button onClick={() => { setContributeModal(null); setContribAmount('') }} style={{ height: '40px', padding: '0 14px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

const primaryBtnStyle = { background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 20px', height: '48px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }
const ghostBtnStyle = { background: '#fff', color: '#333', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 20px', height: '48px', cursor: 'pointer', fontSize: '15px' }
const formCardStyle = { background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '20px' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#333', marginBottom: '8px' }
const inputStyle = { width: '100%', height: '52px', border: '1px solid #E0DDD8', borderRadius: '8px', padding: '0 14px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }
```

- [ ] **Step 6: Create stub sections for CareSection, MemorySection, HomeSection, SettingsSection**

These four sections have more complex logic or depend on existing code from FamilyApp.jsx. Create minimal shells that are wired to real data but don't crash:

**`src/sections/CareSection.jsx`** — stub using `useHealth`:
```jsx
import { useHealth } from '../hooks/useHealth.js'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function CareSection() {
  const { records, medications, loading, error, refetch } = useHealth()
  if (loading) return <SectionSkeleton rows={4} />
  if (error) return <div style={{ padding: '24px', color: '#CC0000' }}>{error} <button onClick={refetch}>Retry</button></div>
  const hasContent = records.length > 0 || medications.length > 0
  if (!hasContent) return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Sehat</h1>
      <EmptyState icon="🏥" title="No health records yet" description="Track prescriptions, reports, vaccinations, and medications for your whole family." />
    </div>
  )
  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Sehat</h1>
      <p style={{ color: '#666' }}>{records.length} health records · {medications.filter(m => m.active).length} active medications</p>
    </div>
  )
}
```

**`src/sections/MemorySection.jsx`** — stub:
```jsx
import EmptyState from '../components/EmptyState.jsx'
export default function MemorySection() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Yaadein</h1>
      <EmptyState icon="📸" title="No memories yet" description="Capture your family's precious moments — photos, stories, and milestones." />
    </div>
  )
}
```

**`src/sections/HomeSection.jsx`** — uses dashboard hook:
```jsx
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/react'
import { useFamily } from '../contexts/FamilyContext.jsx'
import { dashboard as dashboardApi } from '../lib/api.js'
import { formatINR } from '../hooks/useExpenses.js'
import SectionSkeleton from '../components/SectionSkeleton.jsx'
import { useNavigate } from 'react-router-dom'

const HOUR = new Date().getHours()
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening'

export default function HomeSection() {
  const { family, members } = useFamily()
  const { getToken, userId: clerkUserId } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!family?.id) return
    async function load() {
      try {
        const token = await getToken()
        const res = await dashboardApi.get(family.id, token)
        setData(res)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [family?.id])

  if (loading) return <SectionSkeleton rows={6} />

  const me = members[0]

  return (
    <div style={{ maxWidth: '720px' }}>
      {/* Maahi greeting */}
      <div style={{ background: 'linear-gradient(135deg, #1A2E5C, #2A4E8C)', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', color: '#fff' }}>
        <p style={{ margin: '0 0 4px', fontSize: '14px', opacity: 0.75 }}>{GREETING}!</p>
        <p style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{family?.name}</p>
        <p style={{ margin: '8px 0 0', fontSize: '15px', opacity: 0.85 }}>
          {members.length} member{members.length !== 1 ? 's' : ''} · {family?.city || 'Your family space'}
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: '+ Expense', path: '/family/wealth', emoji: '💸' },
          { label: '+ Event', path: '/family/calendar', emoji: '📅' },
          { label: '+ Note', path: '/family/bulletin', emoji: '📌' },
          { label: 'Ask Maahi', path: '/family/maahi', emoji: '🤖' },
        ].map(a => (
          <button key={a.path} onClick={() => navigate(a.path)} style={{ height: '72px', background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#333', fontWeight: 500 }}>
            <span style={{ fontSize: '20px' }}>{a.emoji}</span>
            {a.label}
          </button>
        ))}
      </div>

      {/* Upcoming events */}
      {data?.events?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>Upcoming</p>
          {data.events.slice(0, 3).map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F3EE' }}>
              <span style={{ fontSize: '15px', color: '#333' }}>{e.title}</span>
              <span style={{ fontSize: '13px', color: '#888' }}>{new Date(e.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          ))}
        </div>
      )}

      {/* Monthly spend */}
      {data?.monthlyExpenseTotal > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>This month's spending</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1A2E5C' }}>{formatINR(data.monthlyExpenseTotal)}</p>
        </div>
      )}

      {/* Goals */}
      {data?.goals?.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '16px 20px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '16px', color: '#1A2E5C' }}>Goals</p>
          {data.goals.map(g => {
            const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0
            return (
              <div key={g.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', color: '#333' }}>{g.title}</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{pct}%</span>
                </div>
                <div style={{ background: '#F5F3EE', borderRadius: '4px', height: '6px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#E67E22', borderRadius: '4px' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

**`src/sections/SettingsSection.jsx`** — minimal:
```jsx
import { useClerk, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { useFamily } from '../contexts/FamilyContext.jsx'

export default function SettingsSection() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { family, members } = useFamily()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut(() => navigate('/auth'))
  }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1A2E5C', margin: '0 0 24px' }}>Settings</h1>

      <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '16px', color: '#1A1A1A' }}>{user?.fullName || 'Family Member'}</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{user?.primaryEmailAddress?.emailAddress}</p>
      </div>

      {family && (
        <div style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '16px', color: '#1A1A1A' }}>{family.name}</p>
          <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#666' }}>{members.length} member{members.length !== 1 ? 's' : ''}{family.city ? ` · ${family.city}` : ''}</p>
          {members.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderTop: '1px solid #F5F3EE' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E67E22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                {m.name.charAt(0)}
              </div>
              <div>
                <p style={{ margin: '0', fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>{m.name}</p>
                <p style={{ margin: '0', fontSize: '13px', color: '#888' }}>{m.role} {m.relationship ? `· ${m.relationship}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        style={{ width: '100%', height: '48px', background: '#fff', color: '#CC0000', border: '1px solid #CC0000', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
      >
        Sign Out
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/sections/
git commit -m "feat: add all section components (Bulletin, Wealth, Calendar, Documents, Goals, Care, Memory, Home, Settings)"
```

---

### Task 17: Rewrite `src/FamilyApp.jsx` as a shell

**Files:**
- Modify: `src/FamilyApp.jsx`

- [ ] **Step 1: Replace entire FamilyApp.jsx**

Replace the 3,339-line file with this ~150-line shell:

```jsx
import { useEffect } from 'react'
import { NavLink, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useClerk } from '@clerk/react'
import './FamilyApp.css'
import { FamilyProvider, useFamily } from './contexts/FamilyContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Onboarding from './components/Onboarding.jsx'

import HomeSection from './sections/HomeSection.jsx'
import BulletinSection from './sections/BulletinSection.jsx'
import WealthSection from './sections/WealthSection.jsx'
import CalendarSection from './sections/CalendarSection.jsx'
import CareSection from './sections/CareSection.jsx'
import GoalsSection from './sections/GoalsSection.jsx'
import DocumentsSection from './sections/DocumentsSection.jsx'
import MemorySection from './sections/MemorySection.jsx'
import SettingsSection from './sections/SettingsSection.jsx'
import MaahiAI from './sections/MaahiAI.jsx'

export default function FamilyApp() {
  return (
    <FamilyProvider>
      <FamilyAppInner />
    </FamilyProvider>
  )
}

function FamilyAppInner() {
  const { family, loading, maahiContext } = useFamily()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '18px', color: '#888' }}>
        Loading your family space…
      </div>
    )
  }

  if (!family) return <Onboarding />

  return (
    <div className="app-layout">
      <ScrollToTop />
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ErrorBoundary><HomeSection /></ErrorBoundary>} />
          <Route path="/bulletin" element={<ErrorBoundary><BulletinSection /></ErrorBoundary>} />
          <Route path="/wealth" element={<ErrorBoundary><WealthSection /></ErrorBoundary>} />
          <Route path="/calendar" element={<ErrorBoundary><CalendarSection /></ErrorBoundary>} />
          <Route path="/care" element={<ErrorBoundary><CareSection /></ErrorBoundary>} />
          <Route path="/goals" element={<ErrorBoundary><GoalsSection /></ErrorBoundary>} />
          <Route path="/documents" element={<ErrorBoundary><DocumentsSection /></ErrorBoundary>} />
          <Route path="/memories" element={<ErrorBoundary><MemorySection /></ErrorBoundary>} />
          <Route path="/maahi" element={<ErrorBoundary><MaahiAI familyContext={maahiContext} /></ErrorBoundary>} />
          <Route path="/settings" element={<ErrorBoundary><SettingsSection /></ErrorBoundary>} />
          {/* Legacy routes kept for backward compat */}
          <Route path="/hub" element={<ErrorBoundary><BulletinSection /></ErrorBoundary>} />
          <Route path="/legacy" element={<ErrorBoundary><DocumentsSection /></ErrorBoundary>} />
          <Route path="/planning" element={<ErrorBoundary><GoalsSection /></ErrorBoundary>} />
          <Route path="/rituals" element={<ErrorBoundary><MemorySection /></ErrorBoundary>} />
          <Route path="/ai" element={<ErrorBoundary><MaahiAI familyContext={maahiContext} /></ErrorBoundary>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

const NAV_ITEMS = [
  { to: '/family', end: true, icon: '🏠', label: 'Home' },
  { to: '/family/bulletin', icon: '💬', label: 'Bulletin' },
  { to: '/family/wealth', icon: '💸', label: 'Hisaab' },
  { to: '/family/care', icon: '🏥', label: 'Sehat' },
  { to: '/family/calendar', icon: '📅', label: 'Calendar' },
  { to: '/family/goals', icon: '🌟', label: 'Sapne' },
  { to: '/family/documents', icon: '📁', label: 'Kagaz' },
  { to: '/family/memories', icon: '📸', label: 'Yaadein' },
  { to: '/family/maahi', icon: '🤖', label: 'Maahi' },
  { to: '/family/settings', icon: '⚙️', label: 'Settings' },
]

function Sidebar() {
  const { signOut } = useClerk()
  const navigate = useNavigate()
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🏠</span>
        <span className="sidebar-brand-name">BiggFam</span>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="sidebar-signout" onClick={() => signOut(() => navigate('/auth'))}>
        Sign out
      </button>
    </aside>
  )
}

// Mobile bottom nav — shows only first 4 + "More" button
function BottomNav() {
  const location = useLocation()
  const primaryTabs = NAV_ITEMS.slice(0, 4)
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {primaryTabs.map(item => {
        const isActive = item.end
          ? location.pathname === '/family' || location.pathname === '/family/'
          : location.pathname.startsWith(item.to)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={`bottom-tab${isActive ? ' active' : ''}`}
          >
            <span className="bottom-tab-icon">{item.icon}</span>
            <span className="bottom-tab-label">{item.label}</span>
          </NavLink>
        )
      })}
      <NavLink to="/family/maahi" className={({ isActive }) => `bottom-tab${isActive ? ' active' : ''}`}>
        <span className="bottom-tab-icon">🤖</span>
        <span className="bottom-tab-label">Maahi</span>
      </NavLink>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/FamilyApp.jsx
git commit -m "refactor: replace 3339-line FamilyApp monolith with 150-line shell + section routing"
```

---

## Phase 5 — Navigation CSS

### Task 18: Add layout CSS for sidebar + bottom tabs + skeleton pulse

**Files:**
- Modify: `src/FamilyApp.css`

- [ ] **Step 1: Append layout system to `src/FamilyApp.css`**

Append this to the END of `src/FamilyApp.css` (do not replace — keep existing styles intact for now):

```css
/* ── Layout System ─────────────────────────────────────────────── */

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #F5F3EE;
}

/* ── Desktop Sidebar (≥ 768px) ─────────────────────────────────── */

.sidebar {
  display: none;
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #E0DDD8;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  flex-direction: column;
}

@media (min-width: 768px) {
  .sidebar {
    display: flex;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid #F5F3EE;
}

.sidebar-logo {
  font-size: 22px;
}

.sidebar-brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #1A2E5C;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  min-height: 48px;
  transition: background 150ms ease;
}

.sidebar-item:hover {
  background: #FFF6EF;
}

.sidebar-item.active {
  background: #FFF6EF;
  border-left: 3px solid #E67E22;
  color: #C0622A;
  padding-left: 9px; /* compensate for 3px border */
  font-weight: 600;
}

.sidebar-icon {
  font-size: 18px;
  width: 22px;
  text-align: center;
}

.sidebar-label {
  flex: 1;
}

.sidebar-signout {
  margin: 12px;
  padding: 12px;
  background: none;
  border: 1px solid #E0DDD8;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  min-height: 48px;
}

.sidebar-signout:hover {
  background: #F5F3EE;
}

/* ── Main Content ──────────────────────────────────────────────── */

.main-content {
  flex: 1;
  padding: 32px 40px;
  min-width: 0; /* prevent flex overflow */
  padding-bottom: 100px; /* space for bottom nav on mobile */
}

@media (max-width: 767px) {
  .main-content {
    padding: 16px 16px 100px;
  }
}

/* ── Mobile Bottom Nav (< 768px) ───────────────────────────────── */

.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1px solid #E0DDD8;
  z-index: 100;
}

@media (max-width: 767px) {
  .bottom-nav {
    display: flex;
  }
}

.bottom-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  text-decoration: none;
  color: #888;
  min-height: 56px;
  padding: 6px 2px;
  transition: color 150ms ease;
}

.bottom-tab.active {
  color: #C0622A;
}

.bottom-tab-icon {
  font-size: 22px;
  line-height: 1;
}

.bottom-tab-label {
  font-size: 11px;
  font-weight: 500;
}

/* ── Focus Rings ───────────────────────────────────────────────── */

*:focus-visible {
  outline: 3px solid #E67E22;
  outline-offset: 2px;
  border-radius: 4px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* ── Skeleton Pulse Animation ──────────────────────────────────── */

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ── Section Layout ────────────────────────────────────────────── */

.section-content {
  max-width: 720px;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/FamilyApp.css
git commit -m "feat: add mobile bottom nav, desktop sidebar, focus rings, skeleton pulse CSS"
```

---

## Phase 6 — Join Page

### Task 19: Create `/join` route for invite links

**Files:**
- Create: `src/components/JoinFamily.jsx`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create `src/components/JoinFamily.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { families as familiesApi } from '../lib/api.js'

export default function JoinFamily() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading') // loading | info | joining | success | error
  const [familyName, setFamilyName] = useState('')
  const [error, setError] = useState('')
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { setStatus('error'); setError('Invalid invite link.'); return }
    if (!isLoaded) return

    if (!isSignedIn) {
      // Save token and redirect to sign up, then come back
      sessionStorage.setItem('pendingInviteToken', token)
      navigate('/auth')
      return
    }

    async function fetchInfo() {
      try {
        const { family_name } = await familiesApi.getInviteInfo(token)
        setFamilyName(family_name)
        setStatus('info')
      } catch (err) {
        setStatus('error')
        setError(err.message)
      }
    }
    fetchInfo()
  }, [token, isLoaded, isSignedIn])

  async function handleJoin() {
    setStatus('joining')
    try {
      const authToken = await getToken()
      await familiesApi.join(token, authToken)
      setStatus('success')
      setTimeout(() => navigate('/family'), 1500)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  if (status === 'loading') return (
    <div style={centerStyle}><p style={{ color: '#888', fontSize: '18px' }}>Loading invite…</p></div>
  )

  if (status === 'success') return (
    <div style={centerStyle}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</p>
      <h2 style={{ color: '#1A2E5C', marginBottom: '8px' }}>Joined!</h2>
      <p style={{ color: '#666' }}>Taking you to {familyName}…</p>
    </div>
  )

  if (status === 'error') return (
    <div style={centerStyle}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>😕</p>
      <h2 style={{ color: '#CC0000', marginBottom: '8px' }}>Something went wrong</h2>
      <p style={{ color: '#666' }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '12px 24px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Go Home</button>
    </div>
  )

  return (
    <div style={centerStyle}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px 32px', maxWidth: '400px', width: '100%', border: '1px solid #E0DDD8', textAlign: 'center' }}>
        <p style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</p>
        <h2 style={{ color: '#1A2E5C', margin: '0 0 8px' }}>You're invited!</h2>
        <p style={{ color: '#666', margin: '0 0 24px' }}>Join <strong>{familyName}</strong> on BiggFam</p>
        <button
          onClick={handleJoin}
          disabled={status === 'joining'}
          style={{ width: '100%', height: '52px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }}
        >
          {status === 'joining' ? 'Joining…' : `Join ${familyName} →`}
        </button>
      </div>
    </div>
  )
}

const centerStyle = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F3EE', padding: '24px' }
```

- [ ] **Step 2: Add `/join` route to `src/main.jsx`**

In `src/main.jsx`, import `JoinFamily` and add the route before `/*`:

```jsx
import JoinFamily from './components/JoinFamily.jsx'
// ...
<Route path="/join" element={<JoinFamily />} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/JoinFamily.jsx src/main.jsx
git commit -m "feat: add /join route for invite link handling"
```

---

## Phase 7 — Environment Variables & Deployment

### Task 20: Verify env vars and deploy

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Verify all env vars are set locally**

Run:
```bash
cat .env.local
```

Expected — all 4 keys present:
```
DATABASE_URL=postgresql://...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIza...
```

- [ ] **Step 2: Set env vars in Vercel**

If Vercel CLI is installed (`npm i -g vercel`):
```bash
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_WEBHOOK_SECRET
vercel env add GEMINI_API_KEY
vercel env ls
```

Or set them in the Vercel Dashboard → Project Settings → Environment Variables.

- [ ] **Step 3: Test the build locally**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript or import errors.

- [ ] **Step 4: Final integration smoke test**

With `npm run dev`:
1. Visit `/auth` → Clerk SignIn/SignUp renders
2. Sign up as a new user → webhook fires → user row in DB
3. Visit `/family` → redirects to Onboarding (no family yet)
4. Create family → redirected to dashboard
5. Navigate to Bulletin → empty state shows
6. Create a post → appears in list
7. Navigate to Hisaab → add expense → shows in INR
8. Navigate to Kagaz → add document → shows in list
9. Visit `/family/maahi` → Maahi chat works
10. Visit `/auth` while signed in → redirects to `/family`

- [ ] **Step 5: Commit and tag**

```bash
git add -A
git commit -m "chore: final pre-beta cleanup and env var verification"
git tag beta-v1
```

---

## Self-Review — Spec Coverage Check

| PRD Requirement | Task Covered |
|---|---|
| Auth: localStorage stub removed | Tasks 9, 10 |
| Real Clerk auth (SignIn/SignUp/webhook) | Tasks 3, 8, 9, 10 |
| requireAuth on all API handlers | Task 4 |
| Family membership check on all data endpoints | Task 4 |
| user_id removed from req.body | Task 4 |
| FamilyApp.jsx split from monolith | Tasks 11–17 |
| FamilyContext + 6 hooks | Tasks 11–12 |
| Family onboarding flow | Task 14 |
| Maahi → Maahi renamed everywhere | Tasks 7, 15 |
| Maahi graceful error on missing API key | Task 7 |
| Family context injection in Maahi | Tasks 11, 17 |
| Expense section wired to real DB (INR) | Tasks 8, 12, 16 |
| Calendar section (new) | Task 16 |
| Bulletin section wired to real DB | Tasks 4, 12, 16 |
| Kagaz/Documents section (new UI) | Tasks 4, 12, 16 |
| Goals section wired to real DB | Tasks 4, 12, 16 |
| Care/Sehat section stub | Task 16 |
| Home dashboard with aggregate data | Tasks 6, 16 |
| Invite flow (generate + join) | Tasks 5, 14, 19 |
| Mobile bottom tab bar | Tasks 17, 18 |
| Desktop sidebar | Tasks 17, 18 |
| Error boundaries (no white screens) | Task 13, 17 |
| Empty states (no blank screens) | Task 13, 16 |
| Skeleton loaders (no spinners) | Task 13 |
| Focus rings (accessibility) | Task 18 |
| Color #C0622A for orange text | Used in all section CSS (inline styles) |
| WCAG-compliant touch targets (48px min) | Used in all components |
| Scroll-to-top on route change | Task 13, 17 |
| `/join` invite link handler | Task 19 |
| invite_tokens table | Task 1 |
| clerk_id on users table | Task 1 |
| completed col on bulletin_posts | Task 1 |
| GET /api/families/members | Task 5 |
| POST /api/families/join | Task 5 |
| GET /api/dashboard aggregate | Task 6 |
| CORS restricted on ai/chat | Task 7 |

**Missing from plan (P2 — add as follow-up tasks):**
- WealthSection: expense split modal (P2 in PRD)
- CareSection: full CRUD for health records and medications (P1 — expand stub in a follow-up task)
- MemorySection: add memory form wired to `/api/memories` (P1 — currently stub)
- SettingsSection: invite member button + language preference (P1)
- 404 page component (P2)
- `offline` banner for `navigator.onLine = false` (P2)
- Lighthouse CI GitHub Action (P1 for public launch)
- Rate limiting on `/api/ai/chat` (P1)

These are tracked as follow-up work after the beta foundation is solid.
