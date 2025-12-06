'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeName } from '@/types'

interface ThemeState {
  currentTheme: ThemeName
  isAutoTheme: boolean
  prefersDark: boolean
  
  // アクション
  setTheme: (theme: ThemeName) => void
  setAutoTheme: (auto: boolean) => void
  setPrefersDark: (dark: boolean) => void
  detectTheme: () => ThemeName
  toggleAutoTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'spring',
      isAutoTheme: true,
      prefersDark: false,

      setTheme: (theme) => set({ currentTheme: theme, isAutoTheme: false }),
      setAutoTheme: (auto) => set({ isAutoTheme: auto }),
      setPrefersDark: (dark) => set({ prefersDark: dark }),

      detectTheme: () => {
        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()

        // 日本の祭り
        if (month === 3 && day >= 20 || month === 4 && day <= 10) return 'hanami'
        if (month === 8 && day >= 13 && day <= 16) return 'obon'
        if (month === 9 && day >= 15 && day <= 25) return 'tsukimi'
        if (month === 7 && day === 7) return 'tanabata'
        if (month === 1 && day >= 1 && day <= 7) return 'shogatsu'
        if (month === 5 && day === 5) return 'kodomo'
        if (month === 11 && day === 3) return 'bunka'

        // 西洋の祭り
        if (month === 12 && day >= 20 && day <= 26) return 'christmas'
        if (month === 10 && day >= 25 && day <= 31) return 'halloween'

        // 季節
        if (month >= 3 && month <= 5) return 'spring'
        if (month >= 6 && month <= 8) return 'summer'
        if (month >= 9 && month <= 11) return 'autumn'
        return 'winter'
      },

      toggleAutoTheme: () => {
        const { isAutoTheme, detectTheme } = get()
        if (!isAutoTheme) {
          const detectedTheme = detectTheme()
          set({ isAutoTheme: true, currentTheme: detectedTheme })
        } else {
          set({ isAutoTheme: false })
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        isAutoTheme: state.isAutoTheme,
        prefersDark: state.prefersDark,
      }),
    }
  )
)
