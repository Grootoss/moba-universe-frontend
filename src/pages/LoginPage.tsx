import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clearTokens, fetchMe, login } from '../api/auth'
import { usePageTitle } from '../hooks/usePageTitle'

export default function LoginPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<'' | 'authLoginError' | 'authLoginStaffOnly' | 'authLoginRateLimit'>('')
  const [loading, setLoading] = useState(false)

  usePageTitle(t('authLoginTitle'))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      const me = await fetchMe()
      if (me.role === 'admin' || me.role === 'moderator') {
        clearTokens()
        setError('authLoginStaffOnly')
        return
      }
      void navigate(`/${lang}/profile`, { replace: true })
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : ''
      setError(msg.includes('too many') ? 'authLoginRateLimit' : 'authLoginError')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t('authLoginTitle')}</h1>
        <p className="auth-card__hint">{t('authLoginHint')}</p>
        {error ? <p className="admin-login__error">{t(error)}</p> : null}

        <label className="admin-field">
          <span>{t('authEmail')}</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>{t('authPassword')}</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? t('loading') : t('authLoginSubmit')}
        </button>

        <p className="auth-card__footer">
          {t('authNoAccount')}{' '}
          <Link to={`/${lang}/register`}>{t('authRegisterLink')}</Link>
        </p>
      </form>
    </div>
  )
}
