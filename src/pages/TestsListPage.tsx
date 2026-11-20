import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePageTitle } from '../hooks/usePageTitle'
import { usePrerenderReady } from '../hooks/usePrerenderReady'

export default function TestsListPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()

  usePageTitle(t('testsTitle'), t('testsHubText'))
  usePrerenderReady(true)

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-header__title">{t('testsTitle')}</h1>
        <p className="page-header__subtitle">{t('testsHubText')}</p>
      </header>
      <div className="quiz-hub">
        <Link className="quiz-hub__card" to={`/${lang}/tests/mlbb?role=roam`}>
          <img className="quiz-hub__art" src="/images/quiz/mlbb.svg" alt="" />
          <div className="quiz-hub__body">
            <p className="quiz-hub__kicker">MLBB</p>
            <h2>{t('testsMlbbTitle')}</h2>
            <p>{t('testsMlbbText')}</p>
            <span className="btn btn--primary">{t('testsOpenGame')}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
