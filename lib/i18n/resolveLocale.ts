import { localePacks } from '@/data/generated/locales'
import type { Language, Locale, TranslationKey } from './types'

export interface LocaleResolution {
  locale: string
  usedFallback: boolean
}

type TranslationPack = {
  locale: string
  translations: Readonly<Record<string, string>>
}

const LEGACY_LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  ja: 'ja-JP',
}

export function normalizeLocale(locale: string): string {
  return LEGACY_LOCALE_MAP[locale.toLowerCase() as Language] ?? locale
}

export function resolveLocale(
  requestedLocale: string,
  availableLocales: readonly string[],
  defaultLocale: string,
): LocaleResolution {
  const normalizedRequested = normalizeLocale(requestedLocale)
  const normalizedDefault = normalizeLocale(defaultLocale)
  const exactLocale = availableLocales.find((locale) => locale === normalizedRequested)
  if (exactLocale) return { locale: exactLocale, usedFallback: false }

  const fallbackLocale = availableLocales.find((locale) => locale === normalizedDefault)
  if (!fallbackLocale) {
    throw new Error(`既定 locale が利用できません: ${defaultLocale}`)
  }
  return { locale: fallbackLocale, usedFallback: true }
}

export function validateTranslationPacks(packs: readonly TranslationPack[]): void {
  if (packs.length === 0) throw new Error('translation packs must not be empty')

  const seenLocales = new Set<string>()
  const canonicalKeys = Object.keys(packs[0].translations).sort()
  for (const pack of packs) {
    if (seenLocales.has(pack.locale)) throw new Error(`duplicate locale: ${pack.locale}`)
    seenLocales.add(pack.locale)
    const keys = Object.keys(pack.translations).sort()
    if (JSON.stringify(keys) !== JSON.stringify(canonicalKeys)) {
      throw new Error(`translation keys do not match: ${pack.locale}`)
    }
    if (keys.some((key) => pack.translations[key].length === 0)) {
      throw new Error(`translation values must not be empty: ${pack.locale}`)
    }
  }
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) return value
  return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    params[key] === undefined ? match : String(params[key]),
  )
}

export function translate(
  locale: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  const packs: readonly TranslationPack[] = localePacks
  const requested = normalizeLocale(locale)
  const defaultLocale = packs.find((pack) => pack.locale === 'ja-JP')?.locale ?? packs[0]?.locale
  const primary = packs.find((pack) => pack.locale === requested)
  const fallback = defaultLocale ? packs.find((pack) => pack.locale === defaultLocale) : undefined
  const value = primary?.translations[key] ?? fallback?.translations[key]
  return interpolate(value ?? key, params)
}

export type { Language, Locale, TranslationKey }
