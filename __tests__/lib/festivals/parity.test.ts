import { describe, expect, it } from 'vitest'
import type { FestivalPack } from '@/lib/festivals/types'
import { compareCatalogs } from '@/lib/festivals/parity'

const pack = (overrides: Partial<FestivalPack> = {}): FestivalPack => ({
  id: 'shared',
  country: 'jp',
  locale: 'ja-JP',
  category: 'festival',
  name: 'Shared',
  description: 'Same description',
  dateRule: {
    calendar: 'gregorian',
    recurrence: 'yearly',
    ranges: [{ month: 1, startDay: 1, endDay: 3 }],
    timeZone: 'Asia/Tokyo',
  },
  enabled: true,
  status: 'enabled',
  priority: 10,
  themeKey: 'shared-theme',
  ...overrides,
})

const production = [
  pack(),
  pack({ id: 'prod-only', name: 'Production only' }),
  pack({ id: 'content-diff', name: 'Production content' }),
  pack({ id: 'calendar-diff', name: 'Calendar production' }),
  pack({ id: 'locale-gap', locale: 'ja-JP', name: 'Locale gap' }),
  pack({ id: 'locale-gap', locale: 'en-US', name: 'Locale gap' }),
  pack({ id: 'theme-diff', themeKey: 'production-theme' }),
  pack({ id: 'duplicate', name: 'Duplicate one' }),
  pack({ id: 'duplicate', name: 'Duplicate two', description: 'Different duplicate' }),
  pack({ id: 'country-jp', country: 'jp', name: 'Japan event' }),
]

const openSource = [
  pack(),
  pack({ id: 'open-only', name: 'Open source only' }),
  pack({ id: 'content-diff', name: 'Open source content' }),
  pack({
    id: 'calendar-diff',
    name: 'Calendar open source',
    dateRule: {
      calendar: 'gregorian',
      recurrence: 'year-specific',
      dates: { '2026': [{ month: 1, day: 1 }] },
      timeZone: 'Asia/Tokyo',
    },
  }),
  pack({ id: 'locale-gap', locale: 'ja-JP', name: 'Locale gap' }),
  pack({ id: 'theme-diff', themeKey: 'open-source-theme' }),
  pack({ id: 'country-us', country: 'us', name: 'United States event' }),
]

describe('compareCatalogs', () => {
  it('returns all eight stable categories and does not infer duplicate ids from dates', () => {
    const report = compareCatalogs(production, openSource)

    expect(report.shared.map(({ id }) => id)).toEqual(['shared'])
    expect(report.productionOnly.map(({ id }) => id)).toEqual(['country-jp', 'duplicate', 'prod-only'])
    expect(report.openSourceOnly.map(({ id }) => id)).toEqual(['country-us', 'open-only'])
    expect(report.sameDateDifferentContent.map(({ id }) => id)).toEqual(['content-diff'])
    expect(report.calendarRuleMismatch.map(({ id }) => id)).toEqual(['calendar-diff'])
    expect(report.localeCoverageMismatch.map(({ id }) => id)).toEqual(['locale-gap'])
    expect(report.themeReferenceMismatch.map(({ id }) => id)).toEqual(['theme-diff'])
    expect(report.duplicateIds.map(({ id }) => id)).toEqual(['duplicate'])
    expect(report.duplicateIds.map(({ id }) => id)).not.toContain('country-jp')
    expect(report.duplicateIds.map(({ id }) => id)).not.toContain('country-us')
  })

  it('accepts snapshots that wrap the catalog and metadata', () => {
    const report = compareCatalogs(
      { catalog: [pack({ id: 'wrapped' })], locales: ['ja-JP'], themes: ['shared-theme'] },
      { packs: [pack({ id: 'wrapped' })], locales: ['ja-JP'], themes: ['shared-theme'] },
    )

    expect(report.shared).toEqual([{ id: 'wrapped' }])
  })
})
