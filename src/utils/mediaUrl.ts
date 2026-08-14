import { siteOrigin } from './prerender'

/** Normalize cover/media path from DB: URL, /images/x.png, or bare filename. */
export function resolveMediaUrl(path?: string | null): string | null {
  const raw = path?.trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  if (!raw.includes('/')) return `/images/${raw}`
  return `/${raw.replace(/^\/+/, '')}`
}

export function absoluteMediaUrl(path?: string | null): string | null {
  const resolved = resolveMediaUrl(path)
  if (!resolved) return null
  if (/^https?:\/\//i.test(resolved)) return resolved
  const origin = siteOrigin() || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!origin) return resolved
  return `${origin.replace(/\/$/, '')}${resolved}`
}
