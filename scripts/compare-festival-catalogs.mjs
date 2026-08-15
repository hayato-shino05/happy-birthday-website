import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const REPORT_KEYS = [
  'shared',
  'productionOnly',
  'openSourceOnly',
  'sameDateDifferentContent',
  'duplicateIds',
  'calendarRuleMismatch',
  'localeCoverageMismatch',
  'themeReferenceMismatch',
]

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function isFestivalPack(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && typeof value.id === 'string'
}

function readPacks(snapshot) {
  if (Array.isArray(snapshot)) return snapshot.filter(isFestivalPack)
  if (!snapshot || typeof snapshot !== 'object') throw new TypeError('catalog snapshot must be an object or array')
  for (const key of ['catalog', 'packs', 'festivals', 'events']) {
    if (Array.isArray(snapshot[key])) return snapshot[key].filter(isFestivalPack)
  }
  return []
}

function metadataSet(snapshot, key) {
  if (!snapshot || Array.isArray(snapshot) || typeof snapshot !== 'object') return null
  const value = snapshot[key]
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null
  return [...new Set(value)].sort().join('\\u0000')
}

function groupById(packs) {
  const groups = new Map()
  for (const pack of packs) groups.set(pack.id, [...(groups.get(pack.id) ?? []), pack])
  return groups
}

function eventIdentity(pack) {
  return stableJson({ country: pack.country, region: pack.region, category: pack.category, dateRule: pack.dateRule })
}

function localeSet(packs) {
  return [...new Set(packs.map(({ locale }) => locale))].sort().join('\u0000')
}

function themeSet(packs) {
  return packs
    .map(({ locale, themeKey }) => stableJson({ locale, themeKey: themeKey ?? null }))
    .sort()
    .join('\u0000')
}

function ruleSet(packs) {
  return packs
    .map(({ locale, dateRule }) => stableJson({ locale, dateRule }))
    .sort()
    .join('\u0000')
}

function calendarRuleSet(packs) {
  return packs
    .map(({ locale, dateRule }) => `${locale}:${dateRule.calendar}:${dateRule.recurrence}`)
    .sort()
    .join('\u0000')
}

function contentSet(packs) {
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

function hasDuplicateId(packs) {
  if (packs.length < 2) return false
  const locales = new Set()
  const identities = new Set()
  for (const pack of packs) {
    if (locales.has(pack.locale)) return true
    locales.add(pack.locale)
    identities.add(eventIdentity(pack))
  }
  return identities.size > 1
}

function sorted(items) {
  return items.sort((left, right) => left.id.localeCompare(right.id))
}

export function compareCatalogs(productionSnapshot, openSourceSnapshot) {
  const productionById = groupById(readPacks(productionSnapshot))
  const openSourceById = groupById(readPacks(openSourceSnapshot))
  const localeMetadataMismatch = metadataSet(productionSnapshot, 'locales') !== null &&
    metadataSet(openSourceSnapshot, 'locales') !== null &&
    metadataSet(productionSnapshot, 'locales') !== metadataSet(openSourceSnapshot, 'locales')
  const themeMetadataMismatch = metadataSet(productionSnapshot, 'themes') !== null &&
    metadataSet(openSourceSnapshot, 'themes') !== null &&
    metadataSet(productionSnapshot, 'themes') !== metadataSet(openSourceSnapshot, 'themes')
  const ids = [...new Set([...productionById.keys(), ...openSourceById.keys()])].sort((left, right) => left.localeCompare(right))
  const report = Object.fromEntries(REPORT_KEYS.map((key) => [key, []]))

  for (const id of ids) {
    const productionEntries = productionById.get(id) ?? []
    const openSourceEntries = openSourceById.get(id) ?? []
    if (hasDuplicateId(productionEntries) || hasDuplicateId(openSourceEntries)) report.duplicateIds.push({ id })
    if (productionEntries.length === 0) {
      report.openSourceOnly.push({ id })
      continue
    }
    if (openSourceEntries.length === 0) {
      report.productionOnly.push({ id })
      continue
    }
    if (localeSet(productionEntries) !== localeSet(openSourceEntries) || localeMetadataMismatch) report.localeCoverageMismatch.push({ id })
    else if (ruleSet(productionEntries) !== ruleSet(openSourceEntries) || calendarRuleSet(productionEntries) !== calendarRuleSet(openSourceEntries)) report.calendarRuleMismatch.push({ id })
    else if (themeSet(productionEntries) !== themeSet(openSourceEntries) || themeMetadataMismatch) report.themeReferenceMismatch.push({ id })
    else if (contentSet(productionEntries) !== contentSet(openSourceEntries)) report.sameDateDifferentContent.push({ id })
    else report.shared.push({ id })
  }

  for (const key of REPORT_KEYS) report[key] = sorted(report[key])
  return report
}

function parseArguments(args) {
  const options = {}
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (!argument.startsWith('--')) continue
    options[argument.slice(2)] = args[index + 1]
    index += 1
  }
  return options
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  const required = ['production', 'opensource', 'output']
  const missing = required.filter((key) => !options[key])
  if (missing.length > 0) throw new Error(`必須引数がありません: ${missing.map((key) => `--${key}`).join(', ')}`)
  const production = JSON.parse(readFileSync(resolve(options.production), 'utf8'))
  const openSource = JSON.parse(readFileSync(resolve(options.opensource), 'utf8'))
  const report = compareCatalogs(production, openSource)
  const output = resolve(options.output)
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/compare-festival-catalogs.mjs')) main()
