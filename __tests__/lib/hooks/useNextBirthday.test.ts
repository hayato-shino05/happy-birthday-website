import { act, renderHook } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import type { Birthday } from '@/types'
import { useBirthdays } from '@/lib/hooks/useBirthdays'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'

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

  it('midnight を跨ぐと次の誕生日を再計算する', () => {
    vi.setSystemTime(new Date(2026, 5, 14, 23, 59, 59))
    const { result, unmount } = renderHook(() => useNextBirthday())

    expect(result.current.nextBirthday?.person.id).toBe(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1001)
    })

    expect(result.current.nextBirthday?.person.id).toBe(2)

    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
