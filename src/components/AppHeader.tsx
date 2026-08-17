import { createPortal } from 'react-dom'
import { Link, NavLink, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'
import { useMobileMenu } from '../hooks/useMobileMenu'
import { fetchMe, getAccessToken } from '../api/auth'

function LoginIcon() {
  return (
    <svg className="theme-toggle__svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 12H4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="theme-toggle__svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c.9-3.1 3.4-4.75 6.5-4.75s5.6 1.65 6.5 4.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function AppHeader() {
  const { t } = useTranslation()
  const { lang = 'ru' } = useParams()
  const { isOpen, toggle, close } = useMobileMenu()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (!getAccessToken()) return
    fetchMe()
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
  }, [])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `header__nav-link${isActive ? ' router-link-active' : ''}`

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `mobile-menu__link${isActive ? ' router-link-active' : ''}`

  return (
    <header className="header">
      <div className="header__inner container container--wide">
        <div className="header__brand">
          <Link to={`/${lang}`} className="logo" onClick={close}>
            <span className="logo__prefix">{t('logoPrefix')}</span>
            <span className="logo__suffix">{t('logoSuffix')}</span>
          </Link>
          <nav className="header__nav" aria-label="Main">
            <NavLink to={`/${lang}/evergreen`} className={navClass} onClick={close}>
              {t('navGuides')}
            </NavLink>
            <NavLink to={`/${lang}/users`} className={navClass} onClick={close}>
              {t('navUsers')}
            </NavLink>
          </nav>
        </div>

        <div className="header__controls header__controls--desktop">
          {isLoggedIn ? (
            <NavLink to={`/${lang}/profile`} className="header__icon-btn" aria-label={t('navCabinet')}>
              <UserIcon />
            </NavLink>
          ) : (
            <NavLink to={`/${lang}/login`} className="header__icon-btn" aria-label={t('navLogin')}>
              <LoginIcon />
            </NavLink>
          )}
          <LangSwitch />
          <ThemeToggle />
        </div>

        <button
          type="button"
          className={`hamburger${isOpen ? ' hamburger--open' : ''}`}
          aria-label={isOpen ? t('menuClose') : t('menuOpen')}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={toggle}
        >
          <span className="hamburger__line" />
          <span className="hamburger__line" />
          <span className="hamburger__line" />
        </button>
      </div>

      {createPortal(
        <div
          id="mobile-menu"
          className={`mobile-menu${isOpen ? ' mobile-menu--open' : ''}`}
          aria-hidden={!isOpen}
        >
          <div className="mobile-menu__overlay" onClick={close} />
          <aside className="mobile-menu__panel">
            <div className="mobile-menu__head">
              <span className="mobile-menu__title">{t('menuLabel')}</span>
              <button type="button" className="mobile-menu__close" aria-label={t('menuClose')} onClick={close}>
                ✕
              </button>
            </div>

            <nav className="mobile-menu__nav">
              <NavLink to={`/${lang}`} className={mobileNavClass} onClick={close} end>
                {t('navHome')}
              </NavLink>
              <NavLink to={`/${lang}/evergreen`} className={mobileNavClass} onClick={close}>
                {t('navGuides')}
              </NavLink>
              <NavLink to={`/${lang}/users`} className={mobileNavClass} onClick={close}>
                {t('navUsers')}
              </NavLink>
              {isLoggedIn ? (
                <NavLink to={`/${lang}/profile`} className={mobileNavClass} onClick={close}>
                  {t('navCabinet')}
                </NavLink>
              ) : (
                <NavLink to={`/${lang}/login`} className={mobileNavClass} onClick={close}>
                  {t('navLogin')}
                </NavLink>
              )}
              <NavLink to={`/${lang}/privacy`} className={mobileNavClass} onClick={close}>
                {t('privacyLink')}
              </NavLink>
              <NavLink to={`/${lang}/terms`} className={mobileNavClass} onClick={close}>
                {t('termsLink')}
              </NavLink>
            </nav>

            <div className="mobile-menu__settings">
              <div className="mobile-menu__setting">
                <span className="mobile-menu__setting-label">{t('menuLanguage')}</span>
                <LangSwitch layout="menu" />
              </div>
              <div className="mobile-menu__setting">
                <span className="mobile-menu__setting-label">{t('menuTheme')}</span>
                <ThemeToggle size="large" />
              </div>
            </div>
          </aside>
        </div>,
        document.body,
      )}
    </header>
  )
}
