import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import { useMemo } from 'react'

export default function HomePage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Moba Universe',
      url: `${siteOrigin()}/${lang}`,
      description: t('homeSubtitle'),
      inLanguage: lang,
    }),
    [t, lang],
  )

  usePageTitle(t('homeTitle'), t('homeSubtitle'))
  useJsonLd(schema)
  usePrerenderReady(true)

  return (
    <div className="page home-page">
      <header className="page-header home-page__header">
        <p className="page-header__eyebrow">{t('homeEyebrow')}</p>
        <h1 className="page-header__title">{t('homeTitle')}</h1>
        <p className="page-header__subtitle">{t('homeSubtitle')}</p>
      </header>

      <div className="home-tiles">
        <Link to={`/${lang}/evergreen`} className="home-tile">
          <span className="home-tile__kicker">{t('homeGuidesKicker')}</span>
          <span className="home-tile__title">{t('navGuides')}</span>
          <span className="home-tile__text">{t('homeGuidesText')}</span>
        </Link>
        <Link to={`/${lang}/users`} className="home-tile">
          <span className="home-tile__kicker">{t('homeUsersKicker')}</span>
          <span className="home-tile__title">{t('navUsers')}</span>
          <span className="home-tile__text">{t('homeUsersText')}</span>
        </Link>
      </div>
    </div>
  )
}
