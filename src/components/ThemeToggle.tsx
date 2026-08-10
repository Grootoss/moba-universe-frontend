import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

type Props = {
  size?: 'default' | 'large'
}

export default function ThemeToggle({ size = 'default' }: Props) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'dark' ? t('themeLight') : t('themeDark')

  return (
    <button
      type="button"
      className={`theme-toggle${size === 'large' ? ' theme-toggle--large' : ''}`}
      aria-label={label}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'dark' ? (
          <svg className="theme-toggle__svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M12 2.25v2.5M12 19.25v2.5M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2.25 12h2.5M19.25 12h2.5M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg className="theme-toggle__svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  )
}
