import { clearTokens, fetchMe, getAccessToken } from '../api/auth'
import type { AuthUser } from '../types/profile'

export async function resolveAuthUser(): Promise<AuthUser | null> {
  if (!getAccessToken()) return null
  try {
    return await fetchMe()
  } catch {
    clearTokens()
    return null
  }
}

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isStaff(user: AuthUser | null | undefined): boolean {
  return user?.role === 'admin' || user?.role === 'moderator'
}
