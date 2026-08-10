import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { setLocale } from '../i18n'
import type { Lang } from '../types/article'

type Props = {
  layout?: 'inline' | 'menu'
}

export default function LangSwitch({ layout = 'inline' }: Props) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const switchLang = (lang: Lang) => {
    setLocale(lang)
    if (params.lang === lang) return

    const currentPath = location.pathname.replace(/^\/(ru|en)(?=\/|$)/, '')
    void navigate(`/${lang}${currentPath || '/mlbb'}${location.search}${location.hash}`)
  }

  return (
    <div
      className={`lang-switch${layout === 'menu' ? ' lang-switch--menu' : ''}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        className={`lang-switch__btn${i18n.language === 'ru' ? ' lang-switch__btn--active' : ''}`}
        onClick={() => switchLang('ru')}
      >
        ru
      </button>
      <span className="lang-switch__sep">/</span>
      <button
        type="button"
        className={`lang-switch__btn${i18n.language === 'en' ? ' lang-switch__btn--active' : ''}`}
        onClick={() => switchLang('en')}
      >
        en
      </button>
    </div>
  )
}
