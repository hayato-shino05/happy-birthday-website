import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

function createRepository(): string {
  const root = mkdtempSync(join(tmpdir(), 'festival-snapshot-'))
  temporaryDirectories.push(root)
  execFileSync('git', ['init', '--quiet', root])
  execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com'])
  execFileSync('git', ['-C', root, 'config', 'user.name', 'Test'])
  return root
}

function writeTrackedFixture(root: string): void {
  mkdirSync(join(root, 'config'), { recursive: true })
  mkdirSync(join(root, 'data', 'festivals', 'jp'), { recursive: true })
  mkdirSync(join(root, 'data', 'i18n'), { recursive: true })
  mkdirSync(join(root, '.claude'), { recursive: true })
  mkdirSync(join(root, '.agents'), { recursive: true })
  mkdirSync(join(root, '.harness-core'), { recursive: true })
  mkdirSync(join(root, '.vercel'), { recursive: true })
  mkdirSync(join(root, 'public'), { recursive: true })
  writeFileSync(join(root, '.claude', 'generated.md'), 'generated\n')
  writeFileSync(join(root, '.agents', 'generated.md'), 'generated\n')
  writeFileSync(join(root, '.harness-core', 'generated.md'), 'generated\n')
  writeFileSync(join(root, '.vercel', 'project.json'), '{}\n')
  writeFileSync(join(root, 'public', 'vercel.svg'), 'svg\n')
  writeFileSync(join(root, 'config', 'themes.ts'), 'export const THEMES = { spring: {} }\n')
  writeFileSync(join(root, 'data', 'festivals', 'jp', 'ja.json'), JSON.stringify([{ id: 'jp-hanami', country: 'jp', locale: 'ja', category: 'season', name: '花見', dateRule: { calendar: 'gregorian', recurrence: 'yearly', ranges: [{ month: 3, startDay: 20, endDay: 31 }], timeZone: 'Asia/Tokyo' }, enabled: true, status: 'enabled', priority: 10, themeKey: 'spring' }]))
  writeFileSync(join(root, 'data', 'festivals', 'jp', 'notes.txt'), 'not a data pack\n')
  writeFileSync(join(root, 'data', 'i18n', 'ja.json'), JSON.stringify({ locale: 'ja', translations: { title: '誕生日' } }))
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe('collectSnapshot', () => {
  const withOption = (args: string[], flag: string, value: string): string[] => {
    const index = args.indexOf(flag)
    if (index < 0) throw new Error(`missing flag: ${flag}`)
    const next = [...args]
    next[index + 1] = value
    return next
  }

  it('records clean commit metadata and excludes dirty or sensitive paths', async () => {
    const productionRoot = createRepository()
    writeTrackedFixture(productionRoot)
    execFileSync('git', ['-C', productionRoot, 'add', '.'])
    execFileSync('git', ['-C', productionRoot, 'commit', '--quiet', '-m', 'snapshot'])
    writeFileSync(join(productionRoot, 'config', 'themes.ts'), 'export const THEMES = { dirty: {} }\n')
    writeFileSync(join(productionRoot, '.env'), 'SECRET=hidden\n')

    const openSourceRoot = createRepository()
    writeTrackedFixture(openSourceRoot)
    mkdirSync(join(openSourceRoot, 'supabase'), { recursive: true })
    writeFileSync(join(openSourceRoot, '.env.example'), 'PUBLIC=value\n')
    writeFileSync(join(openSourceRoot, 'supabase', 'config.toml'), 'project_id = "test"\n')
    writeFileSync(join(openSourceRoot, 'supabase', 'seed.sql'), 'select 1;\n')
    execFileSync('git', ['-C', openSourceRoot, 'add', '.'])
    execFileSync('git', ['-C', openSourceRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const moduleUrl = pathToFileURL(join(process.cwd(), 'scripts', 'collect-festival-snapshot.mjs')).href
    const { collectSnapshot } = await import(moduleUrl)
    const snapshot = collectSnapshot({
      productionRoot,
      productionCommit: 'HEAD',
      openSourceRoot,
    })

    expect(snapshot.source).toEqual({ production: expect.any(Object), openSource: expect.any(Object) })
    expect(snapshot.production.commit).toBeDefined()
    expect(snapshot.production.files.included).toContain('config/themes.ts')
    expect(snapshot.production.files.excluded).toContain('.env')
    expect(snapshot.production.files.excluded).toContain('.claude/generated.md')
    expect(snapshot.production.files.excluded).toContain('.agents/generated.md')
    expect(snapshot.production.files.excluded).toContain('.harness-core/generated.md')
    expect(snapshot.production.files.excluded).toContain('.vercel/project.json')
    expect(snapshot.production.files.excluded).toContain('public/vercel.svg')
    expect(snapshot.openSource.files.excluded).toContain('.env.example')
    expect(snapshot.openSource.files.excluded).toContain('supabase/config.toml')
    expect(snapshot.openSource.files.excluded).toContain('supabase/seed.sql')
    expect(snapshot.production.events).toEqual([
      expect.objectContaining({ id: 'jp-hanami', locale: 'ja' }),
    ])
    expect(snapshot.production.seasons).toEqual(['jp-hanami'])
    expect(snapshot.production.locales).toEqual(['ja'])
    expect(snapshot.production.themes).toEqual(['spring'])
  })

  it('rejects legacy-only event definitions instead of creating synthetic packs', async () => {
    const productionRoot = createRepository()
    mkdirSync(join(productionRoot, 'config'), { recursive: true })
    mkdirSync(join(productionRoot, 'data', 'i18n'), { recursive: true })
    writeFileSync(join(productionRoot, 'config', 'themes.ts'), 'export const FESTIVAL_DATES = { legacyEvent: { month: 1, day: 1 } }\n')
    writeFileSync(join(productionRoot, 'data', 'i18n', 'ja.json'), JSON.stringify({ locale: 'ja' }))
    execFileSync('git', ['-C', productionRoot, 'add', '.'])
    execFileSync('git', ['-C', productionRoot, 'commit', '--quiet', '-m', 'legacy snapshot'])

    const openSourceRoot = createRepository()
    writeTrackedFixture(openSourceRoot)
    execFileSync('git', ['-C', openSourceRoot, 'add', '.'])
    execFileSync('git', ['-C', openSourceRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const moduleUrl = pathToFileURL(join(process.cwd(), 'scripts', 'collect-festival-snapshot.mjs')).href
    const { collectSnapshot } = await import(moduleUrl)

    expect(() => collectSnapshot({
      productionRoot,
      productionCommit: 'HEAD',
      openSourceRoot,
    })).toThrow(/legacy FESTIVAL_DATES.*validated festival packs/)
  })

  it('records both paths for a dirty rename without truncating the old path', async () => {
    const productionRoot = createRepository()
    writeTrackedFixture(productionRoot)
    execFileSync('git', ['-C', productionRoot, 'add', '.'])
    execFileSync('git', ['-C', productionRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const openSourceRoot = createRepository()
    writeTrackedFixture(openSourceRoot)
    writeFileSync(join(openSourceRoot, '.env.example'), 'PUBLIC=value\n')
    execFileSync('git', ['-C', openSourceRoot, 'add', '.'])
    execFileSync('git', ['-C', openSourceRoot, 'commit', '--quiet', '-m', 'snapshot'])
    execFileSync('git', ['-C', openSourceRoot, 'mv', '.env.example', '.env.local'])

    const moduleUrl = pathToFileURL(join(process.cwd(), 'scripts', 'collect-festival-snapshot.mjs')).href
    const { collectSnapshot } = await import(moduleUrl)
    const snapshot = collectSnapshot({
      productionRoot,
      productionCommit: 'HEAD',
      openSourceRoot,
    })

    expect(snapshot.openSource.files.excluded).toEqual(expect.arrayContaining(['.env.example', '.env.local']))
    expect(snapshot.openSource.files.reasons['.env.example']).toBe('環境変数と秘密情報')
    expect(snapshot.openSource.files.reasons['.env.local']).toBe('環境変数と秘密情報')
  })

  it('regenerates existing outputs and preserves existing files when collection stops before writing', () => {
    const productionRoot = createRepository()
    writeTrackedFixture(productionRoot)
    execFileSync('git', ['-C', productionRoot, 'add', '.'])
    execFileSync('git', ['-C', productionRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const openSourceRoot = createRepository()
    writeTrackedFixture(openSourceRoot)
    writeFileSync(join(openSourceRoot, 'data', 'i18n', 'en.json'), JSON.stringify({ locale: 'en', translations: { title: 'Birthday' } }))
    execFileSync('git', ['-C', openSourceRoot, 'add', '.'])
    execFileSync('git', ['-C', openSourceRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const outputRoot = mkdtempSync(join(tmpdir(), 'festival-output-'))
    temporaryDirectories.push(outputRoot)
    const scriptPath = join(process.cwd(), 'scripts', 'collect-festival-snapshot.mjs')
    const productionOutput = join(outputRoot, 'production.json')
    const openSourceOutput = join(outputRoot, 'opensource.json')
    const allowlistOutput = join(outputRoot, 'allowlist.json')
    const args = [
      scriptPath,
      '--production-root', productionRoot,
      '--production-commit', 'HEAD',
      '--opensource-root', openSourceRoot,
      '--production-output', productionOutput,
      '--opensource-output', openSourceOutput,
      '--allowlist', allowlistOutput,
    ]

    execFileSync(process.execPath, args)
    writeFileSync(productionOutput, '{"stale":true}\n')
    execFileSync(process.execPath, args)

    const allowlist = JSON.parse(readFileSync(allowlistOutput, 'utf8'))
    expect(JSON.parse(readFileSync(productionOutput, 'utf8'))).not.toHaveProperty('stale')
    expect(allowlist.allowedPathScopes).toEqual(['data/festivals/', 'data/i18n/'])
    expect(allowlist.integrationPaths).toEqual(['data/festivals/jp/ja.json', 'data/i18n/ja.json'])
    expect(allowlist.allowedPaths).toEqual(['data/festivals/jp/ja.json', 'data/i18n/ja.json'])
    expect(allowlist.allowedPaths).not.toContain('data/festivals/jp/notes.txt')
    expect(allowlist.excludedPaths.dirty).not.toContain('data/festivals/jp/ja.json')

    writeFileSync(productionOutput, '{"keep":true}\n')
    const failingArgs = withOption(args, '--production-commit', 'missing-commit')
    expect(() => execFileSync(process.execPath, failingArgs)).toThrow()
    expect(JSON.parse(readFileSync(productionOutput, 'utf8'))).toEqual({ keep: true })
  })
})
