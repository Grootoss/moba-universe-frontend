import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../locales/en.json'
import ru from '../locales/ru.json'
import type { Lang } from '../types/article'
import { getStoredLang, persistLangPreference } from '../utils/lang'

const savedLang = getStoredLang()

void i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

document.documentElement.lang = i18n.language
persistLangPreference(savedLang)

export function setLocale(lang: Lang) {
  void i18n.changeLanguage(lang)
  persistLangPreference(lang)
  document.documentElement.lang = lang
}

export default i18n
