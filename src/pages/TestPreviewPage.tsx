import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuizPreview, quizListPath, quizPlayPath } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { useJsonLd } from '../hooks/useJsonLd'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizCard } from '../types/quiz'
import { siteOrigin } from '../utils/prerender'

export default function TestPreviewPage() {
  const { t } = useTranslation()
  const { lang = 'ru', game = 'mlbb', slug = '' } = useParams()
  const [quiz, setQuiz] = useState<QuizCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  usePageTitle(quiz?.title || t('testsTitle'), quiz?.description || t('testsSubtitle'))
  usePrerenderReady(!loading)

  const folder = quiz?.game || game
  const schema = useMemo(
    () =>
      quiz
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: quiz.title,
            description: quiz.description,
            url: `${siteOrigin()}${quizListPath(lang, folder)}/${quiz.slug}`,
            inLanguage: lang,
          }
        : null,
    [quiz, lang, folder],
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
        actionTo={quizListPath(lang, game)}
      />
    )
  }

  if (loading || !quiz) return <p className="state">{t('loading')}</p>

  return (
    <div className="page quiz-page">
      <Link to={`${quizListPath(lang, folder)}?role=${quiz.role || 'roam'}`} className="back-link">
        {t('testsBack')}
      </Link>
      {quiz.cover_image ? <img className="quiz-preview__cover" src={quiz.cover_image} alt="" /> : null}
      <header className="page-header">
        <h1 className="page-header__title">{quiz.title}</h1>
        {quiz.description ? <p className="page-header__subtitle">{quiz.description}</p> : null}
      </header>
      <p className="article-card__date">
        {t('testsQuestionCount')}: {quiz.question_count}
      </p>
      <Link className="btn btn--primary quiz-next" to={quizPlayPath(lang, quiz.slug, folder)} rel="nofollow">
        {t('testsIntroStart')}
      </Link>
    </div>
  )
}
