'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language } from '@/types'

interface LanguageState {
  currentLanguage: Language
  availableLanguages: Language[]
  
  // アクション
  setLanguage: (lang: Language) => void
  detectLanguage: () => Language
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      availableLanguages: ['en', 'ja'],

      setLanguage: (lang) => set({ currentLanguage: lang }),

      detectLanguage: () => {
        if (typeof window === 'undefined') return 'en'
        
        const browserLang = navigator.language.toLowerCase()
        
        if (browserLang.startsWith('ja')) return 'ja'
        if (browserLang.startsWith('en')) return 'en'
        
        return 'en'
      },
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
)
