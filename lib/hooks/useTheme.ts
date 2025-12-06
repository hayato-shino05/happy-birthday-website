'use client'

import { useState, useEffect, useCallback } from 'react'
import { detectSeasonAndFestival, getThemeConfig } from '@/lib/utils/theme'
import type { ThemeName } from '@/types'
import type { ThemeConfig } from '@/config/themes'

interface UseThemeReturn {
  theme: ThemeName
  themeConfig: ThemeConfig
  setTheme: (theme: ThemeName) => void
  isAutoDetect: boolean
  setAutoDetect: (auto: boolean) => void
}

// クライアント側でテーマを検出
function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return 'winter' // SSRのデフォルト（12月）
  }
  return detectSeasonAndFestival()
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeName>(getInitialTheme)
  const [isAutoDetect, setIsAutoDetect] = useState(true)

  // マウント後にテーマを検出
  useEffect(() => {
    if (isAutoDetect) {
      const detectedTheme = detectSeasonAndFestival()
      setThemeState(detectedTheme)
    }
  }, [isAutoDetect])

  // 手動でテーマを設定
  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme)
    setIsAutoDetect(false)
  }, [])

  // 自動検出モードを設定
  const setAutoDetect = useCallback((auto: boolean) => {
    setIsAutoDetect(auto)
    if (auto) {
      const detectedTheme = detectSeasonAndFestival()
      setThemeState(detectedTheme)
    }
  }, [])

  const themeConfig = getThemeConfig(theme)

  return {
    theme,
    themeConfig,
    setTheme,
    isAutoDetect,
    setAutoDetect,
  }
}
