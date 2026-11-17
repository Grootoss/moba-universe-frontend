import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuizPreview } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizCard } from '../types/quiz'
import { siteOrigin } from '../utils/prerender'

export default function TestPreviewPage() {
  const { t } = useTranslation()
  const { lang = 'ru', slug = '' } = useParams()
  const [quiz, setQuiz] = useState<QuizCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  usePageTitle(quiz?.title || t('testsTitle'), quiz?.description || t('testsSubtitle'))
  usePrerenderReady(!loading)

  const schema = useMemo(
    () =>
      quiz
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: quiz.title,
            description: quiz.description,
            url: `${siteOrigin()}/${lang}/tests/${quiz.slug}`,
            inLanguage: lang,
          }
        : null,
    [quiz, lang],
  )
  useJsonLd(schema)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    fetchQuizPreview(slug, lang)
      .then((row) => {
        if (active) setQuiz(row)
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
  }, [slug, lang])

  if (!loading && (error || !quiz)) {
    return (
      <ErrorState
        title={t('errorTestTitle')}
        description={t('errorTestText')}
        actionLabel={t('testsBack')}
        actionTo={`/${lang}/tests`}
      />
    )
  }

  if (loading || !quiz) return <p className="state">{t('loading')}</p>

  return (
    <div className="page quiz-page">
      <Link to={`/${lang}/tests`} className="back-link">
        {t('testsBack')}
      </Link>
      <header className="page-header">
        <h1 className="page-header__title">{quiz.title}</h1>
        {quiz.description ? <p className="page-header__subtitle">{quiz.description}</p> : null}
      </header>
      <p className="article-card__date">
        {t('testsQuestionCount')}: {quiz.question_count}
      </p>
      <Link className="btn btn--primary quiz-next" to={`/${lang}/tests/${quiz.slug}/play`} rel="nofollow">
        {t('testsIntroStart')}
      </Link>
    </div>
  )
}
