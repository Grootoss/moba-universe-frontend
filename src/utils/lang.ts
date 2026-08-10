import type { Lang } from '../types/article'

export const SUPPORTED_LANGS: Lang[] = ['ru', 'en']

export function normalizeLang(value: unknown): Lang | null {
  if (typeof value !== 'string') return null
  return SUPPORTED_LANGS.includes(value as Lang) ? (value as Lang) : null
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
