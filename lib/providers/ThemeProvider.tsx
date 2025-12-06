'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'
import type { ThemeName } from '@/types'
import type { ThemeConfig } from '@/config/themes'

interface ThemeContextType {
  theme: ThemeName
  currentTheme: ThemeName
  themeConfig: ThemeConfig
  setTheme: (theme: ThemeName) => void
  isAutoDetect: boolean
  setAutoDetect: (auto: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeState = useTheme()
  
  const contextValue: ThemeContextType = {
    ...themeState,
    currentTheme: themeState.theme,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

// テーマコンテキストを使用するフック
export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext フックは ThemeProvider 内でのみ使用できます')
  }
  return context
}
