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

/** 16:9 crop generated from a local /images cover. Null for remote URLs. */
export function resolvePromoCoverUrl(cover?: string | null, kind: 'mobile' | 'tablet' = 'mobile'): string | null {
  const src = resolveMediaUrl(cover)
  if (!src) return null
  const local = src.match(/^\/images\/([^/]+)$/)
  if (!local) return null
  const stem = local[1].replace(/\.[^.]+$/, '')
  return `/images/promo/${kind}/${stem}.jpg`
}

/** Small list thumbnail — never point at the original full-size cover. */
export function resolveListCoverUrl(cover?: string | null, thumb?: string | null): string | null {
  const explicit = resolveMediaUrl(thumb)
  if (explicit) return explicit
  const src = resolveMediaUrl(cover)
  if (!src) return null
  if (src.startsWith('/images/thumbs/')) return src
  const local = src.match(/^\/images\/([^/]+)$/)
  if (local) {
    const stem = local[1].replace(/\.[^.]+$/, '')
    return `/images/thumbs/${stem}.jpg`
  }
  return null
}
