import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = 'dark' | 'light' | 'system'
type ThemeProviderProps = { children: ReactNode; defaultTheme?: Theme; storageKey?: string }
type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void }

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'system'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const updateThemeClass = (theme: Theme) => {
  const root = window.document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark')
  root.classList.remove('light', 'dark')
  root.classList.add(isDark ? 'dark' : 'light')
}

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-theme' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    try {
      const stored = localStorage.getItem(storageKey)
      return (stored as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    updateThemeClass(theme)

    const onMediaChange = () => {
      if (theme === 'system') {
        updateThemeClass('system')
      }
    }

    media.addEventListener('change', onMediaChange)
    return () => media.removeEventListener('change', onMediaChange)
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme)
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e)
    }
  }, [theme, storageKey])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
