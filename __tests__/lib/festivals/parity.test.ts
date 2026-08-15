import { describe, expect, it } from 'vitest'
import type { FestivalPack } from '@/lib/festivals/types'
import { compareCatalogs, type ParityItem } from '@/lib/festivals/parity'

const pack = (overrides: Partial<FestivalPack> = {}): FestivalPack => ({
  id: 'shared',
  country: 'jp',
  locale: 'ja',
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
  pack({ id: 'locale-gap', locale: 'ja', name: 'Locale gap' }),
  pack({ id: 'locale-gap', locale: 'en', name: 'Locale gap' }),
  pack({ id: 'theme-diff', themeKey: 'production-theme' }),
  pack({ id: 'duplicate', name: 'Duplicate one' }),
  pack({ id: 'duplicate', name: 'Duplicate two', description: 'Different duplicate' }),
  pack({ id: 'country-jp', country: 'jp', name: 'Japan event' }),
]

const ids = (items: readonly ParityItem[]): string[] => items.map((item: ParityItem) => item.id)

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
  pack({ id: 'locale-gap', locale: 'ja', name: 'Locale gap' }),
  pack({ id: 'theme-diff', themeKey: 'open-source-theme' }),
  pack({ id: 'country-us', country: 'us', name: 'United States event' }),
]

describe('compareCatalogs', () => {
  it('returns all eight stable categories and does not infer duplicate ids from dates', () => {
    const report = compareCatalogs(production, openSource)

    expect(ids(report.shared)).toEqual(['shared'])
    expect(ids(report.productionOnly)).toEqual(['country-jp', 'duplicate', 'prod-only'])
    expect(ids(report.openSourceOnly)).toEqual(['country-us', 'open-only'])
    expect(ids(report.sameDateDifferentContent)).toEqual(['content-diff'])
    expect(ids(report.calendarRuleMismatch)).toEqual(['calendar-diff'])
    expect(ids(report.localeCoverageMismatch)).toEqual(['locale-gap'])
    expect(ids(report.themeReferenceMismatch)).toEqual(['theme-diff'])
    expect(ids(report.duplicateIds)).toEqual(['duplicate'])
    expect(ids(report.duplicateIds)).not.toContain('country-jp')
    expect(ids(report.duplicateIds)).not.toContain('country-us')
  })

  it('detects content swapped between locale variants', () => {
    const productionLocalized = [
      pack({ id: 'localized', locale: 'en', name: 'English name' }),
      pack({ id: 'localized', locale: 'ja', name: '日本語名' }),
    ]
    const openSourceLocalized = [
      pack({ id: 'localized', locale: 'en', name: '日本語名' }),
      pack({ id: 'localized', locale: 'ja', name: 'English name' }),
    ]

    const report = compareCatalogs(productionLocalized, openSourceLocalized)

    expect(report.sameDateDifferentContent).toEqual([{ id: 'localized' }])
    expect(report.shared).toEqual([])
  })

  it('accepts snapshots that wrap the catalog and metadata', () => {
    const report = compareCatalogs(
      { catalog: [pack({ id: 'wrapped' })], locales: ['ja'], themes: ['shared-theme'] },
      { packs: [pack({ id: 'wrapped' })], locales: ['ja'], themes: ['shared-theme'] },
    )

    expect(report.shared).toEqual([{ id: 'wrapped' }])
  })

  it('rejects malformed snapshot entries instead of dropping them', () => {
    expect(() => compareCatalogs(
      { events: [{ id: 'broken' }] },
      { events: [pack({ id: 'broken' })] },
    )).toThrow(/malformed festival pack/)
  })
})
