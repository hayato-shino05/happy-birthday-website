import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
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
  mkdirSync(join(root, 'lib', 'i18n'), { recursive: true })
  writeFileSync(join(root, 'config', 'themes.ts'), 'export const THEMES = { spring: {} }\n')
  writeFileSync(join(root, 'lib', 'i18n', 'translations.ts'), 'export const translations = { ja: { title: "誕生日" } }\n')
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

    const { collectSnapshot } = await import('../../scripts/collect-festival-snapshot.mjs')
    const snapshot = collectSnapshot({
      productionRoot,
      productionCommit: 'HEAD',
      openSourceRoot,
    })

    expect(snapshot.source).toEqual({ production: expect.any(Object), openSource: expect.any(Object) })
    expect(snapshot.production.commit).toBeDefined()
    expect(snapshot.production.files.included).toContain('config/themes.ts')
    expect(snapshot.production.files.excluded).toContain('.env')
    expect(snapshot.production.files.included).not.toContain('config/themes.ts~')
    expect(snapshot.openSource.files.excluded).toContain('.env.example')
    expect(snapshot.openSource.files.excluded).toContain('supabase/config.toml')
    expect(snapshot.openSource.files.excluded).toContain('supabase/seed.sql')
    expect(snapshot.production.events).toEqual([])
    expect(snapshot.production.locales).toEqual(['ja'])
    expect(snapshot.production.themes).toEqual(['spring'])
  })
})
