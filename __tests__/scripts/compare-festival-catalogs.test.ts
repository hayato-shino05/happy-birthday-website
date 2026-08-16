import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
    try {
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
        runtimeContractMismatch: [],
      })
      expect(JSON.stringify(report)).not.toContain('timestamp')
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('rejects ID-only snapshots instead of reporting empty parity', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    try {
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
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('classifies runtime drift with the same category as the library contract', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    try {
      const productionPath = join(directory, 'production.json')
      const openSourcePath = join(directory, 'opensource.json')
      const outputPath = join(directory, 'report.json')
      writeFileSync(productionPath, JSON.stringify({
        catalog: [pack('runtime-diff'), pack('identity-diff', 'ja')],
      }))
      writeFileSync(openSourcePath, JSON.stringify({
        catalog: [
          { ...pack('runtime-diff'), enabled: false },
          { ...pack('identity-diff', 'ja'), country: 'us' },
        ],
      }))

      execFileSync(process.execPath, [
        script,
        '--production', productionPath,
        '--opensource', openSourcePath,
        '--output', outputPath,
      ])

      const report = JSON.parse(readFileSync(outputPath, 'utf8'))
      expect(report.runtimeContractMismatch).toEqual([{ id: 'runtime-diff' }])
      expect(report.sameDateDifferentContent).toEqual([{ id: 'identity-diff' }])
      expect(report.shared).toEqual([])
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('reports independent mismatch categories for one id', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    try {
      const productionPath = join(directory, 'production.json')
      const openSourcePath = join(directory, 'opensource.json')
      const outputPath = join(directory, 'report.json')
      writeFileSync(productionPath, JSON.stringify({
        catalog: [pack('multi-diff', 'ja')],
      }))
      writeFileSync(openSourcePath, JSON.stringify({
        catalog: [{
          ...pack('multi-diff', 'ja'),
          country: 'us',
          name: 'Open source name',
          themeKey: 'open-source-theme',
          enabled: false,
          dateRule: {
            calendar: 'gregorian',
            recurrence: 'year-specific',
            dates: { '2026': [{ month: 1, day: 1 }] },
            timeZone: 'Asia/Tokyo',
          },
        }],
      }))

      execFileSync(process.execPath, [
        script,
        '--production', productionPath,
        '--opensource', openSourcePath,
        '--output', outputPath,
      ])

      const report = JSON.parse(readFileSync(outputPath, 'utf8'))
      expect(report.calendarRuleMismatch).toEqual([{ id: 'multi-diff' }])
      expect(report.themeReferenceMismatch).toEqual([{ id: 'multi-diff' }])
      expect(report.runtimeContractMismatch).toEqual([{ id: 'multi-diff' }])
      expect(report.sameDateDifferentContent).toEqual([{ id: 'multi-diff' }])
      expect(report.shared).toEqual([])
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('rejects packs outside the strict FestivalPack contract', () => {
    const directory = mkdtempSync(join(tmpdir(), 'festival-parity-'))
    try {
      const productionPath = join(directory, 'production.json')
      const openSourcePath = join(directory, 'opensource.json')
      const outputPath = join(directory, 'report.json')
      writeFileSync(productionPath, JSON.stringify({ catalog: [{ ...pack('broken'), locale: 'fr' }] }))
      writeFileSync(openSourcePath, JSON.stringify({ catalog: [pack('broken')] }))

      expect(() => execFileSync(process.execPath, [
        script,
        '--production', productionPath,
        '--opensource', openSourcePath,
        '--output', outputPath,
      ])).toThrow(/malformed festival pack/)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })
})
