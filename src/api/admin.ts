import type {
  AdminArticle,
  AdminCategory,
  ArticleFormPayload,
  PublicProfile,
} from '../types/profile'
import { authHeaders, clearTokens, fetchMe, getAccessToken, login as authLogin, refreshTokens, setToken } from './auth'

export { clearTokens as clearToken, fetchMe, getAccessToken as getToken, setToken }

export async function fetchPublicProfile(userId: number): Promise<PublicProfile> {
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new Error('Profile not found')
  }
  let res = await fetch(`/api/users/${userId}`, { headers: { ...authHeaders() } })
  if (res.status === 401) {
    const ok = await refreshTokens()
    if (ok) {
      res = await fetch(`/api/users/${userId}`, { headers: { ...authHeaders() } })
    }
  }
  if (!res.ok && getAccessToken()) {
    const anon = await fetch(`/api/users/${userId}`)
    if (anon.ok) return anon.json()
  }
  if (!res.ok) throw new Error('Profile not found')
  return res.json()
}

export async function login(email: string, password: string): Promise<string> {
  const data = await authLogin(email, password)
  return data.access_token
}

export async function fetchAdminArticles(): Promise<AdminArticle[]> {
  const res = await fetch('/api/admin/articles', { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load articles')
  return res.json()
}

export async function fetchAdminArticle(id: number): Promise<AdminArticle> {
  const res = await fetch(`/api/admin/articles/${id}`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load article')
  return res.json()
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const res = await fetch('/api/admin/categories', { headers: authHeaders() })
  if (!res.ok) throw new Error('Failed to load categories')
  return res.json()
}

export async function createAdminArticle(body: ArticleFormPayload): Promise<AdminArticle> {
  const res = await fetch('/api/admin/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Create failed')
  }
  return res.json()
}

export async function updateAdminArticle(
  id: number,
  body: ArticleFormPayload,
): Promise<AdminArticle> {
  const res = await fetch(`/api/admin/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(typeof err.detail === 'string' ? err.detail : 'Update failed')
  }
  return res.json()
}

export async function deleteAdminArticle(id: number): Promise<void> {
  const res = await fetch(`/api/admin/articles/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Delete failed')
}
