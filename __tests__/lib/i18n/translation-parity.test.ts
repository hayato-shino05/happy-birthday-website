import { describe, expect, it } from 'vitest'
import { localePacks, locales, translationKeys } from '@/data/generated/locales'
import { validateTranslationPacks } from '@/lib/i18n/resolveLocale'

const keys = (value: Record<string, string>) => Object.keys(value).sort()

describe('translation parity', () => {
  it('discovers both locale packs from the generated manifest', () => {
    expect(locales).toEqual(['en', 'ja'])
    expect(localePacks).toHaveLength(2)
  })

  it('keeps every locale on the same canonical key set', () => {
    const canonicalKeys = [...translationKeys].sort()
    for (const pack of localePacks) expect(keys(pack.translations)).toEqual(canonicalKeys)
  })

  it('rejects duplicate locales and mismatched key sets', () => {
    expect(() => validateTranslationPacks([
      { locale: 'ja', translations: { loading: '読み込み中' } },
      { locale: 'ja', translations: { loading: '読み込み中' } },
    ])).toThrow('duplicate locale')

    const completeTranslations: Record<string, string> = { ...localePacks[0].translations }
    const reorderedTranslations = Object.fromEntries(
      [...translationKeys].reverse().map((key) => [key, completeTranslations[key]]),
    )
    expect(() => validateTranslationPacks([
      { locale: 'ja', translations: completeTranslations },
      { locale: 'en', translations: reorderedTranslations },
    ])).not.toThrow()

    const missingTranslations = { ...completeTranslations }
    delete missingTranslations[translationKeys[0]]
    expect(() => validateTranslationPacks([
      { locale: 'ja', translations: completeTranslations },
      { locale: 'en', translations: missingTranslations },
    ])).toThrow('translation keys')

    expect(() => validateTranslationPacks([
      { locale: 'ja', translations: completeTranslations },
      { locale: 'en', translations: { ...completeTranslations, extraKey: '余分' } },
    ])).toThrow('translation keys')
  })
})
