import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuizzes, peekQuizzes } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizCard } from '../types/quiz'
import { siteOrigin } from '../utils/prerender'

export default function TestsListPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()
  const cachedTests = peekQuizzes(lang)
  const [tests, setTests] = useState<QuizCard[]>(cachedTests ?? [])
  const [loading, setLoading] = useState(cachedTests === undefined)
  const [error, setError] = useState(false)

  usePageTitle(t('testsTitle'), t('testsSubtitle'))
  usePrerenderReady(!loading)

  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('testsTitle'),
      description: t('testsSubtitle'),
      url: `${siteOrigin()}/${lang}/tests`,
      inLanguage: lang,
    }),
    [t, lang],
  )
  useJsonLd(schema)

  useEffect(() => {
    let active = true
    setError(false)
    const cached = peekQuizzes(lang)
    if (cached) {
      setTests(cached)
      setLoading(false)
    }
    fetchQuizzes(lang)
      .then((rows) => {
        if (active) setTests(rows)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [lang])

  if (!loading && error) {
    return (
      <ErrorState
        title={t('errorTestsTitle')}
        description={t('errorTestsText')}
        retryLabel={t('errorRetry')}
        onRetry={() => {
          setLoading(true)
          setError(false)
          fetchQuizzes(lang)
            .then(setTests)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
        }}
      />
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-header__title">{t('testsTitle')}</h1>
        <p className="page-header__subtitle">{t('testsSubtitle')}</p>
      </header>
      {loading ? (
        <p className="state">{t('loading')}</p>
      ) : tests.length === 0 ? (
        <p className="state">{t('testsEmpty')}</p>
      ) : (
        <div className="articles-grid">
          {tests.map((quiz, index) => (
            <article key={quiz.slug} className="article-card">
              <Link className="article-card__anchor" to={`/${lang}/tests/${quiz.slug}`}>
                <span className="article-card__num" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="article-card__body">
                  <h2 className="article-card__title">{quiz.title}</h2>
                  {quiz.description ? <p className="article-card__excerpt">{quiz.description}</p> : null}
                  <p className="article-card__date">
                    {t('testsQuestionCount')}: {quiz.question_count}
                  </p>
                  <span className="article-card__more">{t('testsStart')} →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
