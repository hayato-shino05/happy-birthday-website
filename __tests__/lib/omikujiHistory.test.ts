import { describe, expect, it } from 'vitest'
import {
  appendOmikujiHistory,
  getOmikujiDateKey,
  getOmikujiStreak,
  OMIKUJI_HISTORY_CONTRACT,
  parseOmikujiHistory,
} from '@/lib/omikujiHistory'

const fortuneIds = new Set([1, 2, 3])

describe('omikuji history', () => {
  it('exposes the local-only history contract', () => {
    expect(OMIKUJI_HISTORY_CONTRACT).toEqual({
      storage: 'localStorage',
      storageKey: 'omikuji_history_v1',
      timezone: 'browser-local',
      drawsPerDay: 1,
      allowsRedraw: false,
      historyLimit: 7,
      invalidData: 'discard',
      identity: 'none',
      sync: 'none',
    })
  })

  it('uses the browser local day for the history key', () => {
    expect(getOmikujiDateKey(new Date(2026, 0, 1, 0, 1))).toBe('2026-01-01')
  })

  it('keeps one fortune per day and preserves it across refreshes', () => {
    const history = appendOmikujiHistory([{ date: '2026-01-01', fortuneId: 1 }], {
      date: '2026-01-01',
      fortuneId: 2,
    })

    expect(history).toEqual([{ date: '2026-01-01', fortuneId: 2 }])
    expect(parseOmikujiHistory(JSON.stringify(history), fortuneIds)).toEqual(history)
  })

  it('limits retained history to seven local days', () => {
    const history = Array.from({ length: 8 }, (_, index) => ({
      date: `2026-01-${String(index + 1).padStart(2, '0')}`,
      fortuneId: 1,
    }))

    expect(appendOmikujiHistory(history, { date: '2026-01-09', fortuneId: 2 })).toHaveLength(7)
  })

  it('recovers safely from malformed or invalid stored data', () => {
    expect(parseOmikujiHistory('{', fortuneIds)).toEqual([])
    expect(parseOmikujiHistory(JSON.stringify([{ date: '2026-02-30', fortuneId: 1 }]), fortuneIds)).toEqual([])
    expect(parseOmikujiHistory(JSON.stringify([{ date: '2026-01-01', fortuneId: 99 }]), fortuneIds)).toEqual([])
  })

  it('counts only consecutive local days through today', () => {
    expect(getOmikujiStreak([
      { date: '2026-01-03', fortuneId: 1 },
      { date: '2026-01-02', fortuneId: 2 },
      { date: '2025-12-31', fortuneId: 3 },
    ], new Date(2026, 0, 3, 12))).toBe(2)
  })
})
