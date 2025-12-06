'use client'

import { useBirthdayCheck } from '@/lib/hooks/useBirthdayCheck'
import { BirthdayHero } from './BirthdayHero'
import { CountdownDisplay } from './CountdownDisplay'

// 誕生日チェックコンポーネント
export function BirthdayChecker() {
  const { birthdayPerson, isBirthday } = useBirthdayCheck()

  if (isBirthday && birthdayPerson) {
    return <BirthdayHero person={birthdayPerson} />
  }

  return <CountdownDisplay />
}
