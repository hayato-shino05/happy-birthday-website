import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const EXCLUDED_PATH_RULES = [
  { test: (path) => /^\.env(?:\.|$)/.test(path), reason: '環境変数と秘密情報' },
  { test: (path) => path === 'supabase' || path.startsWith('supabase/'), reason: 'Supabase 設定とスキーマ' },
  { test: (path) => /(?:^|\/)(?:deploy|deployment|vercel|netlify)(?:\/|\.|$)/i.test(path), reason: 'デプロイ設定または成果物' },
]

function runGit(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim()
}

function getTrackedFiles(root, commit) {
  return runGit(root, ['ls-tree', '-r', '--name-only', commit]).split('\n').filter(Boolean)
}

function getDirtyFiles(root) {
  if (!existsSync(resolve(root, '.git'))) return []
  const output = execFileSync(
    'git',
    ['-C', root, 'status', '--porcelain', '--untracked-files=all'],
    { encoding: 'utf8' },
  )
  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^"|"$/g, '').trim())
    .filter(Boolean)
}

function readAtCommit(root, commit, relativePath) {
  try {
    return runGit(root, ['show', `${commit}:${relativePath}`])
  } catch {
    return ''
  }
}

function readTrackedFile(root, commit, relativePath) {
  if (commit) return readAtCommit(root, commit, relativePath)
  const absolutePath = resolve(root, relativePath)
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : ''
}

function extractObjectKeys(source, marker) {
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) return []
  const openingBrace = source.indexOf('{', markerIndex)
  if (openingBrace < 0) return []

  const keys = []
  let depth = 0
  let quote = null
  let escaped = false
  let token = ''

  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === quote) quote = null
      continue
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character
      continue
    }
    if (character === '{') {
      depth += 1
      token = ''
      continue
    }
    if (character === '}') {
      depth -= 1
      if (depth === 0) break
      token = ''
      continue
    }
    if (depth === 1) {
      if (/[$\w-]/.test(character)) token += character
      else if (character === ':') {
        if (token && !keys.includes(token)) keys.push(token)
        token = ''
      } else if (!/\s/.test(character)) {
        token = ''
      }
    }
  }

  return keys.sort()
}

function classifyPath(relativePath) {
  const rule = EXCLUDED_PATH_RULES.find(({ test }) => test(relativePath))
  return rule ?? null
}

function buildFiles(root, commit, trackedFiles) {
  const dirtyFiles = getDirtyFiles(root)
  const candidates = [...new Set([...trackedFiles, ...dirtyFiles])].sort()
  const excluded = []
  const reasons = {}
  const included = []

  for (const relativePath of candidates) {
    const rule = classifyPath(relativePath)
    if (rule) {
      excluded.push(relativePath)
      reasons[relativePath] = rule.reason
    } else if (trackedFiles.includes(relativePath)) {
      included.push(relativePath)
    }
  }

  return { included, excluded, reasons, commit }
}

function collectSource({ source, root, commit }) {
  const trackedFiles = getTrackedFiles(root, commit)
  const themeSource = readTrackedFile(root, commit, 'config/themes.ts')
  const translationSource = readTrackedFile(root, commit, 'lib/i18n/translations.ts')
  const festivalDates = extractObjectKeys(themeSource, 'FESTIVAL_DATES')
  const seasonMonths = extractObjectKeys(themeSource, 'SEASON_MONTHS')
  const themes = extractObjectKeys(themeSource, 'THEMES')
  const locales = extractObjectKeys(translationSource, 'translations')

  return {
    source,
    commit,
    files: buildFiles(root, commit, trackedFiles),
    events: festivalDates,
    seasons: seasonMonths,
    locales,
    themes,
  }
}

export function collectSnapshot({ productionRoot, productionCommit, openSourceRoot }) {
  const openSourceCommit = runGit(openSourceRoot, ['rev-parse', 'HEAD'])
  const production = collectSource({ source: 'production', root: productionRoot, commit: productionCommit })
  const openSource = collectSource({ source: 'openSource', root: openSourceRoot, commit: openSourceCommit })

  return {
    source: { production, openSource },
    production,
    openSource,
  }
}

function parseArguments(argumentsList) {
  const options = {}
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index]
    if (!argument.startsWith('--')) continue
    options[argument.slice(2)] = argumentsList[index + 1]
    index += 1
  }
  return options
}

function writeJson(path, value) {
  const absolutePath = resolve(path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  const temporaryPath = `${absolutePath}.tmp`
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`)
  renameSync(temporaryPath, absolutePath)
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  const required = ['production-root', 'production-commit', 'opensource-root', 'production-output', 'opensource-output', 'allowlist']
  const missing = required.filter((key) => !options[key])
  if (missing.length > 0) {
    throw new Error(`必須引数がありません: ${missing.map((key) => `--${key}`).join(', ')}`)
  }

  const snapshot = collectSnapshot({
    productionRoot: resolve(options['production-root']),
    productionCommit: options['production-commit'],
    openSourceRoot: resolve(options['opensource-root']),
  })

  writeJson(options['production-output'], snapshot.production)
  writeJson(options['opensource-output'], snapshot.openSource)
  writeJson(options.allowlist, {
    version: 1,
    allowedPaths: snapshot.openSource.files.included.filter((path) => path.startsWith('data/')),
    excludedPaths: {
      environment: snapshot.openSource.files.excluded.filter((path) => /^\.env(?:\.|$)/.test(path)),
      supabase: snapshot.openSource.files.excluded.filter((path) => path === 'supabase' || path.startsWith('supabase/')),
      deployment: snapshot.openSource.files.excluded.filter((path) => /(?:^|\/)(?:deploy|deployment|vercel|netlify)(?:\/|\.|$)/i.test(path)),
      dirty: getDirtyFiles(resolve(options['opensource-root'])),
    },
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main()
