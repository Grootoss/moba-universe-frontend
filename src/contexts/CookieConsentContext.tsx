import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearStoredConsent,
  getStoredConsent,
  setStoredConsent,
  type CookieConsent,
} from '../utils/consent'
import { isMetrikaLoaded, loadYandexMetrika, disableYandexMetrika, hasMetrikaCookies } from '../utils/metrika'
import { isPrerender } from '../utils/prerender'

type CookieConsentContextValue = {
  consent: CookieConsent
  bannerVisible: boolean
  hasDecision: boolean
  accept: () => void
  reject: () => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

function applyConsent(value: Exclude<CookieConsent, null>) {
  if (value === 'accepted') {
    loadYandexMetrika()
    return
  }
  const needsReload = disableYandexMetrika()
  if (needsReload) window.location.reload()
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(() => getStoredConsent())
  const bannerVisible = consent === null

  useEffect(() => {
    if (isPrerender()) return
    if (consent === 'accepted') loadYandexMetrika()
  }, [consent])

  useEffect(() => {
    document.body.classList.toggle('has-cookie-banner', bannerVisible)
    return () => document.body.classList.remove('has-cookie-banner')
  }, [bannerVisible])

  const accept = useCallback(() => {
    setStoredConsent('accepted')
    setConsent('accepted')
    applyConsent('accepted')
  }, [])

  const reject = useCallback(() => {
    const hadAnalytics = isMetrikaLoaded() || hasMetrikaCookies()
    setStoredConsent('rejected')
    setConsent('rejected')
    const needsReload = disableYandexMetrika()
    if (hadAnalytics || needsReload) window.location.reload()
  }, [])

  const resetConsent = useCallback(() => {
    const hadAnalytics = isMetrikaLoaded() || getStoredConsent() === 'accepted' || hasMetrikaCookies()
    clearStoredConsent()
    setConsent(null)
    const needsReload = disableYandexMetrika()
    if (hadAnalytics || needsReload) window.location.reload()
  }, [])

  const value = useMemo(
    () => ({
      consent,
      bannerVisible,
      hasDecision: consent !== null,
      accept,
      reject,
      resetConsent,
    }),
    [consent, bannerVisible, accept, reject, resetConsent],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
