/** Build-time prerender helpers (Playwright sets window.__PRERENDER__). */

declare global {
  interface Window {
    __PRERENDER__?: boolean
    __PRERENDER_READY__?: boolean
    /** Canonical public origin while snapshotting (e.g. https://mobauniverse.com) */
    __PRERENDER_PUBLIC_ORIGIN__?: string
  }
}

export function isPrerender(): boolean {
  return typeof window !== 'undefined' && Boolean(window.__PRERENDER__)
}

/** Absolute site origin for canonical / OG / JSON-LD. */
export function siteOrigin(): string {
  if (typeof window === 'undefined') return ''
  return (window.__PRERENDER_PUBLIC_ORIGIN__ || window.location.origin).replace(/\/$/, '')
}

export function clearPrerenderReady(): void {
  if (typeof window === 'undefined') return
  window.__PRERENDER_READY__ = false
}

export function markPrerenderReady(): void {
  if (typeof window === 'undefined') return
  window.__PRERENDER_READY__ = true
}
