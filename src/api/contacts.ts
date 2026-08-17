import { authHeaders, refreshTokens } from './auth'
import type { ContactItem, ContactsList } from '../types/profile'

async function authFetch(input: string, init?: RequestInit): Promise<Response> {
  let res = await fetch(input, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  })
  if (res.status === 401) {
    const ok = await refreshTokens()
    if (!ok) return res
    res = await fetch(input, {
      ...init,
      headers: { ...authHeaders(), ...(init?.headers || {}) },
    })
  }
  return res
}

async function parseError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}))
  if (typeof err.detail === 'string') return err.detail
  return 'Request failed'
}

export async function fetchMyContacts(): Promise<ContactsList> {
  const res = await authFetch('/api/me/contacts')
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function requestUserContact(userId: number): Promise<ContactItem> {
  const res = await authFetch(`/api/users/${userId}/contact-request`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function acceptContact(requestId: number): Promise<ContactItem> {
  const res = await authFetch(`/api/me/contacts/${requestId}/accept`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function declineContact(requestId: number): Promise<ContactItem> {
  const res = await authFetch(`/api/me/contacts/${requestId}/decline`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
