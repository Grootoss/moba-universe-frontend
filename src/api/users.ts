import type { PublicProfile } from '../types/profile'

export async function fetchPublicUsers(): Promise<PublicProfile[]> {
  const res = await fetch('/api/users')
  if (!res.ok) throw new Error('Failed to load users')
  return res.json()
}
