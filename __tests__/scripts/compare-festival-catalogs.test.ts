import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const script = resolve(process.cwd(), 'scripts/compare-festival-catalogs.mjs')

const pack = (id: string, locale = 'ja') => ({
  id,
  country: 'jp',
  locale,
  category: 'festival',
  name: id,
  description: id,
  dateRule: {
    calendar: 'gregorian',
    recurrence: 'yearly',
    ranges: [{ month: 1, startDay: 1, endDay: 3 }],
    timeZone: 'Asia/Tokyo',
  },
  enabled: true,
  status: 'enabled',
  priority: 10,
  themeKey: 'theme',
})

describe('compare-festival-catalogs CLI', () => {
  it('writes deterministic categorized JSON without a timestamp', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    const productionPath = join(directory, 'production.json')
    const openSourcePath = join(directory, 'opensource.json')
    const outputPath = join(directory, 'report.json')
    writeFileSync(productionPath, JSON.stringify({ catalog: [pack('shared')] }))
    writeFileSync(openSourcePath, JSON.stringify({ catalog: [pack('shared')] }))

    execFileSync(process.execPath, [
      script,
      '--production', productionPath,
      '--opensource', openSourcePath,
      '--output', outputPath,
    ])

    const report = JSON.parse(readFileSync(outputPath, 'utf8'))
    expect(report).toEqual({
      shared: [{ id: 'shared' }],
      productionOnly: [],
      openSourceOnly: [],
      sameDateDifferentContent: [],
      duplicateIds: [],
      calendarRuleMismatch: [],
      localeCoverageMismatch: [],
      themeReferenceMismatch: [],
    })
    expect(JSON.stringify(report)).not.toContain('timestamp')
  })

  it('rejects ID-only snapshots instead of reporting empty parity', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    const productionPath = join(directory, 'production.json')
    const openSourcePath = join(directory, 'opensource.json')
    const outputPath = join(directory, 'report.json')
    writeFileSync(productionPath, JSON.stringify({ events: ['shared'] }))
    writeFileSync(openSourcePath, JSON.stringify({ events: [pack('shared')] }))

    expect(() => execFileSync(process.execPath, [
      script,
      '--production', productionPath,
      '--opensource', openSourcePath,
      '--output', outputPath,
    ])).toThrow(/malformed festival pack/)
  })
})
