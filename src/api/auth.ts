import type { AuthUser, TokenPair } from '../types/profile'

const ACCESS_KEY = 'moba_access_token'
const REFRESH_KEY = 'moba_refresh_token'
const LEGACY_KEY = 'moba_admin_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY) || localStorage.getItem(LEGACY_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(pair: TokenPair) {
  localStorage.setItem(ACCESS_KEY, pair.access_token)
  localStorage.setItem(REFRESH_KEY, pair.refresh_token)
  localStorage.removeItem(LEGACY_KEY)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(LEGACY_KEY)
}

/** @deprecated use getAccessToken */
export function getToken(): string | null {
  return getAccessToken()
}

/** @deprecated use setTokens */
export function setToken(token: string) {
  localStorage.setItem(ACCESS_KEY, token)
  localStorage.removeItem(LEGACY_KEY)
}

/** @deprecated use clearTokens */
export function clearToken() {
  clearTokens()
}

export function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseErrors(res: Response): Promise<string[]> {
  const err = await res.json().catch(() => ({}))
  if (typeof err.detail === 'string') return [err.detail]
  if (Array.isArray(err.detail)) {
    return err.detail
      .map((d: { msg?: string; loc?: unknown[] }) => {
        const field = Array.isArray(d.loc) ? String(d.loc[d.loc.length - 1] ?? '') : ''
        const msg = d.msg || ''
        return field && field !== 'body' ? `${field}: ${msg}` : msg
      })
      .filter(Boolean)
  }
  return ['Request failed']
}

async function parseError(res: Response): Promise<string> {
  return (await parseErrors(res)).join('; ')
}

export class ApiError extends Error {
  errors: string[]
  constructor(errors: string[]) {
    super(errors.join('; '))
    this.errors = errors
  }
}

export async function register(payload: {
  email: string
  username: string
  password: string
  password_confirm: string
  privacy_consent: boolean
}): Promise<TokenPair> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new ApiError(await parseErrors(res))
  const data: TokenPair = await res.json()
  setTokens(data)
  return data
}

export async function logout(): Promise<void> {
  const send = () =>
    fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() })
  try {
    let res = await send()
    if (res.status === 401) {
      const refreshed = await refreshTokens()
      if (refreshed) res = await send()
    }
  } catch {
    // Still drop the local session if the network call fails.
  }
  clearTokens()
}

export async function login(email: string, password: string): Promise<TokenPair> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data: TokenPair = await res.json()
  setTokens(data)
  return data
}

export async function refreshTokens(): Promise<TokenPair | null> {
  const refresh = getRefreshToken()
  if (!refresh) return null
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  })
  if (!res.ok) {
    clearTokens()
    return null
  }
  const data: TokenPair = await res.json()
  setTokens(data)
  return data
}

export async function fetchMe(): Promise<AuthUser> {
  let res = await fetch('/api/auth/me', { headers: authHeaders() })
  if (res.status === 401) {
    const refreshed = await refreshTokens()
    if (!refreshed) throw new Error('Not authenticated')
    res = await fetch('/api/auth/me', { headers: authHeaders() })
  }
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}
