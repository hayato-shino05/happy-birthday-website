import { describe, it, expect } from 'vitest'
import { buildBirthdayEvents } from '@/components/features/BirthdayHub'
import type { Birthday } from '@/types'

const birthdayToday: Birthday = { id: 1, name: '今日さん', month: 6, day: 15 }
const birthdayFuture: Birthday = { id: 2, name: '明日さん', month: 6, day: 16 }
const birthdayPast: Birthday = { id: 3, name: '過去さん', month: 6, day: 10 }

describe('buildBirthdayEvents', () => {
  it('今日の誕生日は today ステータスで先頭に並ぶ', () => {
    const now = new Date(2026, 5, 15, 10, 0, 0)
    const events = buildBirthdayEvents([birthdayToday, birthdayFuture, birthdayPast], now)
    expect(events[0].person.id).toBe(birthdayToday.id)
    expect(events[0].status).toBe('today')
  })

  it('midnight を跨ぐと、今日が past に、未来が today に遷移する', () => {
    const beforeMidnight = new Date(2026, 5, 15, 23, 59, 0)
    const afterMidnight = new Date(2026, 5, 16, 0, 0, 1)

    const before = buildBirthdayEvents([birthdayToday, birthdayFuture], beforeMidnight)
    const after = buildBirthdayEvents([birthdayToday, birthdayFuture], afterMidnight)

    const beforeToday = before.find((e) => e.person.id === birthdayToday.id)!
    const afterToday = after.find((e) => e.person.id === birthdayToday.id)!
    const beforeFuture = before.find((e) => e.person.id === birthdayFuture.id)!
    const afterFuture = after.find((e) => e.person.id === birthdayFuture.id)!

    expect(beforeToday.status).toBe('today')
    expect(afterToday.status).toBe('past')
    expect(beforeFuture.status).toBe('upcoming')
    expect(afterFuture.status).toBe('today')
  })

  it('誕生日リストが空の場合は空配列を返す', () => {
    expect(buildBirthdayEvents([], new Date())).toEqual([])
  })
})
