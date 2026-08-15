import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

async function loadAllowlistScript() {
  return import(pathToFileURL(join(process.cwd(), 'scripts', 'apply-production-allowlist.mjs')).href)
}

function createRepository(): string {
  const root = mkdtempSync(join(tmpdir(), 'production-allowlist-'))
  temporaryDirectories.push(root)
  execFileSync('git', ['init', '--quiet', root])
  execFileSync('git', ['-C', root, 'config', 'user.email', 'test@example.com'])
  execFileSync('git', ['-C', root, 'config', 'user.name', 'Test'])
  return root
}

function commitRepository(root: string): string {
  execFileSync('git', ['-C', root, 'add', '.'])
  execFileSync('git', ['-C', root, 'commit', '--quiet', '-m', 'fixture'])
  return execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('production allowlist integration', () => {
  it('applies only clean-commit integrationPaths and ignores dirty production files', async () => {
    const { applyProductionAllowlist } = await loadAllowlistScript()
    const productionRoot = createRepository()
    mkdirSync(join(productionRoot, 'data', 'festivals', 'jp'), { recursive: true })
    mkdirSync(join(productionRoot, 'supabase'), { recursive: true })
    writeFileSync(join(productionRoot, 'data', 'festivals', 'jp', 'ja.json'), '{"source":"clean"}\n')
    writeFileSync(join(productionRoot, 'supabase', 'config.toml'), 'secret = true\n')
    const commit = commitRepository(productionRoot)
    writeFileSync(join(productionRoot, 'data', 'festivals', 'jp', 'ja.json'), '{"source":"dirty"}\n')

    const destination = mkdtempSync(join(tmpdir(), 'production-destination-'))
    temporaryDirectories.push(destination)
    const allowlistPath = join(destination, 'allowlist.json')
    writeFileSync(allowlistPath, JSON.stringify({
      allowedPathScopes: ['data/festivals/'],
      allowedPaths: ['data/festivals/jp/ja.json'],
      integrationPaths: ['data/festivals/jp/ja.json'],
      excludedPaths: { supabase: ['supabase/config.toml'] },
    }))

    const candidates = applyProductionAllowlist({
      productionRoot,
      productionCommit: commit,
      allowlistPath,
      destination,
      check: true,
    })
    expect(candidates).toHaveLength(1)
    expect(existsSync(join(destination, 'data', 'festivals', 'jp', 'ja.json'))).toBe(false)

    applyProductionAllowlist({ productionRoot, productionCommit: commit, allowlistPath, destination })
    expect(readFileSync(join(destination, 'data', 'festivals', 'jp', 'ja.json'), 'utf8')).toBe('{"source":"clean"}\n')
    expect(existsSync(join(destination, 'supabase', 'config.toml'))).toBe(false)
  })

  it('rejects excluded paths and forbidden staged files', async () => {
    const { checkStagedFiles, readIntegrationPaths } = await loadAllowlistScript()
    expect(() => readIntegrationPaths({
      allowedPathScopes: ['data/'],
      integrationPaths: ['supabase/config.toml'],
      excludedPaths: {},
    })).toThrow('除外対象')

    const repository = createRepository()
    writeFileSync(join(repository, '.env'), 'TOKEN=not-for-production\n')
    execFileSync('git', ['-C', repository, 'add', '-f', '.env'])
    expect(() => checkStagedFiles(repository)).toThrow('禁止対象')
  })
})
