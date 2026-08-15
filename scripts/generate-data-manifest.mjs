import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const LOCALE_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})+$/
const COUNTRY_PATTERN = /^[a-z]{2,3}$/

function fail(message) {
  throw new Error(message)
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    fail(`JSONを読み込めません: ${path}: ${error.message}`)
  }
}

async function listJsonFiles(root) {
  try {
    const entries = await readdir(root, { withFileTypes: true })

    const files = []
    for (const entry of entries) {
      const path = join(root, entry.name)
      if (entry.isDirectory()) files.push(...await listJsonFiles(path))
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(path)
    }
    return files.sort()
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
}

function assertRequired(record, required, path) {
  for (const key of required) {
    if (!(key in record)) fail(`${path} に ${key} がありません`)
  }
}

function assertTimeZone(timeZone, path) {
  if (typeof timeZone !== 'string' || timeZone.length === 0) fail(`${path} は必須です`)
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format()
  } catch {
    fail(`${path} は IANA timezone である必要があります`)
  }
}

function validateDateRule(rule, path) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) fail(`${path} は object である必要があります`)
  assertTimeZone(rule.timeZone, `${path}.timeZone`)

  if (rule.calendar === 'gregorian' && rule.recurrence === 'yearly') {
    if (!Array.isArray(rule.ranges) || rule.ranges.length === 0) fail(`${path}.ranges は空にできません`)
    for (const [index, range] of rule.ranges.entries()) {
      if (!range || typeof range !== 'object') fail(`${path}.ranges[${index}] が不正です`)
      const { month, startDay, endDay } = range
      if (![month, startDay, endDay].every(Number.isInteger) || month < 1 || month > 12 || startDay < 1 || startDay > 31 || endDay < 1 || endDay > 31 || startDay > endDay) {
        fail(`${path}.ranges[${index}] が不正です`)
      }
    }
    return
  }

  if (rule.calendar === 'gregorian' && rule.recurrence === 'year-specific') {
    if (!rule.dates || typeof rule.dates !== 'object' || Array.isArray(rule.dates)) fail(`${path}.dates が不正です`)
    return
  }

  if (rule.calendar === 'lunar' && rule.recurrence === 'year-specific' && rule.status === 'unsupported-calendar' && 'payload' in rule) return
  fail(`${path} の calendar と recurrence の組み合わせが不正です`)
}

function validatePack(pack, path) {
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) fail(`${path} が不正です`)
  assertRequired(pack, ['id', 'country', 'locale', 'category', 'name', 'dateRule', 'enabled', 'status', 'priority'], path)
  if (typeof pack.id !== 'string' || pack.id.length === 0) fail(`${path}.id が不正です`)
  if (typeof pack.country !== 'string' || !COUNTRY_PATTERN.test(pack.country)) fail(`${path}.country が不正です`)
  if (typeof pack.locale !== 'string' || !LOCALE_PATTERN.test(pack.locale)) fail(`${path}.locale が不正です`)
  if (!['festival', 'public-holiday', 'season'].includes(pack.category)) fail(`${path}.category が不正です`)
  if (typeof pack.name !== 'string' || pack.name.length === 0) fail(`${path}.name が不正です`)
  if (typeof pack.enabled !== 'boolean') fail(`${path}.enabled が不正です`)
  if (!['enabled', 'disabled', 'unsupported-calendar'].includes(pack.status)) fail(`${path}.status が不正です`)
  if (!Number.isInteger(pack.priority) || pack.priority < 0) fail(`${path}.priority が不正です`)
  validateDateRule(pack.dateRule, `${path}.dateRule`)
  if (pack.status === 'unsupported-calendar' && pack.dateRule.calendar !== 'lunar') fail(`${path}.status は lunar rule にのみ指定できます`)
  if (pack.dateRule.calendar === 'lunar' && pack.status !== 'unsupported-calendar') fail(`${path}.lunar rule には unsupported-calendar が必要です`)
}

async function readSchema(root, name) {
  const schemaPath = join(root, 'data', 'schemas', name)
  return readJson(schemaPath)
}

function validateSchemaDefinition(schema, name, required) {
  if (!schema || schema.type !== 'object' || !Array.isArray(schema.required)) {
    fail(`${name} は object schema と required 配列を定義する必要があります`)
  }
  for (const key of required) {
    if (!schema.required.includes(key)) fail(`${name}.required に ${key} がありません`)
  }
}

async function collectFestivalPacks(root) {
  const files = await listJsonFiles(join(root, 'data', 'festivals'))
  const packs = []
  for (const file of files) {
    const value = await readJson(file)
    if (!Array.isArray(value)) fail(`${file} は pack の配列である必要があります`)
    for (const [index, pack] of value.entries()) {
      validatePack(pack, `${relative(root, file)}[${index}]`)
      packs.push(pack)
    }
  }
  const byId = new Map()
  for (const pack of packs) {
    const existing = byId.get(pack.id)
    if (!existing) {
      byId.set(pack.id, pack)
      continue
    }
    const sameIdentity = existing.country === pack.country && existing.region === pack.region && existing.category === pack.category && JSON.stringify(existing.dateRule) === JSON.stringify(pack.dateRule)
    if (!sameIdentity || existing.locale === pack.locale) fail(`festival pack の ID が重複しています: ${pack.id}`)
  }
  return packs.sort((left, right) => left.id.localeCompare(right.id) || left.locale.localeCompare(right.locale))
}

