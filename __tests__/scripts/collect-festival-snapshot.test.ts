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
    expect(snapshot.production.locales).toEqual(['ja'])
    expect(snapshot.production.themes).toEqual(['spring'])
  })

  it('regenerates existing outputs and preserves them when collection fails', () => {
    const productionRoot = createRepository()
    writeTrackedFixture(productionRoot)
    execFileSync('git', ['-C', productionRoot, 'add', '.'])
    execFileSync('git', ['-C', productionRoot, 'commit', '--quiet', '-m', 'snapshot'])

    const openSourceRoot = createRepository()
    writeTrackedFixture(openSourceRoot)
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

    writeFileSync(productionOutput, '{"keep":true}\n')
    const failingArgs = [...args]
    failingArgs[4] = 'missing-commit'
    expect(() => execFileSync(process.execPath, failingArgs)).toThrow()
    expect(JSON.parse(readFileSync(productionOutput, 'utf8'))).toEqual({ keep: true })
  })
})
