/**
 * FamilyOS API client
 * All requests go to /api/* — proxied to Vercel serverless functions in dev,
 * served directly on Vercel in production.
 */

const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `API error ${res.status}`)
  return data
}

// ── Users ────────────────────────────────────────────────────────────────────
export const users = {
  get: ({ id, email, phone }) => req(`/users?${new URLSearchParams({ id, email, phone }).toString()}`),
  create: (body) => req('/users', { method: 'POST', body }),
  update: (id, body) => req(`/users?id=${id}`, { method: 'PATCH', body }),
}

// ── Families ─────────────────────────────────────────────────────────────────
export const families = {
  list: (user_id) => req(`/families?user_id=${user_id}`),
  create: (body) => req('/families', { method: 'POST', body }),
}

// ── Calendar — Saath Mein ────────────────────────────────────────────────────
export const events = {
  list: (family_id, from, to) => {
    const params = new URLSearchParams({ family_id })
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    return req(`/events?${params}`)
  },
  create: (body) => req('/events', { method: 'POST', body }),
  delete: (id) => req(`/events?id=${id}`, { method: 'DELETE' }),
}

// ── Expenses — Ghar Ka Hisaab ────────────────────────────────────────────────
export const expenses = {
  list: (family_id, month, year) => {
    const params = new URLSearchParams({ family_id })
    if (month) params.set('month', month)
    if (year) params.set('year', year)
    return req(`/expenses?${params}`)
  },
  create: (body) => req('/expenses', { method: 'POST', body }),
  settle: (split_id) => req(`/expenses?split_id=${split_id}`, { method: 'PATCH', body: {} }),
}

// ── Bulletin ─────────────────────────────────────────────────────────────────
export const bulletin = {
  list: (family_id) => req(`/bulletin?family_id=${family_id}`),
  create: (body) => req('/bulletin', { method: 'POST', body }),
  pin: (id, pinned) => req(`/bulletin?id=${id}`, { method: 'PATCH', body: { pinned } }),
  delete: (id) => req(`/bulletin?id=${id}`, { method: 'DELETE' }),
}

// ── Health — Sehat ───────────────────────────────────────────────────────────
export const health = {
  list: (family_id, member_id) => {
    const params = new URLSearchParams({ family_id })
    if (member_id) params.set('member_id', member_id)
    return req(`/health?${params}`)
  },
  addRecord: (body) => req('/health', { method: 'POST', body }),
  addMedication: (body) => req('/health?type=medication', { method: 'POST', body }),
}

// ── Documents — Kagaz ────────────────────────────────────────────────────────
export const documents = {
  list: (family_id, filters = {}) => {
    const params = new URLSearchParams({ family_id, ...filters })
    return req(`/documents?${params}`)
  },
  create: (body) => req('/documents', { method: 'POST', body }),
  delete: (id) => req(`/documents?id=${id}`, { method: 'DELETE' }),
}

// ── Goals — Sapne ────────────────────────────────────────────────────────────
export const goals = {
  list: (family_id) => req(`/goals?family_id=${family_id}`),
  create: (body) => req('/goals', { method: 'POST', body }),
  contribute: (body) => req('/goals?type=contribution', { method: 'POST', body }),
}