async function collectLocales(root) {
  const files = await listJsonFiles(join(root, 'data', 'i18n'))
  const locales = []
  const seen = new Set()
  for (const file of files) {
    const value = await readJson(file)
    const path = relative(root, file)
    assertRequired(value, ['locale', 'translations'], path)
    if (typeof value.locale !== 'string' || !LOCALE_PATTERN.test(value.locale)) fail(`${path}.locale が不正です`)
    if (seen.has(value.locale)) fail(`locale が重複しています: ${value.locale}`)
    seen.add(value.locale)
    if (!value.translations || typeof value.translations !== 'object' || Array.isArray(value.translations)) fail(`${path}.translations が不正です`)
    locales.push(value)
  }
  return locales.sort((left, right) => left.locale.localeCompare(right.locale))
}

async function readVisualThemeKeys(root) {
  const source = await readFile(join(root, 'config', 'visualThemes.ts'), 'utf8')
  const match = source.match(/VISUAL_THEME_KEYS\s*=\s*\[([\s\S]*?)\]\s*as const/)
  if (!match) fail('VISUAL_THEME_KEYS を config/visualThemes.ts から読み込めません')
  return [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((entry) => entry[1]).sort()
}

function validateThemeKeys(packs, themeKeys) {
  const available = new Set(themeKeys)
  for (const pack of packs) {
    if (pack.themeKey && !available.has(pack.themeKey)) fail(`themeKey が登録されていません: ${pack.themeKey}`)
  }
}

function generatedContents(packs, locales, themeKeys) {
  return new Map([
    [
      'data/generated/festival-packs.ts',
      `import type { FestivalPack } from '@/lib/festivals/types'\n\nexport const festivalPacks = ${JSON.stringify(packs, null, 2)} as const satisfies readonly FestivalPack[]\n`,
    ],
    [
      'data/generated/locales.ts',
      `import type { Locale } from '@/lib/festivals/types'\n\nexport type GeneratedLocalePack = {\n  readonly locale: Locale\n  readonly translations: Readonly<Record<string, string>>\n}\n\nexport const localePacks = ${JSON.stringify(locales, null, 2)} as const satisfies readonly GeneratedLocalePack[]\n\nexport const locales = ${JSON.stringify(locales.map(({ locale }) => locale), null, 2)} as const satisfies readonly Locale[]\n`,
    ],
    [
      'data/generated/themes.ts',
      `export const themes = ${JSON.stringify(themeKeys, null, 2)} as const satisfies readonly string[]\n`,
    ],
  ])
}

async function writeAtomically(root, contents) {
  const entries = [...contents.entries()].map(([relativePath, content]) => {
    const target = join(root, relativePath)
    return { target, temporary: `${target}.${process.pid}.tmp`, backup: `${target}.${process.pid}.bak`, content }
  })
  for (const entry of entries) {
    await mkdir(dirname(entry.target), { recursive: true })
    await writeFile(entry.temporary, entry.content)
  }
  try {
    for (const entry of entries) {
      if (existsSync(entry.target)) {
        await rename(entry.target, entry.backup)
      }
    }
    for (const entry of entries) await rename(entry.temporary, entry.target)
    for (const entry of entries) await rm(entry.backup, { force: true })
  } catch (error) {
    for (const entry of entries) {
      if (existsSync(entry.target)) await rm(entry.target, { force: true })
      if (existsSync(entry.backup)) await rename(entry.backup, entry.target)
      await rm(entry.temporary, { force: true })
    }
    throw error
  }
}

async function generate(root) {
  const [festivalSchema, i18nSchema] = await Promise.all([
    readSchema(root, 'festival-pack.schema.json'),
    readSchema(root, 'i18n.schema.json'),
  ])
  validateSchemaDefinition(festivalSchema, 'festival-pack.schema.json', ['id', 'country', 'locale', 'category', 'name', 'dateRule'])
  validateSchemaDefinition(i18nSchema, 'i18n.schema.json', ['locale', 'translations'])
  const packs = await collectFestivalPacks(root)
  const locales = await collectLocales(root)
  const themeKeys = await readVisualThemeKeys(root)
  validateThemeKeys(packs, themeKeys)
  return generatedContents(packs, locales, themeKeys)
}

async function main() {
  const args = process.argv.slice(2)
  const rootIndex = args.indexOf('--root')
  const root = resolve(rootIndex >= 0 ? args[rootIndex + 1] : process.cwd())
  const mode = args.includes('--check') ? 'check' : args.includes('--write') ? 'write' : null
  if (!mode) fail('`--check` または `--write` が必要です')
  const contents = await generate(root)
  if (mode === 'check') {
    for (const [relativePath, expected] of contents) {
      const target = join(root, relativePath)
      const actual = await readFile(target, 'utf8').catch(() => null)
      if (actual !== expected) fail(`生成済み manifest が古いです: ${relativePath}`)
    }
    return
  }
  await writeAtomically(root, contents)
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/generate-data-manifest.mjs')) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
