import type { PublicProfile } from '../types/profile'

export async function fetchPublicUsers(params?: { q?: string }): Promise<PublicProfile[]> {
  const search = new URLSearchParams()
  const q = params?.q?.trim()
  if (q) search.set('q', q)
  const suffix = search.toString() ? `?${search}` : ''
  const res = await fetch(`/api/users${suffix}`)
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}
