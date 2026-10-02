import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteOrigin } from '../utils/prerender'

const MANAGED_ATTR = 'data-seo-managed'

function ensureLink(rel: string, hreflang?: string): HTMLLinkElement {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"][${MANAGED_ATTR}="1"]`
    : `link[rel="${rel}"][${MANAGED_ATTR}="1"]`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    el.setAttribute(MANAGED_ATTR, '1')
    document.head.appendChild(el)
  }
  return el
}

function absoluteUrl(path: string) {
  return `${siteOrigin()}${path}`
}

export function useSeoRoute() {
  const { pathname } = useLocation()

  useEffect(() => {
    const cleanPath = pathname || '/'
    const canonical = ensureLink('canonical')
    canonical.setAttribute('href', absoluteUrl(cleanPath))

    const matched = cleanPath.match(/^\/(ru|en)(\/.*)?$/)
    const hasLang = Boolean(matched?.[1])
    const tail = matched?.[2] ?? ''
    if (!hasLang) {
      document.head
        .querySelectorAll(`link[rel="alternate"][${MANAGED_ATTR}="1"]`)
        .forEach((el) => el.remove())
      return
    }

    const ruPath = `/ru${tail}`
    const enPath = `/en${tail}`
    ensureLink('alternate', 'ru').setAttribute('href', absoluteUrl(ruPath))
    ensureLink('alternate', 'en').setAttribute('href', absoluteUrl(enPath))
    ensureLink('alternate', 'x-default').setAttribute('href', absoluteUrl(ruPath))
    let feed = document.head.querySelector(
      'link[rel="alternate"][type="application/rss+xml"]',
    ) as HTMLLinkElement | null
    if (!feed) {
      feed = document.createElement('link')
      feed.rel = 'alternate'
      feed.type = 'application/rss+xml'
      feed.title = 'Moba Universe'
      document.head.appendChild(feed)
    }
    feed.href = `${siteOrigin()}/feed.xml`
  }, [pathname])
}
