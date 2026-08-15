import { describe, expect, it } from 'vitest'
import { normalizeLocale, resolveLocale, translate } from '@/lib/i18n/resolveLocale'
import type { TranslationKey } from '@/lib/i18n/types'

const availableLocales = ['en', 'ja'] as const

describe('locale resolution', () => {
  it('falls back explicitly for unsupported locales', () => {
    expect(resolveLocale('fr-FR', availableLocales, 'ja')).toEqual({
      locale: 'ja',
      usedFallback: true,
    })
  })

  it('normalizes locale aliases to their primary language', () => {
    expect(normalizeLocale('fr-FR')).toBe('fr')
    expect(normalizeLocale('JA-jp')).toBe('ja')
    expect(resolveLocale('ja', availableLocales, 'ja')).toEqual({
      locale: 'ja',
      usedFallback: false,
    })
  })

  it('normalizes BCP-47 aliases to canonical short locales', () => {
    expect(resolveLocale('JA-jp', availableLocales, 'ja')).toEqual({
      locale: 'ja',
      usedFallback: false,
    })
    expect(resolveLocale('en-US', availableLocales, 'ja')).toEqual({
      locale: 'en',
      usedFallback: false,
    })
  })

  it('uses the explicit default locale for fallback', () => {
    expect(translate('fr-FR', 'loading' as TranslationKey, 'en')).toBe('Loading...')
  })

  it('does not turn a missing translation into an empty string', () => {
    expect(translate('ja', 'missing.key' as TranslationKey, 'ja')).toBe('missing.key')
  })
})
