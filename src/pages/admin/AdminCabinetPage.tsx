import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clearToken, fetchMe } from '../../api/admin'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AdminCabinetPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [ready, setReady] = useState(false)

  usePageTitle(t('adminCabinetTitle'))

  useEffect(() => {
    fetchMe()
      .then((me) => {
        setEmail(me.email)
        setRole(me.role)
        setReady(true)
      })
      .catch(() => {
        clearToken()
        void navigate('/admin/login', { replace: true })
      })
  }, [navigate])

  if (!ready) return <p className="state">{t('loading')}</p>

  return (
    <div className="admin-cabinet">
      <header className="admin-page__hero admin-page__hero--row">
        <div className="admin-page__hero-text">
          <h1 className="admin-page__title">{t('adminCabinetTitle')}</h1>
          <p className="admin-page__subtitle">
            {email} ({role})
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => {
            clearToken()
            void navigate('/admin/login')
          }}
        >
          {t('adminLogout')}
        </button>
      </header>

      <section className="admin-cards">
        {role === 'admin' ? (
          <Link to="/admin/articles" className="admin-card">
            <h2>{t('adminNavArticles')}</h2>
            <p>{t('adminArticlesHint')}</p>
          </Link>
        ) : null}
        <Link to="/admin/profiles" className="admin-card">
          <h2>{t('adminNavProfiles')}</h2>
          <p>{t('adminProfilesHint')}</p>
        </Link>
      </section>
    </div>
  )
}
