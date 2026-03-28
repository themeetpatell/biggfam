# BiggFam Platform Overhaul — Design Spec

**Date:** 2026-03-28
**Author:** CTO Decision (Meet Patel)
**Status:** Approved

---

## Overview

BiggFam is a full-stack family management SaaS for Indian multigenerational families. This overhaul addresses three critical gaps identified in an audit of the current codebase:

1. Authentication is a stub (localStorage flag, no real users, no API security)
2. All UI data is hardcoded mock data — nothing talks to the database
3. UX is not accessible to older or less tech-savvy users

The current stack is kept intact: **React 19 + Vite (SPA), Vercel Serverless Functions (Node.js), Neon PostgreSQL**. No framework migration.

---

## Architecture Decision

**Stay on Vite + React.** The current architecture (SPA + Vercel Functions + Neon) is structurally sound. Migrating to Next.js would take 2–3 weeks and solve none of the user-facing problems. All required features can be added to the current stack.

---

## Phase 1 — Auth & Security

### Problem

- `Auth.jsx` sets `localStorage.setItem('familyos_auth', 'true')` — no API call, no user creation, no real session
- No route guards on `/family` — anyone can navigate there directly
- All API endpoints accept `user_id` / `family_id` from the request body with zero verification
- Real Neon DB credentials are in `.env.local`, likely committed to git

### Solution

#### 1.1 Clerk Integration

Install `@clerk/react` and `@clerk/backend`.

Replace `Auth.jsx` with Clerk's hosted `<SignIn />` and `<SignUp />` components, configured via Clerk's appearance API to match BiggFam brand (saffron-orange primary, Inter/Noto Sans font stack).

**Routing changes in `src/main.jsx`:**
- Wrap entire app in `<ClerkProvider publishableKey={...}>`
- Wrap `/family/*` and `/app/*` routes in a `<RequireAuth>` component that uses `useAuth()` from `@clerk/react`
- `<RequireAuth>` redirects to `/auth` if `!isSignedIn`

**Auth page (`/auth`):**
- Show `<SignIn />` by default
- Toggle to `<SignUp />` for new users
- Redirect to `/family` on success

#### 1.2 API Authorization Middleware

Create `api/_lib/auth.js` — a shared helper used by every Vercel Function:

```js
import { createClerkClient } from '@clerk/backend'
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export async function requireAuth(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) { res.status(401).json({ error: 'Unauthorized' }); return null }
  const { sub: clerkUserId } = await clerkClient.verifyToken(token)
  // Resolve our internal UUID from clerk_id
  const user = await queryOne('SELECT id FROM users WHERE clerk_id = $1', [clerkUserId])
  if (!user) { res.status(401).json({ error: 'User not found' }); return null }
  return user.id  // internal UUID — use this everywhere, never trust req.body.user_id
}
```

Every API handler becomes:
```js
export default async function handler(req, res) {
  const userId = await requireAuth(req, res)
  if (!userId) return  // requireAuth already sent 401
  // ... handler logic using verified userId
}
```

**All existing handlers are updated** to remove `user_id` from `req.body` usage and use the verified `userId` instead.

#### 1.3 User Sync Webhook

Create `api/webhooks/clerk.js`:
- Listens for Clerk's `user.created` event (verified with `svix` webhook signature)
- Inserts a row into the `users` table: `{ clerk_id, email, name, phone }`
- Returns the new user's internal UUID
- Clerk's `user.updated` event syncs email/name changes

Add `clerk_id VARCHAR(255) UNIQUE` column to the `users` table via a migration.

#### 1.4 Frontend Auth Header

Update `src/lib/api.js` to accept a token parameter on every request:
```js
export async function apiFetch(path, options = {}, token) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
```

Each feature hook calls `const { getToken } = useAuth()` (valid inside a hook/component), then passes `await getToken()` to `apiFetch`. The `api.js` module itself never imports React hooks.

#### 1.5 Security Hygiene

