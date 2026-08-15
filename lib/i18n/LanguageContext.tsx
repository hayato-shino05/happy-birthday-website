'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { locales } from '@/data/generated/locales'
import { DEFAULT_LOCALE, normalizeLocale, resolveLocale, translate } from './resolveLocale'
import type { Language, Locale, TranslationKey } from './types'

interface LanguageContextType {
  language: Language
  locale: Locale
  setLanguage: (language: Language | Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 言語プロバイダー
export function LanguageProvider({ children }: { children: ReactNode }) {
  const initialLocale = resolveLocale(DEFAULT_LOCALE, locales, DEFAULT_LOCALE).locale
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const setLanguage = useCallback((requestedLanguage: Language | Locale) => {
    const requestedLocale = normalizeLocale(requestedLanguage)
    const resolved = resolveLocale(requestedLocale, locales, DEFAULT_LOCALE)
    setLocale(resolved.locale)
  }, [])

  const language: Language = locale.startsWith('ja') ? 'ja' : 'en'
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string =>
      translate(locale, key, DEFAULT_LOCALE, params),
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ language, locale, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 言語フックを使用
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage フックは LanguageProvider 内でのみ使用できます')
  }
  return context
}
