import { act, renderHook } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import type { Birthday } from '@/types'
import { useBirthdays } from '@/lib/hooks/useBirthdays'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'
import * as birthdayUtils from '@/lib/utils/birthday'

vi.mock('@/lib/hooks/useBirthdays', () => ({
  useBirthdays: vi.fn(),
}))

const mockedUseBirthdays = vi.mocked(useBirthdays)
const birthdays: Birthday[] = [
  { id: 1, name: '今日さん', month: 6, day: 15 },
  { id: 2, name: '明日さん', month: 6, day: 16 },
]

describe('useNextBirthday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockedUseBirthdays.mockReturnValue({
      data: birthdays,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useBirthdays>)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('midnight を跨ぐと次の誕生日を再計算する', async () => {
    vi.setSystemTime(new Date(2026, 5, 14, 23, 59, 59))
    const { unmount } = renderHook(() => useNextBirthday())

    const calculateNextBirthdaySpy = vi.spyOn(birthdayUtils, 'calculateNextBirthday')

    await act(async () => {
      vi.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    const latestDate = calculateNextBirthdaySpy.mock.lastCall?.[0]
    expect(latestDate?.getDate()).toBe(15)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('system clock の変更後も次の誕生日を再計算する', async () => {
    vi.setSystemTime(new Date(2026, 5, 14, 12, 0, 0))
    const { unmount } = renderHook(() => useNextBirthday())
    const calculateNextBirthdaySpy = vi.spyOn(birthdayUtils, 'calculateNextBirthday')

    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0))
    await act(async () => {
      vi.advanceTimersByTime(60_000)
      await Promise.resolve()
    })

    const latestDate = calculateNextBirthdaySpy.mock.lastCall?.[0]
    expect(latestDate?.getDate()).toBe(15)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
