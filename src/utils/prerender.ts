/** Build-time prerender helpers (Playwright sets window.__PRERENDER__). */

declare global {
  interface Window {
    __PRERENDER__?: boolean
    __PRERENDER_READY__?: boolean
    /** Canonical public origin while snapshotting (e.g. https://mobauniverse.com) */
    __PRERENDER_PUBLIC_ORIGIN__?: string
    /** Article payload written into the snapshot so hydration does not wipe the text. */
    __PRERENDER_BOOT__?: { slug: string; article: unknown; related?: unknown }
  }
}

export const PRODUCTION_ORIGIN = 'https://mobauniverse.com'

export function isPrerender(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__PRERENDER__)
}

/** Collapse www and http variants to the public apex origin. */
export function canonicalizeOrigin(origin: string): string {
  const clean = origin.replace(/\/$/, '')
  if (/^https?:\/\/(www\.)?mobauniverse\.com$/i.test(clean)) {
    return PRODUCTION_ORIGIN
  }
  return clean
}

/** Absolute site origin for canonical / OG / JSON-LD. */
export function siteOrigin(): string {
  if (typeof window === 'undefined') return PRODUCTION_ORIGIN
  const prerender = window.__PRERENDER_PUBLIC_ORIGIN__
  if (prerender) return canonicalizeOrigin(prerender)
  const fromEnv = import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined
  if (fromEnv) return canonicalizeOrigin(fromEnv)
  return canonicalizeOrigin(window.location.origin)
}

export function clearPrerenderReady(): void {
  if (typeof window === 'undefined') return
  window.__PRERENDER_READY__ = false
}

export function markPrerenderReady(): void {
  if (typeof window === 'undefined') return
  window.__PRERENDER_READY__ = true
}
