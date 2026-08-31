import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'ja',
    t: (key: string) => key,
  }),
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: () => null,
}))

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: { div: 'div' },
}))

describe('DailyOmikuji legacy migration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 29, 12))
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('persists a valid legacy result into history when today has no history entry', async () => {
    window.localStorage.setItem('omikuji_2026_08_29', JSON.stringify({ id: 2 }))

    const { default: DailyOmikuji } = await import('@/components/features/DailyOmikuji')
    render(<DailyOmikuji />)

    expect(JSON.parse(window.localStorage.getItem('omikuji_history_v1') || 'null')).toEqual([
      { date: '2026-08-29', fortuneId: 2 },
    ])
  })

  it('does not replace an existing history result or write another migration on refresh', async () => {
    const history = [{ date: '2026-08-29', fortuneId: 3 }]
    window.localStorage.setItem('omikuji_history_v1', JSON.stringify(history))
    window.localStorage.setItem('omikuji_2026_08_29', JSON.stringify({ id: 2 }))

    const { default: DailyOmikuji } = await import('@/components/features/DailyOmikuji')
    const first = render(<DailyOmikuji />)
    first.unmount()
    render(<DailyOmikuji />)

    expect(JSON.parse(window.localStorage.getItem('omikuji_history_v1') || 'null')).toEqual(history)
  })

  it('keeps a legacy result visible and retries a failed history migration', async () => {
    window.localStorage.setItem('omikuji_2026_08_29', JSON.stringify({ id: 2 }))
    const originalSetItem = Storage.prototype.setItem
    let shouldFail = true
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'omikuji_history_v1' && shouldFail) {
        shouldFail = false
        throw new Error('storage unavailable')
      }
      return originalSetItem.call(this, key, value)
    })

    const { default: DailyOmikuji } = await import('@/components/features/DailyOmikuji')
    render(<DailyOmikuji />)

    await act(async () => {})
    expect(screen.getByText('omikujiMigrationError')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'omikujiMigrationRetry' })).toBeInTheDocument()
    expect(screen.getByText('大吉')).toBeInTheDocument()
    expect(window.localStorage.getItem('omikuji_history_v1')).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'omikujiMigrationRetry' }))
    })

    expect(JSON.parse(window.localStorage.getItem('omikuji_history_v1') || 'null')).toEqual([
      { date: '2026-08-29', fortuneId: 2 },
    ])
    expect(screen.queryByText('omikujiMigrationError')).not.toBeInTheDocument()
  })
})
