import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCookieConsent } from '../contexts/CookieConsentContext'

export default function CookieBanner() {
  const { t } = useTranslation()
  const { bannerVisible, accept, reject } = useCookieConsent()
  const { lang = 'ru' } = useParams()

  if (!bannerVisible) return null

  return createPortal(
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={t('cookieTitle')}>
      <div className="cookie-banner__inner">
        <div className="cookie-banner__text">
          <p className="cookie-banner__title">{t('cookieTitle')}</p>
          <p className="cookie-banner__desc">
            {t('cookieText')}{' '}
            <Link to={`/${lang}/privacy`} className="cookie-banner__link">
              {t('cookiePrivacyLink')}
            </Link>
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button type="button" className="btn btn--ghost" onClick={reject}>
            {t('cookieReject')}
          </button>
          <button type="button" className="btn btn--primary" onClick={accept}>
            {t('cookieAccept')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
