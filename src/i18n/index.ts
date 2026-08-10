import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ru from '../locales/ru.json'
import type { Lang } from '../types/article'

const savedLang = (localStorage.getItem('lang') as Lang | null) || 'ru'

void i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language

export function setLocale(lang: Lang) {
  void i18n.changeLanguage(lang)
  localStorage.setItem('lang', lang)
  document.documentElement.lang = lang
}

export default i18n
