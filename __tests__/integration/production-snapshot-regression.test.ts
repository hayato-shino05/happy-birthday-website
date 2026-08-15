import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { tmpdir } from 'node:os'
import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useThemeContext } from '@/lib/providers/ThemeProvider'

vi.mock('@/lib/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'spring',
    themeConfig: {
      name: 'spring',
      displayName: { vi: 'Mùa Xuân', en: 'Spring', ja: '春' },
      colors: { primary: '#000', secondary: '#111', background: '#222', text: '#fff', accent: '#333' },
      gradient: 'from-pink-100 to-pink-200',
      effects: [],
    },
    setTheme: vi.fn(),
    isAutoDetect: true,
    setAutoDetect: vi.fn(),
  }),
}))

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

describe('anonymous community contract', () => {
  it('keeps the public tables read/create-only for anon', () => {
    const migration = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20260812163000_reset_and_create_anonymous_community.sql'), 'utf8')
    const tables = ['birthdays', 'messages', 'media_submissions', 'virtual_gifts', 'chat_messages', 'bulletin_posts']

    for (const table of tables) {
      expect(migration).toContain(`create table public.${table}`)
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toMatch(new RegExp(`grant select on public\\.[^;]*\\b${table}\\b`))
      expect(migration).not.toMatch(new RegExp(`grant (?:update|delete) on public\\.[^;]*\\b${table}\\b`))
    }

    expect(migration).toContain('grant insert on public.messages, public.media_submissions, public.virtual_gifts, public.chat_messages, public.bulletin_posts, public.post_replies to anon')
    expect(migration).not.toMatch(/for (?:update|delete) to anon/)
  })
})

describe('ThemeProvider render smoke', () => {
  it('renders the existing provider contract', () => {
    function Probe() {
      const { currentTheme, themeConfig } = useThemeContext()
      return createElement('output', { 'data-testid': 'theme-probe' }, `${currentTheme}:${themeConfig.name}`)
    }

    render(createElement(ThemeProvider, null, createElement(Probe)))

    expect(screen.getByTestId('theme-probe').textContent).toBe('spring:spring')
  })
})
