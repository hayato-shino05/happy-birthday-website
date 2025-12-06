import type { Birthday, NextBirthday } from '@/types'

// 今日が誕生日かどうかをチェック
export function checkIfBirthday(date: Date, birthdays: Birthday[]): Birthday | null {
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  const month = checkDate.getMonth() + 1
  const day = checkDate.getDate()

  return (
    birthdays.find((person) => person.month === month && person.day === day) || null
  )
}

// 次の誕生日を計算
export function calculateNextBirthday(
  currentDate: Date,
  birthdays: Birthday[]
): NextBirthday | null {
  if (birthdays.length === 0) return null

  let nearestPerson: Birthday | null = null
  let nearestDate: Date | null = null
  let smallestDiff = Infinity

  for (const person of birthdays) {
    // 今年の誕生日を作成
    let birthday = new Date(currentDate.getFullYear(), person.month - 1, person.day)

    // 今年の誕生日が過ぎていたら来年の誕生日を計算
    if (currentDate > birthday) {
      birthday = new Date(currentDate.getFullYear() + 1, person.month - 1, person.day)
    }

    const diff = birthday.getTime() - currentDate.getTime()

    if (diff < smallestDiff && diff >= 0) {
      smallestDiff = diff
      nearestDate = birthday
      nearestPerson = person
    }
  }

  if (!nearestPerson || !nearestDate) return null

  const daysUntil = Math.floor(smallestDiff / (1000 * 60 * 60 * 24))

  return {
    person: nearestPerson,
    date: nearestDate,
    daysUntil,
  }
}

// 誕生日までの残り時間を計算
export function getTimeUntilBirthday(targetDate: Date) {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  }
}

// 誕生日メッセージのフォーマット
export function formatBirthdayMessage(person: Birthday, language: 'en' | 'ja' = 'en'): string {
  if (person.message) return person.message

  const messages = {
    en: `Happy Birthday ${person.name}! `,
    ja: `${person.name}さん、お誕生日おめでとうございます！`,
  }

  return messages[language]
}
