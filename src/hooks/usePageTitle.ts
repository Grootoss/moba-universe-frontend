import { useEffect } from 'react'
import { siteOrigin } from '../utils/prerender'

const SITE_NAME = 'Moba Universe'

const SITE_TAGLINE: Record<string, string> = {
  ru: 'путеводитель твоего скилла',
  en: 'your skill guidebook',
}

const DEFAULT_DESCRIPTION: Record<string, string> = {
  ru: 'Moba Universe: профили игроков и советы по MOBA.',
  en: 'Moba Universe: player profiles and MOBA tips.',
}

function currentLang(): string {
  return document.documentElement.lang === 'en' ? 'en' : 'ru'
}

function defaultTitle(): string {
  const lang = currentLang()
  return `${SITE_NAME} — ${SITE_TAGLINE[lang]}`
}

function ensureMetaDescription(): HTMLMetaElement {
  let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  return el
}

function ensureMetaByAttr(attr: 'name' | 'property', value: string): HTMLMetaElement {
  let el = document.querySelector(`meta[${attr}="${value}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }
  return el
}

function absoluteImageUrl(image?: string | null): string | null {
  const raw = image?.trim()
  if (!raw) return null
  if (/^https?:\/\//i.test(raw)) return raw
  const origin = siteOrigin() || window.location.origin
  return `${origin.replace(/\/$/, '')}${raw.startsWith('/') ? raw : `/${raw}`}`
}

export function usePageTitle(
  title?: string | null,
  description?: string | null,
  image?: string | null,
) {
  useEffect(() => {
    const lang = currentLang()
    const heading = title?.trim()
    const fullTitle = heading ? `${heading} | ${SITE_NAME}` : defaultTitle()
    document.title = fullTitle

    const desc = description?.trim() || DEFAULT_DESCRIPTION[lang]
    const normalizedDesc = desc.slice(0, 300)
    ensureMetaDescription().setAttribute('content', normalizedDesc)

    const pageUrl = `${siteOrigin()}${window.location.pathname}${window.location.search}`
    const imageUrl = absoluteImageUrl(image)

    ensureMetaByAttr('property', 'og:type').setAttribute('content', 'website')
    const locale = lang === 'ru' ? 'ru_RU' : 'en_US'
    ensureMetaByAttr('property', 'og:title').setAttribute('content', fullTitle)
    ensureMetaByAttr('property', 'og:description').setAttribute('content', normalizedDesc)
    ensureMetaByAttr('property', 'og:url').setAttribute('content', pageUrl)
    ensureMetaByAttr('property', 'og:site_name').setAttribute('content', SITE_NAME)
    ensureMetaByAttr('property', 'og:locale').setAttribute('content', locale)
    ensureMetaByAttr('name', 'twitter:card').setAttribute(
      'content',
      imageUrl ? 'summary_large_image' : 'summary',
    )
    ensureMetaByAttr('name', 'twitter:title').setAttribute('content', fullTitle)
    ensureMetaByAttr('name', 'twitter:description').setAttribute('content', normalizedDesc)

    if (imageUrl) {
      ensureMetaByAttr('property', 'og:image').setAttribute('content', imageUrl)
      ensureMetaByAttr('name', 'twitter:image').setAttribute('content', imageUrl)
    } else {
      document.querySelector('meta[property="og:image"]')?.remove()
      document.querySelector('meta[name="twitter:image"]')?.remove()
    }
  }, [title, description, image])
}
