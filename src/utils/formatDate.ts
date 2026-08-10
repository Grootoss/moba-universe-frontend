const LOCALE: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

export function formatArticleDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(LOCALE[lang] ?? LOCALE.ru, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
