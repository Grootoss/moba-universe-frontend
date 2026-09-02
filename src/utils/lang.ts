import type { Lang } from '../types/article'

export const SUPPORTED_LANGS: Lang[] = ['ru', 'en']

const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function normalizeLang(value: unknown): Lang | null {
  if (typeof value !== 'string') return null
  return SUPPORTED_LANGS.includes(value as Lang) ? (value as Lang) : null
}

export function persistLangPreference(lang: Lang) {
  if (typeof window === 'undefined') return
  localStorage.setItem('lang', lang)
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `lang=${lang}; Path=/; Max-Age=${LANG_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function getStoredLang(): Lang {
  const saved = normalizeLang(localStorage.getItem('lang'))
  return saved ?? 'ru'
}

export function getActiveLang(): Lang {
  return normalizeLang(localStorage.getItem('lang')) ?? 'ru'
}

export function localizePath(path: string, lang?: Lang) {
  return `/${lang ?? getActiveLang()}${path}`
}
