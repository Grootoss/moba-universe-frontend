import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const themeListeners = new Set<(theme: Theme) => void>()
let theme: Theme = (localStorage.getItem('theme') as Theme) || 'dark'

function applyTheme(value: Theme) {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
}

applyTheme(theme)

function setThemeState(value: Theme) {
  theme = value
  applyTheme(value)
  themeListeners.forEach((listener) => listener(value))
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<Theme>(theme)

  useEffect(() => {
    const listener = (value: Theme) => setCurrentTheme(value)
    themeListeners.add(listener)
    return () => {
      themeListeners.delete(listener)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState(currentTheme === 'light' ? 'dark' : 'light')
  }, [currentTheme])

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value)
  }, [])

  return { theme: currentTheme, toggleTheme, setTheme }
}
