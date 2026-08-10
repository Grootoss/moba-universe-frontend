import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, register } from '../api/auth'
import { usePageTitle } from '../hooks/usePageTitle'

const USERNAME_RE = /^[A-Za-zА-Яа-яЁё]+$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  usePageTitle(t('authRegisterTitle'))

  const validateClient = () => {
    const list: string[] = []
    const mail = email.trim()
    const nick = username.trim()
    if (!mail) list.push(t('authErrEmailRequired'))
    else if (!EMAIL_RE.test(mail)) list.push(t('authErrEmailInvalid'))
    if (!nick) list.push(t('authErrUsernameRequired'))
    else if (nick.length < 3 || nick.length > 10) list.push(t('authErrUsernameLength'))
    else if (!USERNAME_RE.test(nick)) list.push(t('authErrUsernameLetters'))
    if (!password) list.push(t('authErrPasswordRequired'))
    else if (password.length < 6 || password.length > 20) list.push(t('authErrPasswordLength'))
    if (!passwordConfirm) list.push(t('authErrPasswordConfirmRequired'))
    else if (password !== passwordConfirm) list.push(t('authErrPasswordMismatch'))
    if (!privacyConsent) list.push(t('authErrPrivacyConsent'))
    return list
  }

  const mapServerError = (msg: string) => {
    const lower = msg.toLowerCase()
    if (lower.includes('email already')) return t('authErrEmailTaken')
    if (lower.includes('username already')) return t('authErrUsernameTaken')
    if (lower.includes('passwords do not match')) return t('authErrPasswordMismatch')
    if (lower.includes('privacy consent')) return t('authErrPrivacyConsent')
    if (lower.includes('letters only') || lower.includes('username must contain')) return t('authErrUsernameLetters')
    if (lower.includes('3–10') || lower.includes('3-10') || lower.includes('username must be 3')) return t('authErrUsernameLength')
    if (lower.includes('password must be 6') || lower.includes('6–20') || lower.includes('6-20')) return t('authErrPasswordLength')
    if (lower.includes('value is not a valid email') || (lower.includes('email') && lower.includes('valid'))) return t('authErrEmailInvalid')
    return msg
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const clientErrors = validateClient()
    setErrors(clientErrors)
    if (clientErrors.length) return

    setLoading(true)
    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
        password_confirm: passwordConfirm,
        privacy_consent: privacyConsent,
      })
      void navigate(`/${lang}/profile`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors.map(mapServerError))
      else if (err instanceof Error) setErrors([mapServerError(err.message)])
      else setErrors([t('authRegisterError')])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page auth-page">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <h1>{t('authRegisterTitle')}</h1>

        {errors.length ? (
          <ul className="auth-errors" role="alert">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        ) : null}

        <label className="admin-field">
          <span>{t('authEmail')}</span>
          <input type="email" autoComplete="email" maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>{t('authUsername')}</span>
          <input
            type="text"
            autoComplete="username"
            maxLength={10}
            placeholder={t('authUsernameHint')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>{t('authPassword')}</span>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={20}
            placeholder={t('authPasswordHint')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span>{t('authPasswordConfirm')}</span>
          <input
            type="password"
            autoComplete="new-password"
            maxLength={20}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </label>

        <label className="auth-consent">
          <input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} />
          <span>
            {t('authPrivacyConsentPrefix')}{' '}
            <Link to={`/${lang}/privacy`} target="_blank">
              {t('authPrivacyConsentLink')}
            </Link>
          </span>
        </label>

        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? t('loading') : t('authRegisterSubmit')}
        </button>

        <p className="auth-card__footer">
          {t('authHaveAccount')}{' '}
          <Link to={`/${lang}/login`}>{t('authLoginLink')}</Link>
        </p>
      </form>
    </div>
  )
}
