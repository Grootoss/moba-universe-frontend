import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchMe, login } from '../../api/auth'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('admin@mobauniverse.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  usePageTitle(t('adminLoginTitle'))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      const me = await fetchMe()
      if (me.role !== 'admin' && me.role !== 'moderator') {
        setError(t('adminLoginNotStaff'))
        return
      }
      const redirect = searchParams.get('redirect') || '/admin'
      void navigate(redirect.startsWith('/admin') ? redirect : '/admin')
    } catch {
      setError(t('adminLoginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__form" onSubmit={onSubmit}>
        <h1 className="admin-login__title">{t('adminLoginTitle')}</h1>
        <p className="admin-login__hint">{t('adminLoginHint')}</p>

        <label className="admin-field">
          <span>{t('adminEmail')}</span>
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>{t('adminPassword')}</span>
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        {error ? <p className="admin-login__error">{error}</p> : null}

        <button className="admin-btn" type="submit" disabled={loading}>
          {loading ? t('loading') : t('adminLoginSubmit')}
        </button>
      </form>
    </div>
  )
}
