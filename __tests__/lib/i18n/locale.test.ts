import { describe, expect, it } from 'vitest'
import { resolveLocale, translate } from '@/lib/i18n/resolveLocale'
import type { TranslationKey } from '@/lib/i18n/types'

const availableLocales = ['en-US', 'ja-JP'] as const

describe('locale resolution', () => {
  it('falls back explicitly for unsupported locales', () => {
    expect(resolveLocale('fr-FR', availableLocales, 'ja-JP')).toEqual({
      locale: 'ja-JP',
      usedFallback: true,
    })
  })

  it('normalizes legacy short locale codes', () => {
    expect(resolveLocale('ja', availableLocales, 'ja-JP')).toEqual({
      locale: 'ja-JP',
      usedFallback: false,
    })
  })

  it('does not turn a missing translation into an empty string', () => {
    expect(translate('ja-JP', 'missing.key' as TranslationKey)).toBe('missing.key')
  })
})
