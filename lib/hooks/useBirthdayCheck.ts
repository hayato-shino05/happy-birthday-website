'use client'

import { useEffect, useState } from 'react'
import { useBirthdays } from './useBirthdays'
import { checkIfBirthday } from '@/lib/utils/birthday'
import type { Birthday } from '@/types'

// 今日が誕生日かどうかをチェックするカスタムフック
export function useBirthdayCheck() {
  const { data: birthdays } = useBirthdays()
  const [birthdayPerson, setBirthdayPerson] = useState<Birthday | null>(null)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    if (!birthdays || birthdays.length === 0) return

    const checkToday = () => {
      const now = new Date()
      const person = checkIfBirthday(now, birthdays)
      setBirthdayPerson(person)
      setLastCheck(now)
    }

    // 初回チェック
    checkToday()

    // 毎日0時にチェック
    const checkMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const timeUntilMidnight = tomorrow.getTime() - now.getTime()

      return setTimeout(() => {
        checkToday()
        // 次の日の0時にも再度チェック
        setInterval(checkToday, 24 * 60 * 60 * 1000)
      }, timeUntilMidnight)
    }

    const timeoutId = checkMidnight()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [birthdays])

  return {
    birthdayPerson,
    isBirthday: birthdayPerson !== null,
    lastCheck,
  }
}
