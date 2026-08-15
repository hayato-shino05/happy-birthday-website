import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  FestivalPackValidationError,
  validateDateRule,
  validateFestivalPack,
  validateFestivalPacks,
} from '@/lib/festivals/validation'
import type { FestivalPack, Locale } from '@/lib/festivals/types'

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(__dirname, 'fixtures', name), 'utf8'))

const validPack: FestivalPack = {
  id: 'jp-hanami',
  country: 'jp',
  locale: 'ja',
  category: 'festival',
  name: '花見',
  dateRule: {
    calendar: 'gregorian',
    recurrence: 'yearly',
    ranges: [{ month: 3, startDay: 20, endDay: 31 }],
    timeZone: 'Asia/Tokyo',
  },
  enabled: true,
  status: 'enabled',
  priority: 10,
}

describe('validateDateRule', () => {
  it('accepts a recurring Gregorian range', () => {
    expect(validateDateRule(validPack.dateRule)).toEqual(validPack.dateRule)
  })

  it.each([
    ['startDay after endDay', { ...validPack.dateRule, ranges: [{ month: 3, startDay: 31, endDay: 20 }] }],
    ['month outside range', { ...validPack.dateRule, ranges: [{ month: 13, startDay: 1, endDay: 2 }] }],
    ['day outside range', { ...validPack.dateRule, ranges: [{ month: 3, startDay: 0, endDay: 2 }] }],
    ['empty ranges', { ...validPack.dateRule, ranges: [] }],
    ['invalid timezone', { ...validPack.dateRule, timeZone: 'Mars/Olympus' }],
    ['invalid recurrence', { ...validPack.dateRule, recurrence: 'monthly' }],
  ])('rejects %s', (_, value) => {
    expect(() => validateDateRule(value)).toThrow(FestivalPackValidationError)
  })

  it('accepts an unsupported lunar rule without Gregorian fields', () => {
    const value = fixture('unsupported-calendar.json')
    expect(validateDateRule((value as FestivalPack).dateRule)).toMatchObject({
      calendar: 'lunar',
      status: 'unsupported-calendar',
    })
  })

  it('rejects unsupported-calendar status on a Gregorian pack', () => {
    expect(() => validateFestivalPack({ ...validPack, status: 'unsupported-calendar' })).toThrow(
      FestivalPackValidationError
    )
  })

  it('rejects a lunar rule that includes Gregorian month and day fields', () => {
    expect(() =>
      validateDateRule({
        calendar: 'lunar',
        recurrence: 'year-specific',
        dates: { '2026': [{ month: 8, day: 15 }] },
        timeZone: 'Asia/Tokyo',
        status: 'unsupported-calendar',
      })
    ).toThrow(FestivalPackValidationError)
  })
})

describe('validateFestivalPack', () => {
  it('returns a narrowed valid pack', () => {
    expect(validateFestivalPack(validPack)).toEqual(validPack)
  })

  it.each([
    ['missing id', { ...validPack, id: '' }],
    ['invalid locale', { ...validPack, locale: 'fr' as Locale }],
    ['invalid country', { ...validPack, country: 'Japan' }],
    ['invalid category', { ...validPack, category: 'holiday' }],
    ['invalid status', { ...validPack, status: 'unknown' }],
    ['invalid priority', { ...validPack, priority: -1 }],
  ])('rejects %s', (_, value) => {
    expect(() => validateFestivalPack(value)).toThrow(FestivalPackValidationError)
  })

  it('rejects malformed input', () => {
    expect(() => validateFestivalPack({})).toThrow(FestivalPackValidationError)
  })
})

describe('validateFestivalPacks', () => {
  it('rejects duplicate global ids', () => {
    const value = fixture('duplicate-id.json')
    expect(() => validateFestivalPacks(value)).toThrow(FestivalPackValidationError)
  })
})
