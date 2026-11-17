import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuiz, submitQuiz } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizPublic, QuizSubmitResult } from '../types/quiz'
import { resolveMediaUrl } from '../utils/mediaUrl'

export default function TestPage() {
  const { t } = useTranslation()
  const { lang = 'ru', slug = '' } = useParams()
  const [quiz, setQuiz] = useState<QuizPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [review, setReview] = useState<QuizSubmitResult | null>(null)

  usePageTitle(quiz?.title || t('testsTitle'), quiz?.description || t('testsSubtitle'))
  usePrerenderReady(!loading)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(false)
    setIndex(0)
    setAnswers({})
    setReview(null)
    fetchQuiz(slug, lang)
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

  const question = quiz?.questions[index]
  const selected = question ? answers[question.id] || [] : []

  const choose = (optionId: number) => {
    if (!question) return
    setAnswers((current) => {
      const previous = current[question.id] || []
      const next = question.multiple
        ? previous.includes(optionId)
          ? previous.filter((id) => id !== optionId)
          : [...previous, optionId]
        : [optionId]
      return { ...current, [question.id]: next }
    })
  }

  const finish = async () => {
    if (!quiz) return
    setSubmitting(true)
    setSubmitError(false)
    try {
      const result = await submitQuiz(
        quiz.slug,
        lang,
        quiz.questions.map((item) => ({
          question_id: item.id,
          option_ids: answers[item.id] || [],
        })),
      )
      setReview(result)
    } catch {
      setSubmitError(true)
    } finally {
      setSubmitting(false)
    }
  }

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

  if (review) {
    return (
      <div className="page quiz-page">
        <Link to={`/${lang}/tests/${quiz.slug}`} className="back-link">
          {t('testsBack')}
        </Link>
        <header className="page-header">
          <h1 className="page-header__title">{quiz.title}</h1>
          <p className="page-header__subtitle">
            {t('testsScore')}: {review.score} / {review.total}
          </p>
        </header>
        {review.result ? (
          <section className="quiz-result">
            <h2>{review.result.title}</h2>
            {review.result.body ? <p>{review.result.body}</p> : null}
          </section>
        ) : null}
        <ol className="quiz-review">
          {review.questions.map((item, itemIndex) => {
            const image = resolveMediaUrl(item.image)
            return (
              <li key={item.id} className={`quiz-review__item${item.correct ? ' quiz-review__item--correct' : ''}`}>
                <h2>
                  {itemIndex + 1}. {item.prompt}
                </h2>
                {image ? <img className="quiz-question__image" src={image} alt="" /> : null}
                <ul className="quiz-options">
                  {item.options.map((option) => {
                    const state = option.is_correct
                      ? 'quiz-option--correct'
                      : option.selected
                        ? 'quiz-option--wrong'
                        : ''
                    return (
                      <li key={option.id} className={`quiz-option quiz-option--static ${state}`}>
                        {option.text}
                      </li>
                    )
                  })}
                </ul>
                {item.explanation ? (
                  <p className="quiz-review__explanation">
                    <strong>{t('testsExplanation')}: </strong>
                    {item.explanation}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  if (!question) {
    return (
      <ErrorState
        title={t('errorTestTitle')}
        description={t('errorTestText')}
        actionLabel={t('testsBack')}
        actionTo={`/${lang}/tests/${quiz.slug}`}
      />
    )
  }

  const image = resolveMediaUrl(question.image)
  const last = index === quiz.questions.length - 1

  return (
    <div className="page quiz-page">
      <Link to={`/${lang}/tests/${quiz.slug}`} className="back-link">
        {t('testsBack')}
      </Link>
      <p className="quiz-progress">
        {t('testsProgress', { current: index + 1, total: quiz.questions.length })}
      </p>
      <article className="quiz-question">
        <h1>{question.prompt}</h1>
        {image ? <img className="quiz-question__image" src={image} alt="" /> : null}
        <div className="quiz-options" role="group" aria-label={question.prompt}>
          {question.options.map((option) => {
            const active = selected.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                className={`quiz-option${active ? ' quiz-option--selected' : ''}`}
                aria-pressed={active}
                onClick={() => choose(option.id)}
              >
                {option.text}
              </button>
            )
          })}
        </div>
      </article>
      {submitError ? <p className="admin-login__error">{t('errorTestsText')}</p> : null}
      <div className="quiz-nav">
        <button type="button" className="btn quiz-nav__back" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>
          {t('testsBackQuestion')}
        </button>
        {last ? (
          <button type="button" className="btn btn--primary quiz-next" disabled={!selected.length || submitting} onClick={() => void finish()}>
            {submitting ? t('loading') : t('testsFinish')}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary quiz-next"
            disabled={!selected.length}
            onClick={() => setIndex((value) => value + 1)}
          >
            {t('testsNext')}
          </button>
        )}
      </div>
    </div>
  )
}
