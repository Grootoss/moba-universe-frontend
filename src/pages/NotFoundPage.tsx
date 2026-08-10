import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ErrorState from '../components/ErrorState'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()
  usePageTitle(t('notFoundTitle'))

  return (
    <div className="page">
      <ErrorState
        code="404"
        title={t('notFoundTitle')}
        description={t('notFoundText')}
        actionLabel={t('notFoundAction')}
        actionTo={`/${lang}/evergreen`}
      />
    </div>
  )
}
