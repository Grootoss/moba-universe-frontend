export type CookieConsent = 'accepted' | 'rejected' | null

export const CONSENT_STORAGE_KEY = 'cookie_consent'
export const METRIKA_ID = 110819737

export function getStoredConsent(): CookieConsent {
  const value = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (value === 'accepted' || value === 'rejected') {
    return value
  }
  return null
}

export function setStoredConsent(value: 'accepted' | 'rejected') {
  localStorage.setItem(CONSENT_STORAGE_KEY, value)
}

export function clearStoredConsent() {
  localStorage.removeItem(CONSENT_STORAGE_KEY)
}
