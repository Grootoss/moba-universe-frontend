import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchQuizzes, peekQuizzes, quizPlayPath, quizStartPath } from '../api/quizzes'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'
import type { QuizCard } from '../types/quiz'

const ROLES = ['roam', 'mid', 'jungle', 'exp', 'gold'] as const

export default function GameTestsPage() {
  const { t } = useTranslation()
  const { lang = 'ru', game = 'mlbb' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = searchParams.get('role') || 'roam'
  const cached = peekQuizzes(lang, game)
  const [tests, setTests] = useState<QuizCard[]>(cached ?? [])
  const [loading, setLoading] = useState(cached === undefined)
  const [error, setError] = useState(false)

  usePageTitle(t('testsMlbbTitle'), t('testsMlbbText'))
  usePrerenderReady(!loading)

  useEffect(() => {
    let active = true
    setError(false)
    const ready = peekQuizzes(lang, game)
    if (ready) {
      setTests(ready)
      setLoading(false)
    } else {
      setLoading(true)
    }
    fetchQuizzes(lang, game)
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
  }, [lang, game])

  const visible = useMemo(() => {
    if (role === 'all') return tests
    return tests.filter((quiz) => quiz.role === role)
  }, [tests, role])

  const chooseRole = (next: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('role', next)
    setSearchParams(params, { replace: true })
  }

  if (!loading && error) {
    return (
      <ErrorState
        title={t('errorTestsTitle')}
        description={t('errorTestsText')}
        retryLabel={t('errorRetry')}
        onRetry={() => {
          setLoading(true)
          setError(false)
          fetchQuizzes(lang, game)
            .then(setTests)
            .catch(() => setError(true))
            .finally(() => setLoading(false))
        }}
      />
    )
  }

  return (
    <div className="page">
      <Link to={`/${lang}/tests`} className="back-link">
        {t('testsBack')}
      </Link>
      <header className="page-header">
        <h1 className="page-header__title">{t('testsMlbbTitle')}</h1>
        <p className="page-header__subtitle">{t('testsMlbbText')}</p>
      </header>

      <div className="articles-categories-select">
        <label>
          <span className="visually-hidden">{t('testsRoleLabel')}</span>
          <select value={role} onChange={(event) => chooseRole(event.target.value)}>
            <option value="all">{t('testsRoleAll')}</option>
            {ROLES.map((item) => (
              <option key={item} value={item}>
                {t(`testsRole_${item}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <nav className="articles-categories quiz-roles" aria-label={t('testsRoleLabel')}>
        <button
          type="button"
          className={`articles-categories__btn${role === 'all' ? ' articles-categories__btn--active' : ''}`}
          onClick={() => chooseRole('all')}
        >
          {t('testsRoleAll')}
        </button>
        {ROLES.map((item) => (
          <button
            key={item}
            type="button"
            className={`articles-categories__btn articles-categories__btn--${item}${role === item ? ' articles-categories__btn--active' : ''}`}
            onClick={() => chooseRole(item)}
          >
            {t(`testsRole_${item}`)}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="state">{t('loading')}</p>
      ) : visible.length === 0 ? (
        <p className="state">{t('testsEmpty')}</p>
      ) : (
        <div className="quiz-grid">
          {visible.map((quiz) => (
            <article key={quiz.slug} className="quiz-tile">
              <Link className="quiz-tile__media" to={quizStartPath(lang, quiz.slug, quiz.game || game)}>
                <img src={quiz.cover_image || `/images/quiz/${quiz.role || 'roam'}-1.svg`} alt="" />
              </Link>
              <div className="quiz-tile__body">
                {role === 'all' && quiz.role ? (
                  <p className="quiz-tile__role">{t(`testsRole_${quiz.role}`)}</p>
                ) : null}
                <h2 className="quiz-tile__title">
                  <Link to={quizStartPath(lang, quiz.slug, quiz.game || game)}>{quiz.title}</Link>
                </h2>
                <p className="quiz-tile__count">
                  {t('testsQuestionCount')}: {quiz.question_count}
                </p>
                <Link
                  className="btn btn--primary quiz-tile__start"
                  to={quizPlayPath(lang, quiz.slug, quiz.game || game)}
                  rel="nofollow"
                >
                  {t('testsIntroStart')}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
