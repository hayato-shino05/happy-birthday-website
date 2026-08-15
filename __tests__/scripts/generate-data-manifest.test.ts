import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = join(process.cwd(), 'scripts', 'generate-data-manifest.mjs')

function createFixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'festival-manifest-'))
  mkdirSync(join(root, 'data', 'festivals', 'jp'), { recursive: true })
  mkdirSync(join(root, 'data', 'i18n'), { recursive: true })
  mkdirSync(join(root, 'data', 'schemas'), { recursive: true })
  mkdirSync(join(root, 'config'), { recursive: true })
  writeFileSync(join(root, 'config', 'visualThemes.ts'), "export const VISUAL_THEME_KEYS = ['hanami', 'spring'] as const\n")
  writeFileSync(join(root, 'data', 'schemas', 'festival-pack.schema.json'), JSON.stringify({ type: 'object', required: ['id', 'country', 'locale', 'category', 'name', 'dateRule'] }))
  writeFileSync(join(root, 'data', 'schemas', 'i18n.schema.json'), JSON.stringify({ type: 'object', required: ['locale', 'translations'] }))
  return root
}

function writePack(root: string, fileName: string, id: string, themeKey = 'hanami'): void {
  writeFileSync(
    join(root, 'data', 'festivals', 'jp', fileName),
    `${JSON.stringify([
      {
        id,
        country: 'jp',
        locale: 'ja-JP',
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

describe('generate-data-manifest', () => {
  it('discovers packs and writes deterministic generated manifests', () => {
    const root = createFixture()
    writePack(root, 'z.json', 'z-event')
    writePack(root, 'a.json', 'a-event')
    writeFileSync(join(root, 'data', 'i18n', 'ja-JP.json'), JSON.stringify({ locale: 'ja-JP', translations: { title: '誕生日' } }))

    runGenerator(root, '--write')
    const festivalManifest = readFileSync(join(root, 'data', 'generated', 'festival-packs.ts'), 'utf8')
    const localeManifest = readFileSync(join(root, 'data', 'generated', 'locales.ts'), 'utf8')
    const themeManifest = readFileSync(join(root, 'data', 'generated', 'themes.ts'), 'utf8')

    expect(festivalManifest.indexOf('a-event')).toBeLessThan(festivalManifest.indexOf('z-event'))
    expect(localeManifest).toContain('ja-JP')
    expect(themeManifest).toContain('hanami')
    expect(runGenerator(root, '--check')).toBe('')
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
