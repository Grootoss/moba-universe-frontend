export function normalizeTelegramUrl(raw: string): string | null {
  const s = raw.trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  const handle = s
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:t\.me|telegram\.me)\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
  if (!handle) return null
  return `https://t.me/${handle}`
}

export function telegramFromContacts(
  contacts: { label: string; url: string; is_public?: boolean }[] | undefined,
  telegramUrl?: string | null,
): { url: string; is_public: boolean } {
  const tg = (contacts || []).find((c) => c.label.toLowerCase() === 'telegram' || c.label.toLowerCase() === 'tg')
  if (tg) return { url: tg.url, is_public: Boolean(tg.is_public) }
  if (telegramUrl) return { url: telegramUrl, is_public: false }
  return { url: '', is_public: false }
}
