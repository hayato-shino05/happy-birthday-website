import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'generate-data-manifest.mjs')
const temporaryDirectories: string[] = []

function createFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'festival-manifest-'))
  temporaryDirectories.push(root)
  mkdirSync(join(root, 'data', 'festivals', 'jp'), { recursive: true })
  mkdirSync(join(root, 'data', 'i18n'), { recursive: true })
  mkdirSync(join(root, 'data', 'schemas'), { recursive: true })
  mkdirSync(join(root, 'config'), { recursive: true })
  writeFileSync(join(root, 'config', 'visualThemes.ts'), "export const VISUAL_THEME_KEYS = ['hanami', 'spring'] as const\n")
  writeFileSync(join(root, 'data', 'schemas', 'festival-pack.schema.json'), JSON.stringify({ type: 'object', required: ['id', 'country', 'locale', 'category', 'name', 'dateRule', 'enabled', 'status', 'priority'] }))
  writeFileSync(join(root, 'data', 'schemas', 'i18n.schema.json'), JSON.stringify({ type: 'object', required: ['locale', 'translations'] }))
  writeFileSync(join(root, 'data', 'i18n', 'keys.json'), JSON.stringify(['title']))
  for (const [fileName, locale] of [['en', 'en'], ['ja', 'ja']] as const) {
    writeFileSync(join(root, 'data', 'i18n', `${fileName}.json`), JSON.stringify({ locale, translations: { title: locale } }))
  }
  return root
}

function writePack(root: string, fileName: string, id: string, themeKey = 'hanami', locale: 'en' | 'ja' = 'ja'): void {
  writeFileSync(
    join(root, 'data', 'festivals', 'jp', fileName),
    `${JSON.stringify([
      {
        id,
        country: 'jp',
        locale,
        category: 'festival',
        name: id,
        dateRule: {
          calendar: 'gregorian',
          recurrence: 'yearly',
          ranges: [{ month: 3, startDay: 20, endDay: 31 }],
          timeZone: 'Asia/Tokyo',
        },
        enabled: true,
        status: 'enabled',
        priority: 1,
        themeKey,
      },
    ], null, 2)}\n`,
  )
}

function runGenerator(root: string, ...args: string[]): string {
  return execFileSync(process.execPath, [scriptPath, '--root', root, ...args], {
    encoding: 'utf8',
  })
}

