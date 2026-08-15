import { describe, expect, it } from 'vitest'
import { localePacks, locales, translationKeys } from '@/data/generated/locales'
import { validateTranslationPacks } from '@/lib/i18n/resolveLocale'

const keys = (value: Record<string, string>) => Object.keys(value).sort()

describe('translation parity', () => {
  it('discovers both locale packs from the generated manifest', () => {
    expect(locales).toEqual(['en-US', 'ja-JP'])
    expect(localePacks).toHaveLength(2)
  })

  it('keeps every locale on the same canonical key set', () => {
    const canonicalKeys = [...translationKeys].sort()
    for (const pack of localePacks) expect(keys(pack.translations)).toEqual(canonicalKeys)
  })

  it('rejects duplicate locales and mismatched key sets', () => {
    expect(() => validateTranslationPacks([
      { locale: 'ja-JP', translations: { loading: '読み込み中' } },
      { locale: 'ja-JP', translations: { loading: '読み込み中' } },
    ])).toThrow('duplicate locale')

    expect(() => validateTranslationPacks([
      { locale: 'ja-JP', translations: { loading: '読み込み中' } },
      { locale: 'en-US', translations: { error: 'Error' } },
    ])).toThrow('translation keys')
  })
})
