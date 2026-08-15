import type { Locale } from '@/lib/festivals/types'

export type GeneratedLocalePack = {
  readonly locale: Locale
  readonly translations: Readonly<Record<string, string>>
}

export const localePacks = [] as const satisfies readonly GeneratedLocalePack[]

export const locales = [] as const satisfies readonly Locale[]
