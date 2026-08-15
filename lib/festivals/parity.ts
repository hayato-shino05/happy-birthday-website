import type { FestivalPack } from './types'

export interface ParityItem {
  id: string
}

export interface ParityReport {
  shared: ParityItem[]
  productionOnly: ParityItem[]
  openSourceOnly: ParityItem[]
  sameDateDifferentContent: ParityItem[]
  duplicateIds: ParityItem[]
  calendarRuleMismatch: ParityItem[]
  localeCoverageMismatch: ParityItem[]
  themeReferenceMismatch: ParityItem[]
}

export interface CatalogSnapshotObject {
  catalog?: unknown
  packs?: unknown
  festivals?: unknown
  events?: unknown
  locales?: unknown
  themes?: unknown
}

export type CatalogSnapshot = readonly FestivalPack[] | CatalogSnapshotObject

const REPORT_KEYS: (keyof ParityReport)[] = [
  'shared',
  'productionOnly',
  'openSourceOnly',
  'sameDateDifferentContent',
  'duplicateIds',
  'calendarRuleMismatch',
  'localeCoverageMismatch',
  'themeReferenceMismatch',
]

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function isFestivalPack(value: unknown): value is FestivalPack {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  const dateRule = record.dateRule
  return typeof record.id === 'string' &&
    typeof record.country === 'string' &&
    typeof record.locale === 'string' &&
    typeof record.category === 'string' &&
    typeof record.name === 'string' &&
    typeof record.enabled === 'boolean' &&
    typeof record.status === 'string' &&
    typeof record.priority === 'number' &&
    typeof dateRule === 'object' && dateRule !== null && !Array.isArray(dateRule) &&
    typeof (dateRule as Record<string, unknown>).calendar === 'string' &&
    typeof (dateRule as Record<string, unknown>).recurrence === 'string'
}

function readPacks(snapshot: CatalogSnapshot): FestivalPack[] {
  if (!snapshot || typeof snapshot !== 'object') throw new TypeError('catalog snapshot must be an object or array')
  const values = Array.isArray(snapshot)
    ? snapshot
    : (['catalog', 'packs', 'festivals', 'events'] as const)
      .map((key) => (snapshot as CatalogSnapshotObject)[key])
      .find(Array.isArray)
  if (!values) return []
  const packs: FestivalPack[] = []
  for (const [index, value] of values.entries()) {
    if (!isFestivalPack(value)) throw new TypeError(`catalog snapshot contains malformed festival pack at index ${index}`)
    packs.push(value)
  }
  return packs
}

function groupById(packs: readonly FestivalPack[]): Map<string, FestivalPack[]> {
  const groups = new Map<string, FestivalPack[]>()
  for (const pack of packs) groups.set(pack.id, [...(groups.get(pack.id) ?? []), pack])
  return groups
}

function eventIdentity(pack: FestivalPack): string {
  return stableJson({
    country: pack.country,
    region: pack.region,
    category: pack.category,
    dateRule: pack.dateRule,
  })
}

function localeSet(packs: readonly FestivalPack[]): string {
  return [...new Set(packs.map(({ locale }) => locale))].sort().join('\u0000')
}

function themeSet(packs: readonly FestivalPack[]): string {
  return packs
    .map(({ locale, themeKey }) => stableJson({ locale, themeKey: themeKey ?? null }))
    .sort()
    .join('\u0000')
}

function ruleSet(packs: readonly FestivalPack[]): string {
  return packs
    .map(({ locale, dateRule }) => stableJson({ locale, dateRule }))
    .sort()
    .join('\u0000')
}

function contentSet(packs: readonly FestivalPack[]): string {
  return packs
    .map((pack) => stableJson({
      locale: pack.locale,
      country: pack.country,
      region: pack.region,
      category: pack.category,
      name: pack.name,
      description: pack.description,
      enabled: pack.enabled,
      status: pack.status,
      priority: pack.priority,
    }))
    .sort()
    .join('\u0000')
}

function hasDuplicateId(packs: readonly FestivalPack[]): boolean {
  if (packs.length < 2) return false
  const locales = new Set<string>()
  const identities = new Set<string>()
  for (const pack of packs) {
    if (locales.has(pack.locale)) return true
    locales.add(pack.locale)
    identities.add(eventIdentity(pack))
  }
  return identities.size > 1
}

function sorted(items: ParityItem[]): ParityItem[] {
  return items.sort((left, right) => left.id.localeCompare(right.id))
}

export function compareCatalogs(productionSnapshot: CatalogSnapshot, openSourceSnapshot: CatalogSnapshot): ParityReport {
  const production = readPacks(productionSnapshot)
  const openSource = readPacks(openSourceSnapshot)
  const productionById = groupById(production)
  const openSourceById = groupById(openSource)
  const ids = [...new Set([...productionById.keys(), ...openSourceById.keys()])].sort((left, right) => left.localeCompare(right))
  const report: ParityReport = {
    shared: [],
    productionOnly: [],
    openSourceOnly: [],
    sameDateDifferentContent: [],
    duplicateIds: [],
    calendarRuleMismatch: [],
    localeCoverageMismatch: [],
    themeReferenceMismatch: [],
  }

  for (const id of ids) {
    const productionEntries = productionById.get(id) ?? []
    const openSourceEntries = openSourceById.get(id) ?? []
    const hasDuplicate = hasDuplicateId(productionEntries) || hasDuplicateId(openSourceEntries)
    if (hasDuplicate) report.duplicateIds.push({ id })
    if (productionEntries.length === 0) {
      report.openSourceOnly.push({ id })
      continue
    }
    if (openSourceEntries.length === 0) {
      report.productionOnly.push({ id })
      continue
    }
    if (hasDuplicate) continue
    if (localeSet(productionEntries) !== localeSet(openSourceEntries)) {
      report.localeCoverageMismatch.push({ id })
    } else if (ruleSet(productionEntries) !== ruleSet(openSourceEntries)) {
      report.calendarRuleMismatch.push({ id })
    } else if (themeSet(productionEntries) !== themeSet(openSourceEntries)) {
      report.themeReferenceMismatch.push({ id })
    } else if (contentSet(productionEntries) !== contentSet(openSourceEntries)) {
      report.sameDateDifferentContent.push({ id })
    } else {
      report.shared.push({ id })
    }
  }

  for (const key of REPORT_KEYS) report[key] = sorted(report[key])
  return report
}
