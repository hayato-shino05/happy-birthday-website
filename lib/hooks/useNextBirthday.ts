'use client'

import { useMemo } from 'react'
import { useBirthdays } from './useBirthdays'
import { calculateNextBirthday } from '@/lib/utils/birthday'

// 次の誕生日を取得するカスタムフック
export function useNextBirthday() {
  const { data: birthdays, isLoading, error } = useBirthdays()

  const nextBirthday = useMemo(() => {
    if (!birthdays || birthdays.length === 0) return null
    return calculateNextBirthday(new Date(), birthdays)
  }, [birthdays])

  return {
    nextBirthday,
    isLoading,
    error,
  }
}
