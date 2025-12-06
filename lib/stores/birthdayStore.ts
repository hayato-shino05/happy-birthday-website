'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Birthday, NextBirthday } from '@/types'

interface BirthdayState {
  birthdays: Birthday[]
  nextBirthday: NextBirthday | null
  todayBirthdays: Birthday[]
  isBirthdayToday: boolean
  isLoading: boolean
  error: string | null
  
  // アクション
  setBirthdays: (birthdays: Birthday[]) => void
  setNextBirthday: (next: NextBirthday | null) => void
  setTodayBirthdays: (birthdays: Birthday[]) => void
  setIsBirthdayToday: (value: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 非同期アクション
  fetchBirthdays: () => Promise<void>
  checkBirthday: () => Promise<void>
  addBirthday: (birthday: Omit<Birthday, 'id' | 'created_at'>) => Promise<boolean>
  updateBirthday: (id: number, data: Partial<Birthday>) => Promise<boolean>
  deleteBirthday: (id: number) => Promise<boolean>
}

export const useBirthdayStore = create<BirthdayState>()(
  persist(
    (set, get) => ({
      birthdays: [],
      nextBirthday: null,
      todayBirthdays: [],
      isBirthdayToday: false,
      isLoading: false,
      error: null,

      setBirthdays: (birthdays) => set({ birthdays }),
      setNextBirthday: (next) => set({ nextBirthday: next }),
      setTodayBirthdays: (birthdays) => set({ todayBirthdays: birthdays }),
      setIsBirthdayToday: (value) => set({ isBirthdayToday: value }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      fetchBirthdays: async () => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/birthdays')
          const { data } = await res.json()
          set({ birthdays: data || [], isLoading: false })
        } catch {
          set({ error: '誕生日リストを読み込めません', isLoading: false })
        }
      },

      checkBirthday: async () => {
        try {
          const res = await fetch('/api/birthdays/next')
          const data = await res.json()
          set({
            nextBirthday: data.nextBirthday,
            todayBirthdays: data.todayBirthdays || [],
            isBirthdayToday: data.isBirthdayToday,
          })
        } catch {
          set({ error: '誕生日を確認できません' })
        }
      },

      addBirthday: async (birthday) => {
        try {
          const res = await fetch('/api/birthdays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(birthday),
          })
          if (!res.ok) return false
          const { data } = await res.json()
          set({ birthdays: [...get().birthdays, data] })
          return true
        } catch {
          return false
        }
      },

      updateBirthday: async (id, data) => {
        try {
          const res = await fetch(`/api/birthdays/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (!res.ok) return false
          const { data: updated } = await res.json()
          set({
            birthdays: get().birthdays.map((b) => (b.id === id ? updated : b)),
          })
          return true
        } catch {
          return false
        }
      },

      deleteBirthday: async (id) => {
        try {
          const res = await fetch(`/api/birthdays/${id}`, { method: 'DELETE' })
          if (!res.ok) return false
          set({ birthdays: get().birthdays.filter((b) => b.id !== id) })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'birthday-storage',
      partialize: (state) => ({
        isBirthdayToday: state.isBirthdayToday,
        todayBirthdays: state.todayBirthdays,
      }),
    }
  )
)
