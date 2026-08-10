import { authHeaders, refreshTokens } from './auth'
import type {
  AdminProfile,
  OwnProfile,
  ProfileGamesPayload,
  ProfileOptions,
  ProfileUpdatePayload,
} from '../types/profile'

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

export async function fetchOwnProfile(): Promise<OwnProfile> {
  const res = await authFetch('/api/me/profile')
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateOwnProfile(body: ProfileUpdatePayload): Promise<OwnProfile> {
  const res = await authFetch('/api/me/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function updateOwnGames(body: ProfileGamesPayload): Promise<OwnProfile> {
  const res = await authFetch('/api/me/profile/games', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function submitOwnProfile(): Promise<OwnProfile> {
  const res = await authFetch('/api/me/profile/submit', { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function cancelOwnProfile(): Promise<OwnProfile> {
  const res = await authFetch('/api/me/profile/cancel', { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function fetchProfileOptions(): Promise<ProfileOptions> {
  const res = await fetch('/api/profile/options')
  if (!res.ok) throw new Error('Failed to load options')
  return res.json()
}

export async function fetchAdminProfiles(): Promise<AdminProfile[]> {
  const res = await authFetch('/api/admin/profiles')
  if (!res.ok) throw new Error('Failed to load profiles')
  return res.json()
}

export async function unlockAdminProfile(userId: number): Promise<AdminProfile> {
  const res = await authFetch(`/api/admin/profiles/${userId}/unlock`, { method: 'POST' })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function moderateProfile(
  userId: number,
  body: { moderation_status: string; is_public?: boolean; moderation_note?: string },
): Promise<AdminProfile> {
  const res = await authFetch(`/api/admin/profiles/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
