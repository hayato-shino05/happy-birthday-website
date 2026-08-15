import { localePacks, locales } from '@/data/generated/locales'

export type Locale = (typeof locales)[number]
export type TranslationKey = keyof (typeof localePacks)[number]['translations']
export type TranslationDictionary = Readonly<Record<TranslationKey, string>>
export type Language = 'en' | 'ja'
