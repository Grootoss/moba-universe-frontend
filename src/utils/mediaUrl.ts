import { siteOrigin } from './prerender'

export type CoverSlot = 'mobile' | 'tablet' | 'desktop'

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

/** File sitting directly in /images, not in thumbs/ or promo/. */
function localCoverStem(url: string | null): string | null {
  if (!url) return null
  const local = url.match(/^\/images\/([^/]+)$/)
  if (!local) return null
  return local[1].replace(/\.[^.]+$/, '')
}

/** 16:9 crop generated from a local /images cover. Null for remote URLs. */
export function resolvePromoCoverUrl(cover?: string | null, kind: CoverSlot | 'mobile' | 'tablet' = 'mobile'): string | null {
  const stem = localCoverStem(resolveMediaUrl(cover))
  if (!stem || kind === 'desktop') return null
  return `/images/promo/${kind}/${stem}.jpg`
}

/**
 * Small list thumbnail.
 * A thumb that points at the full /images file is rewritten to /images/thumbs/{stem}.jpg.
 * Remote URLs are kept as-is.
 */
export function resolveListCoverUrl(cover?: string | null, thumb?: string | null): string | null {
  const explicit = resolveMediaUrl(thumb)
  const src = resolveMediaUrl(cover)
  if (explicit?.startsWith('/images/thumbs/')) return explicit
  if (explicit && !localCoverStem(explicit)) return explicit
  const stem = localCoverStem(src) || localCoverStem(explicit)
  if (stem) return `/images/thumbs/${stem}.jpg`
  return explicit || src
}

/** Ordered URLs to try. The first that loads wins; later ones are fallbacks. */
export function coverCandidateUrls(
  cover?: string | null,
  thumb?: string | null,
  slot: CoverSlot = 'desktop',
  purpose: 'list' | 'hero' = 'list',
): string[] {
  const full = resolveMediaUrl(cover)
  const small = resolveListCoverUrl(cover, thumb)
  const promo = resolvePromoCoverUrl(cover, slot)
  const ordered = purpose === 'hero' ? [promo, full, small] : [small, full]
  const urls: string[] = []
  for (const url of ordered) {
    if (url && !urls.includes(url)) urls.push(url)
  }
  return urls
}
