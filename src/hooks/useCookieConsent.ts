import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  clearStoredConsent,
  getStoredConsent,
  setStoredConsent,
  type CookieConsent,
} from '../utils/consent'
import { disableYandexMetrika, isMetrikaLoaded, loadYandexMetrika } from '../utils/metrika'

let consent: CookieConsent = getStoredConsent()

function applyConsent(value: CookieConsent) {
  if (value === 'accepted') {
    loadYandexMetrika()
    return
  }

  const needsReload = disableYandexMetrika()
  if (needsReload) {
    window.location.reload()
  }
}

if (consent === 'accepted') {
  loadYandexMetrika()
}

const consentListeners = new Set<() => void>()

function notifyConsentListeners() {
  consentListeners.forEach((listener) => listener())
}

export function useCookieConsent() {
  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick((n) => n + 1), [])

  useEffect(() => {
    consentListeners.add(rerender)
    return () => {
      consentListeners.delete(rerender)
    }
  }, [rerender])

  const bannerVisible = consent === null
  const hasDecision = useMemo(() => consent !== null, [])

  const accept = useCallback(() => {
    setStoredConsent('accepted')
    consent = 'accepted'
    notifyConsentListeners()
    applyConsent('accepted')
  }, [])

  const reject = useCallback(() => {
    setStoredConsent('rejected')
    consent = 'rejected'
    notifyConsentListeners()
    applyConsent('rejected')
  }, [])

  const resetConsent = useCallback(() => {
    const wasTracking = isMetrikaLoaded() || getStoredConsent() === 'accepted'
    clearStoredConsent()
    consent = null
    notifyConsentListeners()
    const needsReload = disableYandexMetrika()
    if (wasTracking || needsReload) {
      window.location.reload()
    }
  }, [])

  return {
    consent,
    bannerVisible,
    hasDecision,
    accept,
    reject,
    resetConsent,
  }
}
