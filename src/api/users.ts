import type { PublicProfile } from '../types/profile'

export async function fetchPublicUsers(params?: {
  q?: string
  game?: string
  role?: string
}): Promise<PublicProfile[]> {
  const search = new URLSearchParams()
  const q = params?.q?.trim()
  if (q) search.set('q', q)
  const game = params?.game?.trim()
  if (game) search.set('game', game)
  const role = params?.role?.trim()
  if (role) search.set('role', role)
  const suffix = search.toString() ? `?${search}` : ''
  const res = await fetch(`/api/users${suffix}`)
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}
