import { describe, expect, it } from 'vitest'
import { evaluateFestivalPacks } from '@/lib/festivals/evaluator'
import type { FestivalPack } from '@/lib/festivals/types'

function pack(overrides: Partial<FestivalPack> = {}): FestivalPack {
  return {
    id: 'event',
    country: 'jp',
    locale: 'ja-JP',
    category: 'festival',
    name: 'Event',
    dateRule: {
      calendar: 'gregorian',
      recurrence: 'yearly',
      ranges: [{ month: 12, startDay: 31, endDay: 31 }],
      timeZone: 'Asia/Tokyo',
    },
    enabled: true,
    status: 'enabled',
    priority: 0,
    ...overrides,
  }
}

describe('evaluateFestivalPacks', () => {
  it('evaluates recurring Gregorian ranges using the pack timezone', () => {
    const packs = [
      pack({ id: 'active', priority: 10 }),
      pack({ id: 'inactive', dateRule: { calendar: 'gregorian', recurrence: 'yearly', ranges: [{ month: 1, startDay: 1, endDay: 1 }], timeZone: 'Asia/Tokyo' } }),
    ]

    const result = evaluateFestivalPacks(packs, new Date('2024-12-31T14:30:00.000Z'))

    expect(result.find(({ pack: item }) => item.id === 'active')?.status).toBe('active')
    expect(result.find(({ pack: item }) => item.id === 'inactive')?.status).toBe('inactive')
  })

  it('keeps a year-spanning range active across the year boundary', () => {
    const newYear = pack({
      id: 'new-year',
      dateRule: {
        calendar: 'gregorian',
        recurrence: 'yearly',
        ranges: [
          { month: 12, startDay: 20, endDay: 31 },
          { month: 1, startDay: 1, endDay: 7 },
        ],
        timeZone: 'Asia/Tokyo',
      },
    })

    expect(evaluateFestivalPacks([newYear], new Date('2025-01-01T00:30:00.000Z'))[0].status).toBe('active')
  })

  it('orders active packs by priority and then id', () => {
    const result = evaluateFestivalPacks([
      pack({ id: 'zeta', priority: 20 }),
      pack({ id: 'alpha', priority: 20 }),
      pack({ id: 'highest', priority: 30 }),
    ], new Date('2024-12-31T14:30:00.000Z'))

    expect(result.map(({ pack: item }) => item.id)).toEqual(['highest', 'alpha', 'zeta'])
  })

  it('marks unsupported calendars and year-specific rules explicitly', () => {
    const unsupportedLunar = pack({
      id: 'lunar',
      status: 'unsupported-calendar',
      dateRule: {
        calendar: 'lunar',
        recurrence: 'year-specific',
        payload: { source: 'test' },
        timeZone: 'Asia/Tokyo',
        status: 'unsupported-calendar',
      },
    })
    const unsupportedYearSpecific = pack({
      id: 'year-specific',
      dateRule: {
        calendar: 'gregorian',
        recurrence: 'year-specific',
        dates: { '2024': [{ month: 12, day: 31 }] },
        timeZone: 'Asia/Tokyo',
      },
    })

    const result = evaluateFestivalPacks([unsupportedLunar, unsupportedYearSpecific], new Date('2024-12-31T14:30:00.000Z'))

    expect(result.map(({ status }) => status)).toEqual(['unsupported-calendar', 'unsupported-calendar'])
  })

  it('rejects a malformed lunar yearly rule as unsupported', () => {
    const malformedLunarYearly = pack({
      id: 'lunar-yearly',
      dateRule: {
        calendar: 'lunar',
        recurrence: 'yearly',
        ranges: [{ month: 12, startDay: 31, endDay: 31 }],
        timeZone: 'Asia/Tokyo',
      } as unknown as FestivalPack['dateRule'],
    })

    expect(evaluateFestivalPacks([malformedLunarYearly], new Date('2024-12-31T14:30:00.000Z'))[0].status).toBe('unsupported-calendar')
  })

  it('uses code-unit order for equal-priority IDs', () => {
    const result = evaluateFestivalPacks([
      pack({ id: 'ä', priority: 20 }),
      pack({ id: 'z', priority: 20 }),
    ], new Date('2024-12-31T14:30:00.000Z'))

    expect(result.map(({ pack: item }) => item.id)).toEqual(['z', 'ä'])
  })
})
