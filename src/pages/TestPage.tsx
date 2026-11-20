import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuiz, quizListPath, quizStartPath, submitQuiz } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizPublic, QuizQuestionPublic, QuizSubmitResult } from '../types/quiz'
import { resolveMediaUrl } from '../utils/mediaUrl'

type Mode = 'one' | 'all'

function storedMode(): Mode {
  try {
    return sessionStorage.getItem('quiz-mode') === 'all' ? 'all' : 'one'
  } catch {
    return 'one'
  }
}

export default function TestPage() {
  const { t } = useTranslation()
  const { lang = 'ru', game = 'mlbb', slug = '' } = useParams()
  const [quiz, setQuiz] = useState<QuizPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number[]>>({})
  const [mode, setMode] = useState<Mode>(storedMode)
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

  const choose = (question: QuizQuestionPublic, optionId: number) => {
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

  const changeMode = (next: Mode) => {
    setMode(next)
    try {
      sessionStorage.setItem('quiz-mode', next)
    } catch {
      /* private mode */
    }
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

  const again = () => {
    setReview(null)
    setAnswers({})
    setIndex(0)
    setSubmitError(false)
  }

  const folder = quiz?.game || game
  const startPath = quizStartPath(lang, slug, folder)
  const listPath = quizListPath(lang, folder)

  if (!loading && (error || !quiz)) {
    return (
      <ErrorState
        title={t('errorTestTitle')}
        description={t('errorTestText')}
        actionLabel={t('testsBack')}
        actionTo={listPath}
      />
    )
  }

  if (loading || !quiz) return <p className="state">{t('loading')}</p>

  if (review) {
    return (
      <div className="page quiz-page">
        <Link to={startPath} className="back-link">
          {t('testsBackToStart')}
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
        <button type="button" className="btn btn--primary quiz-next" onClick={again}>
          {t('testsAgain')}
        </button>
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

  const answered = quiz.questions.filter((item) => (answers[item.id] || []).length > 0).length
  const ready = answered === quiz.questions.length

  const options = (question: QuizQuestionPublic) => (
    <div className="quiz-options" role="group" aria-label={question.prompt}>
      {question.options.map((option) => {
        const active = (answers[question.id] || []).includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            className={`quiz-option${active ? ' quiz-option--selected' : ''}`}
            aria-pressed={active}
            onClick={() => choose(question, option.id)}
          >
            {option.text}
          </button>
        )
      })}
    </div>
  )

  const question = quiz.questions[index]
  const selected = question ? answers[question.id] || [] : []
  const last = index === quiz.questions.length - 1

  return (
    <div className="page quiz-page">
      <Link to={startPath} className="back-link">
        {t('testsBackToStart')}
      </Link>
      <div className="quiz-mode" role="group" aria-label={t('testsModeLabel')}>
        <button
          type="button"
          className={`articles-categories__btn${mode === 'one' ? ' articles-categories__btn--active' : ''}`}
          onClick={() => changeMode('one')}
        >
          {t('testsModeOne')}
        </button>
        <button
          type="button"
          className={`articles-categories__btn${mode === 'all' ? ' articles-categories__btn--active' : ''}`}
          onClick={() => changeMode('all')}
        >
          {t('testsModeAll')}
        </button>
      </div>
      {mode === 'one' && question ? (
        <>
          <p className="quiz-progress">{t('testsProgress', { current: index + 1, total: quiz.questions.length })}</p>
          <article className="quiz-question">
            <h1>{question.prompt}</h1>
            {resolveMediaUrl(question.image) ? (
              <img className="quiz-question__image" src={resolveMediaUrl(question.image) || ''} alt="" />
            ) : null}
            {options(question)}
          </article>
          {submitError ? <p className="admin-login__error">{t('errorTestsText')}</p> : null}
          <div className="quiz-nav">
            <button
              type="button"
              className="btn quiz-nav__back"
              disabled={index === 0}
              onClick={() => setIndex((value) => value - 1)}
            >
              {t('testsBackQuestion')}
            </button>
            {last ? (
              <button
                type="button"
                className="btn btn--primary quiz-next"
                disabled={!ready || submitting}
                onClick={() => void finish()}
              >
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
        </>
      ) : (
        <>
          <p className="quiz-progress">
            {t('testsAnswered', { current: answered, total: quiz.questions.length })}
          </p>
          <div className="quiz-all">
            {quiz.questions.map((item, itemIndex) => (
              <article key={item.id} className="quiz-question">
                <h2>
                  {itemIndex + 1}. {item.prompt}
                </h2>
                {resolveMediaUrl(item.image) ? (
                  <img className="quiz-question__image" src={resolveMediaUrl(item.image) || ''} alt="" />
                ) : null}
                {options(item)}
              </article>
            ))}
          </div>
          {submitError ? <p className="admin-login__error">{t('errorTestsText')}</p> : null}
          <button type="button" className="btn btn--primary quiz-next" disabled={!ready || submitting} onClick={() => void finish()}>
            {submitting ? t('loading') : t('testsFinish')}
          </button>
        </>
      )}
    </div>
  )
}