- Add `.env.local` and `.env*.local` to `.gitignore` immediately
- Rotate the exposed Neon database password (create new credentials in Neon dashboard)
- Add `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` to Vercel environment variables
- Add `CLERK_WEBHOOK_SECRET` for webhook verification

### Acceptance Criteria

- [ ] Unauthenticated users cannot reach `/family` — they are redirected to `/auth`
- [ ] Signup creates a real user record in PostgreSQL
- [ ] Login returns a valid JWT; API calls include this token
- [ ] All API endpoints return 401 for requests without a valid token
- [ ] No API endpoint trusts `user_id` from request body
- [ ] `.env.local` is gitignored; Neon password is rotated

---

## Phase 2 — Data Wiring

### Problem

- `FamilyApp.jsx` is 3,338 lines — monolith with 8 feature sections all in one file
- All data is hardcoded (family members, events, expenses, etc.)
- No API calls wired to the dashboard UI
- No onboarding flow for new families

### Solution

#### 2.1 Split the Monolith

Decompose `FamilyApp.jsx` into focused files:

```
src/
  FamilyApp.jsx          → ~200 lines: layout shell, nav, routing to sections
  contexts/
    FamilyContext.jsx    → family data, members, loading state
  hooks/
    useBulletin.js
    useExpenses.js
    useEvents.js
    useGoals.js
    useDocuments.js
    useHealth.js
    useMemory.js
  sections/
    HomeSection.jsx
    BulletinSection.jsx
    WealthSection.jsx
    CareSection.jsx
    CalendarSection.jsx
    GoalsSection.jsx
    DocumentsSection.jsx
    MemorySection.jsx
    SettingsSection.jsx
```

`FamilyApp.jsx` renders the layout and a `<Routes>` block that maps each path to its section component. It does not contain any feature logic.

#### 2.2 Family Context

`FamilyContext.jsx` provides:
- `family` — the authenticated user's family record (or null if not yet created)
- `members` — array of family members with profiles
- `currentUser` — the authenticated user's profile
- `loading` / `error` state
- `refetch()` — force re-fetch

Fetched once on mount using the auth token from Clerk's `useAuth()`. All section components consume this via `useFamily()` hook — they never fetch family/member data themselves.

#### 2.3 Feature Hooks

Each `use*.js` hook follows this contract:
```js
export function useExpenses() {
  const { family } = useFamily()
  const { getToken } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetch data from /api/expenses?family_id=... }, [family?.id])

  const add = async (payload) => { /* POST, then refetch */ }
  const remove = async (id) => { /* DELETE, then refetch */ }

  return { expenses: data, loading, error, add, remove }
}
```

All 7 feature hooks follow this pattern. No section component contains its own `fetch()` calls.

#### 2.4 Onboarding Flow

If `useFamily()` returns `family === null` (new user, no family yet), `FamilyApp.jsx` renders an `<Onboarding />` component instead of the dashboard:

- Step 1: "What's your family name?" (text input)
- Step 2: "Who's in your family?" (add members with name + relationship)
- Step 3: Share invite link

On completion, creates family via `POST /api/families` and redirects to the dashboard.

### Acceptance Criteria

- [ ] `FamilyApp.jsx` is ≤250 lines
- [ ] Each section is in its own file under `src/sections/`
- [ ] No hardcoded family/member/event/expense data anywhere in the codebase
- [ ] Dashboard shows real data from the database for a logged-in user
- [ ] New user who has never created a family sees the onboarding flow, not an empty dashboard
- [ ] All loading/error/empty states are handled in every section

---

## Phase 3 — UX for Every Age

### Problem

- Base font too small, low contrast in places
- Navigation uses icon-only patterns that confuse non-technical users
- No loading, empty, or error states
- Complex feature sections overwhelm first-time users
- Hindi-only section labels exclude non-Hindi speakers in the family

### Solution

#### 3.1 Design System

Install **shadcn/ui** + **Tailwind CSS**. Replace current component CSS with Tailwind utilities.