function removeTemporaryDirectories(): void {
  const failures: Error[] = []
  for (const directory of temporaryDirectories.splice(0)) {
    try {
      rmSync(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
    } catch (error) {
      failures.push(error instanceof Error ? error : new Error(String(error)))
    }
  }
  if (failures.length > 0) throw failures[0]
}

afterEach(removeTemporaryDirectories)

afterAll(removeTemporaryDirectories)

describe('generate-data-manifest', () => {
  it('discovers packs and writes deterministic generated manifests', () => {
    const root = createFixture()
    writePack(root, 'z-ja.json', 'z-event', 'hanami', 'ja')
    writePack(root, 'z-en.json', 'z-event', 'hanami', 'en')
    writePack(root, 'a-ja.json', 'a-event', 'hanami', 'ja')
    writePack(root, 'a-en.json', 'a-event', 'hanami', 'en')
    writeFileSync(join(root, 'data', 'i18n', 'ja.json'), JSON.stringify({ locale: 'ja', translations: { title: '誕生日' } }))

    runGenerator(root, '--write')
    const festivalManifest = readFileSync(join(root, 'data', 'generated', 'festival-packs.ts'), 'utf8')
    const localeManifest = readFileSync(join(root, 'data', 'generated', 'locales.ts'), 'utf8')
    const themeManifest = readFileSync(join(root, 'data', 'generated', 'themes.ts'), 'utf8')

    expect(festivalManifest.indexOf('a-event')).toBeLessThan(festivalManifest.indexOf('z-event'))
    expect(localeManifest).toContain('ja')
    expect(themeManifest).toContain('hanami')
    expect(runGenerator(root, '--check')).toBe('')
  })

  it('rejects unsupported locale packs', () => {
    const root = createFixture()
    writeFileSync(join(root, 'data', 'i18n', 'vi.json'), JSON.stringify({ locale: 'vi', translations: { title: 'Sinh nhật' } }))

    expect(() => runGenerator(root, '--write')).toThrow(/未対応の locale pack/)
    expect(existsSync(join(root, 'data', 'generated', 'locales.ts'))).toBe(false)
  })

  it('rejects unknown locale top-level keys before writing', () => {
    const root = createFixture()
    writeFileSync(join(root, 'data', 'i18n', 'ja.json'), JSON.stringify({ locale: 'ja', translations: { title: '誕生日' }, extra: true }))

    expect(() => runGenerator(root, '--write')).toThrow(/extra/)
    expect(existsSync(join(root, 'data', 'generated', 'locales.ts'))).toBe(false)
  })

  it('reports a missing --root value with a generator diagnostic', () => {
    expect(() => execFileSync(process.execPath, [scriptPath, '--root'], { encoding: 'utf8' })).toThrow(/`--root` にはパスが必要です/)
  })

  it('rejects missing supported locale packs', () => {
    const root = createFixture()
    rmSync(join(root, 'data', 'i18n', 'en.json'))

    expect(() => runGenerator(root, '--write')).toThrow(/supported locale pack が不足しています: en/)
    expect(existsSync(join(root, 'data', 'generated', 'locales.ts'))).toBe(false)
  })

  it('rejects non-canonical locale filenames', () => {
    const root = createFixture()
    rmSync(join(root, 'data', 'i18n', 'en.json'))
    writeFileSync(join(root, 'data', 'i18n', 'english.json'), JSON.stringify({ locale: 'en', translations: { title: 'Birthday' } }))

    expect(() => runGenerator(root, '--write')).toThrow(/en\.json/)
    expect(existsSync(join(root, 'data', 'generated', 'locales.ts'))).toBe(false)
  })

  it('rejects duplicate locale variants and preserves existing manifests', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'same-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'same-event', 'hanami', 'en')
    runGenerator(root, '--write')
    const outputPath = join(root, 'data', 'generated', 'festival-packs.ts')
    const previous = readFileSync(outputPath, 'utf8')
    writePack(root, 'duplicate-ja.json', 'same-event', 'hanami', 'ja')

    expect(() => runGenerator(root, '--write')).toThrow(/ID が重複/)
    expect(readFileSync(outputPath, 'utf8')).toBe(previous)
  })

  it('accepts a stable event ID across localized packs', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'same-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'same-event', 'hanami', 'en')

    runGenerator(root, '--write')

    const festivalManifest = readFileSync(join(root, 'data', 'generated', 'festival-packs.ts'), 'utf8')
    expect(festivalManifest.match(/"id": "same-event"/g)).toHaveLength(2)
  })

  it('rejects duplicate locale variants even when the third record matches the first locale only by id', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'same-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'same-event', 'hanami', 'en')
    writePack(root, 'ja-duplicate.json', 'same-event', 'hanami', 'ja')

    expect(() => runGenerator(root, '--write')).toThrow(/ID が重複/)
  })

  it('rejects festival ids that contain only whitespace', () => {
    const root = createFixture()
    writePack(root, 'ja.json', '   ', 'hanami', 'ja')
    writePack(root, 'en.json', '   ', 'hanami', 'en')

    expect(() => runGenerator(root, '--write')).toThrow(/\.id が不正/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('rejects festival ids that do not provide every supported locale', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'same-event', 'hanami', 'ja')

    expect(() => runGenerator(root, '--write')).toThrow(/locale が不足しています/)
  })

  it('rejects impossible range endpoints before writing', () => {
    const root = createFixture()
    writePack(root, 'a-ja.json', 'invalid-date', 'hanami', 'ja')
    writePack(root, 'a-en.json', 'invalid-date', 'hanami', 'en')
    const path = join(root, 'data', 'festivals', 'jp', 'a-ja.json')
    const value = JSON.parse(readFileSync(path, 'utf8'))
    value[0].dateRule.ranges = [{ month: 2, startDay: 30, endDay: 30 }]
    writeFileSync(path, JSON.stringify(value))

    expect(() => runGenerator(root, '--write')).toThrow(/ranges.*不正/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('rejects yearly ranges that include leap-day-only dates', () => {
    const root = createFixture()
    writePack(root, 'a-ja.json', 'invalid-leap-day', 'hanami', 'ja')
    writePack(root, 'a-en.json', 'invalid-leap-day', 'hanami', 'en')
    const path = join(root, 'data', 'festivals', 'jp', 'a-ja.json')
    const value = JSON.parse(readFileSync(path, 'utf8'))
    value[0].dateRule.ranges = [{ month: 2, startDay: 29, endDay: 29 }]
    writeFileSync(path, JSON.stringify(value))

    expect(() => runGenerator(root, '--write')).toThrow(/startDay が不正/)
  })

  it('rejects malformed lunar payload fields and localized runtime drift', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'same-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'same-event', 'hanami', 'en')
    const lunarPath = join(root, 'data', 'festivals', 'jp', 'ja.json')
    const lunar = JSON.parse(readFileSync(lunarPath, 'utf8'))
    lunar[0].dateRule = {
      calendar: 'lunar',
      recurrence: 'year-specific',
      payload: { source: 'test' },
      ranges: [{ month: 1, startDay: 1, endDay: 1 }],
      timeZone: 'Asia/Tokyo',
      status: 'unsupported-calendar',
    }
    writeFileSync(lunarPath, JSON.stringify(lunar))
    expect(() => runGenerator(root, '--write')).toThrow(/calendar と recurrence/)

    const validRoot = createFixture()
    writePack(validRoot, 'ja.json', 'same-event', 'hanami', 'ja')
    writePack(validRoot, 'en.json', 'same-event', 'hanami', 'en')
    const driftPath = join(validRoot, 'data', 'festivals', 'jp', 'en.json')
    const drift = JSON.parse(readFileSync(driftPath, 'utf8'))
    drift[0].enabled = false
    writeFileSync(driftPath, JSON.stringify(drift))
    expect(() => runGenerator(validRoot, '--write')).toThrow(/ID が重複/)
  })

  it('rejects unknown pack and dateRule keys before writing', () => {
    const root = createFixture()
    writePack(root, 'a-ja.json', 'invalid-event', 'hanami', 'ja')
    writePack(root, 'a-en.json', 'invalid-event', 'hanami', 'en')
    const path = join(root, 'data', 'festivals', 'jp', 'a-ja.json')
    const value = JSON.parse(readFileSync(path, 'utf8'))
    value[0].extra = true
    writeFileSync(path, JSON.stringify(value))

    expect(() => runGenerator(root, '--write')).toThrow(/extra/)

    delete value[0].extra
    value[0].dateRule.extra = true
    writeFileSync(path, JSON.stringify(value))
    expect(() => runGenerator(root, '--write')).toThrow(/dateRule\.extra/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('rejects invalid packs and unknown theme keys before writing', () => {
    const root = createFixture()
    writePack(root, 'a-ja.json', 'invalid-event', 'unknown-theme', 'ja')
    writePack(root, 'a-en.json', 'invalid-event', 'unknown-theme', 'en')

    expect(() => runGenerator(root, '--write')).toThrow(/themeKey/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('rejects an invalid schema before writing any manifest', () => {
    const root = createFixture()
    writeFileSync(join(root, 'data', 'schemas', 'festival-pack.schema.json'), JSON.stringify({ type: 'string' }))
    writePack(root, 'a-ja.json', 'schema-event', 'hanami', 'ja')
    writePack(root, 'a-en.json', 'schema-event', 'hanami', 'en')

    expect(() => runGenerator(root, '--write')).toThrow(/festival-pack.schema.json/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('passes --check on a minimal valid fixture after generating manifests', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'check-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'check-event', 'hanami', 'en')

    runGenerator(root, '--write')
    expect(runGenerator(root, '--check')).toBe('')
  })

  it('fails --check when the ja festival pack is deleted', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'locale-gap-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'locale-gap-event', 'hanami', 'en')
    rmSync(join(root, 'data', 'festivals', 'jp', 'ja.json'))

    expect(() => runGenerator(root, '--check')).toThrow(/locale が不足しています: locale-gap-event:ja/)
  })

  it('fails --check when i18n schema drops the translations requirement', () => {
    const root = createFixture()
    writePack(root, 'ja.json', 'schema-drift-event', 'hanami', 'ja')
    writePack(root, 'en.json', 'schema-drift-event', 'hanami', 'en')
    writeFileSync(
      join(root, 'data', 'schemas', 'i18n.schema.json'),
      JSON.stringify({ type: 'object', required: ['locale'] }),
    )

    expect(() => runGenerator(root, '--check')).toThrow(/i18n\.schema\.json\.required に translations がありません/)
  })
})
