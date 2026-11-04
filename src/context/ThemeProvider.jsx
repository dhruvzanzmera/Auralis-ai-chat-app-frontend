import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'

const THEME_STORAGE_KEY = 'auralis-theme'

function getInitialTheme() {
  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    return theme
  } catch {
    document.documentElement.dataset.theme = 'light'
    return 'light'
  }
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error('Unable to save the selected theme.', error)
    }
  }, [theme])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export default ThemeProvider
