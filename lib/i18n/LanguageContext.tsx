'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 言語プロバイダー
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja')

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || key
    },
    [language]
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
