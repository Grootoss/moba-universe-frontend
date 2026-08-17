import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCookieConsent } from '../contexts/CookieConsentContext'

export default function AppFooter() {
  const { t } = useTranslation()
  const { resetConsent } = useCookieConsent()
  const { lang = 'ru' } = useParams()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner container container--wide">
        <div className="footer__brand">
          <Link to={`/${lang}`} className="footer__logo">
            {t('logoPrefix')}
            {t('logoSuffix')}
          </Link>
          <p className="footer__tagline">{t('footerTagline')}</p>
        </div>
        <p className="footer__disclaimer">{t('footerDisclaimer')}</p>
        <nav className="footer__links" aria-label="Legal">
          <Link to={`/${lang}/privacy`} className="footer__link">
            {t('privacyLink')}
          </Link>
          <Link to={`/${lang}/terms`} className="footer__link">
            {t('termsLink')}
          </Link>
          <button type="button" className="footer__link footer__link--btn" onClick={resetConsent}>
            {t('cookieSettings')}
          </button>
        </nav>
        <p className="footer__copy">{t('footerRights', { year })}</p>
      </div>
    </footer>
  )
}
