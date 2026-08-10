import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { termsDocs } from '../content/terms'
import { usePageTitle } from '../hooks/usePageTitle'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import { siteOrigin } from '../utils/prerender'
import type { Lang } from '../types/article'

export default function TermsPage() {
  const { t, i18n } = useTranslation()
  const { lang = 'ru' } = useParams()

  const doc = useMemo(
    () => termsDocs[(i18n.language as Lang) || 'ru'] ?? termsDocs.ru,
    [i18n.language],
  )

  const termsSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: doc.title,
      description: doc.intro.slice(0, 280),
      inLanguage: lang,
      url: `${siteOrigin()}/${lang}/terms`,
    }),
    [doc, lang],
  )

  usePageTitle(doc.title, doc.intro.slice(0, 280))
  useJsonLd(termsSchema)
  usePrerenderReady(true)

  return (
    <div className="page page--legal">
      <nav className="legal-nav">
        <Link to={`/${lang}/evergreen`} className="back-link">
          {t('backToArticles')}
        </Link>
      </nav>

      <article className="legal-doc">
        <header className="legal-doc__header">
          <p className="legal-doc__eyebrow">Moba Universe</p>
          <h1 className="legal-doc__title">{doc.title}</h1>
          <p className="legal-doc__updated">{doc.updatedLabel}</p>
          <p className="legal-doc__intro">{doc.intro}</p>
        </header>

        <div className="legal-doc__toc">
          <p className="legal-doc__toc-title">{i18n.language === 'ru' ? 'Содержание' : 'Contents'}</p>
          <ol className="legal-doc__toc-list">
            {doc.sections.map((section, index) => (
              <li key={section.title}>
                <a href={`#terms-section-${index}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </div>

        {doc.sections.map((section, index) => (
          <section key={section.title} id={`terms-section-${index}`} className="legal-doc__section">
            <h2>
              {index + 1}. {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)}
            {section.list?.length ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {doc.note ? <aside className="legal-doc__note">{doc.note}</aside> : null}
      </article>
    </div>
  )
}
