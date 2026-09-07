'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'quickspit-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      if (storedTheme && ['dark', 'light', 'system'].includes(storedTheme)) {
        setTheme(storedTheme)
      }
    } catch (e) {
      // localStorage might not be available
      console.warn('Failed to load theme from localStorage:', e)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme

      root.classList.remove('light', 'dark')
      root.classList.add(resolvedTheme)
      root.style.colorScheme = resolvedTheme
    }

    applyTheme()
    if (theme !== 'system') return

    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [theme])

  const value: ThemeProviderState = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      } catch (e) {
        console.warn('Failed to save theme to localStorage:', e)
        setTheme(theme)
      }
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
