import { createPortal } from 'react-dom'
import { Link, NavLink, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import LangSwitch from './LangSwitch'
import ThemeToggle from './ThemeToggle'
import { useMobileMenu } from '../hooks/useMobileMenu'
import { fetchMe, getAccessToken } from '../api/auth'

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
    `header__auth-link${isActive ? ' router-link-active' : ''}`

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `mobile-menu__link${isActive ? ' router-link-active' : ''}`

  return (
    <header className="header">
      <div className="header__inner container container--wide">
        <Link to={`/${lang}/evergreen`} className="logo" onClick={close}>
          <span className="logo__prefix">{t('logoPrefix')}</span>
          <span className="logo__suffix">{t('logoSuffix')}</span>
        </Link>

        <nav className="header__controls header__controls--desktop" aria-label="Main">
          <NavLink to={`/${lang}/users`} className={navClass}>
            {t('navUsers')}
          </NavLink>
          {isLoggedIn ? (
            <NavLink to={`/${lang}/profile`} className={navClass}>
              {t('navCabinet')}
            </NavLink>
          ) : (
            <NavLink to={`/${lang}/login`} className={navClass}>
              {t('navLogin')}
            </NavLink>
          )}
          <LangSwitch />
          <ThemeToggle />
        </nav>

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
