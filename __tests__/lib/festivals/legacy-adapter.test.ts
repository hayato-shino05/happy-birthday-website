import { describe, expect, it } from 'vitest'
import { isFestivalActive } from '@/lib/utils/theme'
import { getLegacyFestivalDates, getLegacySeasonMonths } from '@/lib/festivals/legacyAdapter'

describe('legacy festival adapter', () => {
  it('returns legacy date ranges from Gregorian festival packs', () => {
    const dates = getLegacyFestivalDates()

    expect(dates.christmas).toEqual({ month: 12, startDate: 20, endDate: 25 })
    expect(dates.hanami).toEqual([
      { month: 3, startDate: 20, endDate: 31 },
      { month: 4, startDate: 1, endDate: 30 },
      { month: 5, startDate: 1, endDate: 10 },
    ])
  })

  it('does not convert unsupported lunar dates into Gregorian legacy dates', () => {
    expect(getLegacyFestivalDates()).not.toHaveProperty('tsukimi')
  })

  it('keeps the legacy season month mapping available outside visual themes', () => {
    expect(getLegacySeasonMonths()).toEqual({
      winter: [12, 1],
      spring: [2, 3, 4],
      summer: [5, 6, 7, 8],
      autumn: [9, 10, 11],
    })
  })

  it('rejects impossible Gregorian dates before timezone evaluation', () => {
    expect(isFestivalActive('christmas', 12, 32)).toBe(false)
    expect(isFestivalActive('kodomo', 4, 31)).toBe(false)
    expect(isFestivalActive('hanami', 2, 30)).toBe(false)
  })
})
