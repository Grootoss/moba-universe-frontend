import { getStoredConsent, METRIKA_ID } from './consent'

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void
    [key: `yaCounter${number}`]: unknown
  }
}

let loaded = false

type YmQueueFn = ((...args: unknown[]) => void) & {
  a?: unknown[][]
  l?: number
}

const METRIKA_COOKIE_PREFIXES = ['_ym', '_yasc', 'yandexuid', 'yuidss', 'ymex', 'bh', 'yp']

function isMetrikaCookieName(name: string) {
  const lower = name.toLowerCase()
  return METRIKA_COOKIE_PREFIXES.some(
    (prefix) => lower === prefix || lower.startsWith(prefix) || lower.includes('metrika'),
  )
}

export function hasMetrikaCookies() {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((cookie) => {
    const name = cookie.split('=')[0]?.trim()
    return Boolean(name && isMetrikaCookieName(name))
  })
}

function expireCookie(name: string) {
  const base = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  const host = location.hostname
  const domains = [undefined, host, `.${host}`]

  for (const domain of domains) {
    document.cookie = domain ? `${base}; path=/; domain=${domain}` : `${base}; path=/`
  }
}

function clearMetrikaCookies() {
  const names = new Set<string>()

  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (name && isMetrikaCookieName(name)) names.add(name)
  }

  for (const name of names) {
    expireCookie(name)
  }
}

export function isMetrikaLoaded() {
  return loaded
}

export function loadYandexMetrika() {
  if (loaded || typeof window === 'undefined' || window.__PRERENDER__) {
    return
  }

  loaded = true

  const w = window as Window & { ym?: YmQueueFn }
  w.ym =
    w.ym ||
    function (...args: unknown[]) {
      ;(w.ym!.a = w.ym!.a || []).push(args)
    }
  w.ym.l = Date.now()

  const src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`
  for (let j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === src) {
      return
    }
  }

  const script = document.createElement('script')
  script.async = true
  script.src = src
  script.dataset.metrika = 'true'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode?.insertBefore(script, firstScript)

  w.ym(METRIKA_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })
}

export function trackPageHit(url = location.href, title = document.title, referer?: string) {
  if (!loaded || getStoredConsent() !== 'accepted' || typeof window === 'undefined') {
    return
  }

  window.ym?.(METRIKA_ID, 'hit', url, {
    title,
    referer: referer || document.referrer,
  })
}

/** Fully stops Metrika/Webvisor after consent withdraw. Returns true if reload is recommended. */
export function disableYandexMetrika(): boolean {
  const wasLoaded = loaded
  loaded = false

  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.ym?.(METRIKA_ID, 'destroy')
  } catch {
    // destroy may be unavailable depending on tag version
  }

  document.querySelectorAll('script[src*="mc.yandex.ru"], script[data-metrika="true"]').forEach((el) => {
    el.remove()
  })

  document
    .querySelectorAll(
      'iframe[src*="mc.yandex"], iframe[src*="yandex.ru/metrika"], iframe[name*="ym"], div[class*="ym-"], noscript img[src*="mc.yandex"]',
    )
    .forEach((el) => el.remove())

  delete window.ym
  delete window[`yaCounter${METRIKA_ID}`]

  clearMetrikaCookies()

  // Webvisor may respawn cookies until reload; reload if anything analytics-related remains.
  return wasLoaded || hasMetrikaCookies()
}
