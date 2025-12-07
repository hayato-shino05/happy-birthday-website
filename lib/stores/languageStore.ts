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
      currentLanguage: 'ja',
      availableLanguages: ['ja', 'en'],

      setLanguage: (lang) => set({ currentLanguage: lang }),

      detectLanguage: () => {
        if (typeof window === 'undefined') return 'ja'
        
        const browserLang = navigator.language.toLowerCase()
        
        if (browserLang.startsWith('ja')) return 'ja'
        if (browserLang.startsWith('en')) return 'en'
        
        return 'ja'
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
