import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

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
  writeFileSync(join(root, 'data', 'schemas', 'festival-pack.schema.json'), JSON.stringify({ type: 'object', required: ['id', 'country', 'locale', 'category', 'name', 'dateRule'] }))
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

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('generate-data-manifest', () => {
  it('discovers packs and writes deterministic generated manifests', () => {
    const root = createFixture()
    writePack(root, 'z.json', 'z-event')
    writePack(root, 'a.json', 'a-event')
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

  it('rejects duplicate IDs and preserves existing manifests', () => {
    const root = createFixture()
    writePack(root, 'a.json', 'same-event')
    runGenerator(root, '--write')
    const outputPath = join(root, 'data', 'generated', 'festival-packs.ts')
    const previous = readFileSync(outputPath, 'utf8')
    writePack(root, 'b.json', 'same-event')

    expect(() => runGenerator(root, '--write')).toThrow()
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

  it('rejects invalid packs and unknown theme keys before writing', () => {
    const root = createFixture()
    writePack(root, 'a.json', 'invalid-event', 'unknown-theme')

    expect(() => runGenerator(root, '--write')).toThrow(/themeKey/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })

  it('rejects an invalid schema before writing any manifest', () => {
    const root = createFixture()
    writeFileSync(join(root, 'data', 'schemas', 'festival-pack.schema.json'), JSON.stringify({ type: 'string' }))
    writePack(root, 'a.json', 'schema-event')

    expect(() => runGenerator(root, '--write')).toThrow(/festival-pack.schema.json/)
    expect(existsSync(join(root, 'data', 'generated', 'festival-packs.ts'))).toBe(false)
  })
})