Token configuration:
- **Base font**: 18px (Noto Sans — supports Devanagari for Hindi text)
- **Touch targets**: minimum 48×48px on all interactive elements
- **Contrast**: all text/background pairs pass WCAG AA (4.5:1 minimum)
- **Primary accent**: `#E67E22` (saffron-orange) — warm, culturally resonant
- **Neutral base**: zinc-50/zinc-900 for light/dark

shadcn/ui components installed: `Button`, `Card`, `Input`, `Dialog`, `Sheet`, `Tabs`, `Badge`, `Skeleton`, `Alert`, `Avatar`, `DropdownMenu`, `Separator`, `Tooltip`

#### 3.2 Navigation Redesign

**Mobile (< 768px):** Fixed bottom tab bar with 5 primary sections
- Icon + label on every tab (never icon-only)
- Active tab highlighted with saffron accent
- "More" overflow menu for secondary sections

**Desktop (≥ 768px):** Persistent left sidebar
- Full icon + text label for every item
- Collapsible to icon+tooltip only if user explicitly collapses it (not by default)
- Section names shown bilingually: "Expenses (Ghar Ka Hisaab)" — English first, Hindi in parentheses

**No hamburger menus.** Hamburgers confuse older users who don't know to tap them.

#### 3.3 Feedback States

Every section implements three states beyond the happy path:

**Loading:** shadcn `<Skeleton>` cards matching the layout of real content. No spinners.

**Empty:** A centered illustration + plain-language prompt:
- "No expenses yet. Add your first one →" (Wealth)
- "No events this month. Plan something together →" (Calendar)
- Each empty state has one obvious CTA button.

**Error:** An `<Alert variant="destructive">` banner with:
- Plain-language message: "Couldn't load expenses. Check your connection."
- A "Try again" button that calls the hook's `refetch()`

#### 3.4 Progressive Disclosure

Complex sections (Wealth, Care) default to a summary card view:
- Wealth: total family balance, recent 3 transactions, "+ Add" button
- Care: upcoming medications due today, health alerts if any, "View all" link

Detail views are one tap deeper — not shown by default. This ensures elders see a clean summary; power users can drill in.

#### 3.5 Accessibility

- All images have `alt` text
- Form inputs have visible `<label>` elements (not placeholder-only)
- Focus ring visible on all interactive elements (not removed by `outline: none`)
- Color is never the sole indicator of state — always paired with text or icon
- Font size never drops below 14px anywhere in the UI

### Acceptance Criteria

- [ ] Base font 18px; no text below 14px
- [ ] All interactive elements ≥48px touch target
- [ ] Bottom tab bar on mobile with icon+label; sidebar on desktop with icon+label
- [ ] Every section has loading skeleton, empty state with CTA, and error state with retry
- [ ] Section names are bilingual (English primary, Hindi secondary)
- [ ] All text/background contrast passes WCAG AA
- [ ] No `outline: none` on focusable elements

---

## Database Changes

One migration required for Phase 1:

```sql
ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

No schema changes required for Phase 2 or 3.

---

## Environment Variables Required

| Variable | Phase | Purpose |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | 1 | Clerk frontend key (Vite `VITE_` prefix required) |
| `CLERK_SECRET_KEY` | 1 | Clerk backend verification |
| `CLERK_WEBHOOK_SECRET` | 1 | Webhook signature verification |
| `DATABASE_URL` | Existing | Neon connection string (rotate!) |

---

## Implementation Order

Phase 1 must be complete before Phase 2 (API auth required for real data fetching).
Phase 3 can proceed in parallel with Phase 2 (UI components independent of data layer).

Recommended sequence:
1. Phase 1 (Auth) — security blocker, ship first
2. Phase 2 + Phase 3 in parallel — data wiring and UI can be done simultaneously per section

---

## Out of Scope

- Internationalization (i18n) beyond bilingual labels — full translation system is a future project
- Mobile app (React Native) — future project
- Real-time features (WebSockets) — future project
- Payment/subscription system — future project
- AI features — future project
