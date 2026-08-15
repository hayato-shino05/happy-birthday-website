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
  'runtimeContractMismatch',
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
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const dateRule = value.dateRule
  return typeof value.id === 'string' &&
    typeof value.country === 'string' &&
    typeof value.locale === 'string' &&
    typeof value.category === 'string' &&
    typeof value.name === 'string' &&
    typeof value.enabled === 'boolean' &&
    typeof value.status === 'string' &&
    typeof value.priority === 'number' &&
    dateRule && typeof dateRule === 'object' && !Array.isArray(dateRule) &&
    typeof dateRule.calendar === 'string' &&
    typeof dateRule.recurrence === 'string'
}

function readPacks(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') throw new TypeError('catalog snapshot must be an object or array')
  const values = Array.isArray(snapshot)
    ? snapshot
    : ['catalog', 'packs', 'festivals', 'events']
      .map((key) => snapshot[key])
      .find(Array.isArray)
  if (!values) return []
  return values.map((value, index) => {
    if (!isFestivalPack(value)) throw new TypeError(`catalog snapshot contains malformed festival pack at index ${index}`)
    return value
  })
}

function groupById(packs) {
  const groups = new Map()
  for (const pack of packs) groups.set(pack.id, [...(groups.get(pack.id) ?? []), pack])
  return groups
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

function identitySet(packs) {
  return packs
    .map(({ locale, country, region, category }) => stableJson({ locale, country, region, category }))
    .sort()
    .join('\u0000')
}

function runtimeContractSet(packs) {
  return packs
    .map(({ locale, enabled, status, priority }) => stableJson({ locale, enabled, status, priority }))
    .sort()
    .join('\u0000')
}

function hasRuntimeContractMismatch(packs) {
  if (packs.length < 2) return false
  const runtimeContracts = new Set(
    packs.map(({ enabled, status, priority }) => stableJson({ enabled, status, priority })),
  )
  return runtimeContracts.size > 1
}

function contentSet(packs) {
  return packs
    .map(({ locale, name, description }) => stableJson({ locale, name, description }))
    .sort()
    .join('\u0000')
}

function eventIdentity(pack) {
  return stableJson({ country: pack.country, region: pack.region, category: pack.category, dateRule: pack.dateRule })
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
  const production = readPacks(productionSnapshot)
  const openSource = readPacks(openSourceSnapshot)
  const productionById = groupById(production)
  const openSourceById = groupById(openSource)
  const ids = [...new Set([...productionById.keys(), ...openSourceById.keys()])].sort((left, right) => left.localeCompare(right))
  const report = Object.fromEntries(REPORT_KEYS.map((key) => [key, []]))

  for (const id of ids) {
    const productionEntries = productionById.get(id) ?? []
    const openSourceEntries = openSourceById.get(id) ?? []
    const hasDuplicate = hasDuplicateId(productionEntries) || hasDuplicateId(openSourceEntries)
    const hasRuntimeMismatch = hasRuntimeContractMismatch(productionEntries) || hasRuntimeContractMismatch(openSourceEntries)
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
    } else if (hasRuntimeMismatch || runtimeContractSet(productionEntries) !== runtimeContractSet(openSourceEntries)) {
      report.runtimeContractMismatch.push({ id })
    } else if (identitySet(productionEntries) !== identitySet(openSourceEntries)) {
      report.sameDateDifferentContent.push({ id })
    } else if (contentSet(productionEntries) !== contentSet(openSourceEntries)) {
      report.sameDateDifferentContent.push({ id })
    } else {
      report.shared.push({ id })
    }
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
