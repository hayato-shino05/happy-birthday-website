import { describe, expect, it } from 'vitest'
import { localePacks, locales, translationKeys } from '@/data/generated/locales'
import { translate, validateTranslationPacks } from '@/lib/i18n/resolveLocale'

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

  it('covers recently converted keys in both locales with ja fallback', () => {
    const convertedKeys = [
      'attachPhotoOptional',
      'audioMessagesLoadError',
      'cameraMicPermissionError',
      'capsuleMessagePlaceholder',
      'capsuleUnlocked',
      'countdownHeading',
      'countdownHide',
      'countdownHideTitle',
      'countdownShow',
      'createdBy',
      'daysUntilCelebration',
      'flashbackPhotoAlt',
      'frameCategoryClassic',
      'frameCategoryCute',
      'frameCategoryElegant',
      'frameCategoryTrending',
      'fromSender',
      'giftSendError',
      'giftsLoadError',
      'iconsBy',
      'mediaAlt',
      'mediaLoadError',
      'messagesLoadError',
      'microphonePermissionError',
      'mobileNavDock',
      'monthsShort',
      'omikuji3dLoading',
      'omikujiBlessingLabel',
      'omikujiBondLabel',
      'omikujiCylinderHint',
      'omikujiHealthLabel',
      'omikujiLuckyNumber',
      'omikujiNumber',
      'omikujiPoemLabel',
      'omikujiTodayFortune',
      'omikujiWishLabel',
      'passwordHide',
      'passwordShow',
      'postsLoadError',
      'quizBirthdayMonthQuestion',
      'quizWhoHasBirthday',
      'recentMessages',
      'recipientExamplePlaceholder',
      'recipientOptional',
      'recordingStartError',
      'sealedSuccess',
      'selectPhoto',
      'sealNewCapsule',
      'timeCapsuleEmptyDesc',
      'timeCapsulePhotoAlt',
      'videoMessagesLoadError',
      'viewCapsules',
    ] as const
    for (const key of convertedKeys) {
      for (const pack of localePacks) {
        expect(pack.translations[key]).toBeTruthy()
        expect(pack.translations[key]).not.toBe(key)
      }
      expect(translate('fr-FR', key, 'ja')).toBe(localePacks.find((p) => p.locale === 'ja')?.translations[key])
    }
  })

  it('keeps placeholder sets consistent between locales for every key', () => {
    const extract = (value: string): string[] =>
      [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()
    const [enPack, jaPack] = localePacks
    for (const key of translationKeys) {
      const enPlaceholders = extract(enPack.translations[key])
      const jaPlaceholders = extract(jaPack.translations[key])
      expect(enPlaceholders).toEqual(jaPlaceholders)
    }
  })
})

describe('timeCapsuleSealed locale regression', () => {
  const params = { date: '8/21/2027' }
  const jpPattern = /[\u3040-\u30ff\u4e00-\u9faf]/

  it('keeps the {date} placeholder in both locales', () => {
    expect(translate('ja', 'timeCapsuleSealed', 'ja')).toContain('{date}')
    expect(translate('en', 'timeCapsuleSealed', 'en')).toContain('{date}')
  })

  it('renders the Japanese suffix for ja with the date preserved', () => {
    const out = translate('ja', 'timeCapsuleSealed', 'ja', params)
    expect(out).toContain(params.date)
    expect(out).toMatch(jpPattern)
  })

  it('renders natural English without any Japanese suffix leak', () => {
    const out = translate('en', 'timeCapsuleSealed', 'en', params)
    expect(out).toBe('Sealed until 8/21/2027')
    expect(out).not.toMatch(jpPattern)
  })

  it('falls back to the ja rendering for unsupported locales', () => {
    const out = translate('fr-FR', 'timeCapsuleSealed', 'ja', params)
    expect(out).toContain(params.date)
    expect(out).toMatch(jpPattern)
  })
})
