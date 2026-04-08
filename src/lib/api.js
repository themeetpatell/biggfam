/**
 * BiggFam API client — all requests include Bearer token from Clerk
 */

const BASE = '/api'

/**
 * Retry wrapper for GET requests that fail with network errors.
 * Retries once after 1000ms on fetch errors (not HTTP error responses).
 */
async function fetchWithRetry(url, options = {}) {
  try {
    return await fetch(url, options)
  } catch (error) {
    // Only retry on network errors for GET requests
    if (options.method && options.method !== 'GET') {
      throw error
    }
    if (!options.method) {
      // Default method is GET, retry after 1000ms
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return fetch(url, options)
    }
    throw error
  }
}

async function req(path, options = {}) {
  const { token, ...rest } = options
  const res = await fetchWithRetry(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
    ...rest,
    body: rest.body ? JSON.stringify(rest.body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(
      res.ok
        ? `Server returned non-JSON response (${res.status})`
        : `API error ${res.status} — is the dev server running? (vercel dev)`
    )
  }
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
