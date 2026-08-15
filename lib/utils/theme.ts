import { festivalPacks } from '@/data/generated/festival-packs'
import { VISUAL_THEME_KEYS } from '@/config/visualThemes'
import { THEMES, type ThemeConfig } from '@/config/themes'
import { evaluateFestivalPacks } from '@/lib/festivals/evaluator'
import { getLegacyFestivalDates, getLegacySeasonMonths } from '@/lib/festivals/legacyAdapter'
import type { ThemeName } from '@/types'

/**
 * 指定された日付で祭りがアクティブかどうかを確認
 */
export function isFestivalActive(festivalKey: string, month: number, date: number): boolean {
  const festivalConfig = getLegacyFestivalDates()[festivalKey]
  if (!festivalConfig) return false

  if (Array.isArray(festivalConfig)) {
    return festivalConfig.some(
      (range) => month === range.month && date >= range.startDate && date <= range.endDate,
    )
  }

  return month === festivalConfig.month && date >= festivalConfig.startDate && date <= festivalConfig.endDate
}

/**
 * 現在の日付に基づいて季節と祭りを検出
 */
export function detectSeasonAndFestival(currentDate: Date = new Date()): ThemeName {
  const activeFestival = evaluateFestivalPacks(festivalPacks, currentDate).find(
    ({ pack, status }) =>
      status === 'active' &&
      pack.themeKey !== undefined &&
      (VISUAL_THEME_KEYS as readonly string[]).includes(pack.themeKey),
  )
  if (activeFestival?.pack.themeKey) return activeFestival.pack.themeKey as ThemeName

  const month = currentDate.getMonth() + 1
  const seasonMonths = getLegacySeasonMonths()
  if (seasonMonths.winter.includes(month)) return 'winter'
  if (seasonMonths.spring.includes(month)) return 'spring'
  if (seasonMonths.summer.includes(month)) return 'summer'
  if (seasonMonths.autumn.includes(month)) return 'autumn'

  return 'spring'
}

/**
 * テーマ設定を取得
 */
export function getThemeConfig(themeName: ThemeName): ThemeConfig {
  return THEMES[themeName] || THEMES.spring
}

/**
 * テーマのTailwind gradient classを取得
 */
export function getThemeGradient(themeName: ThemeName): string {
  const theme = getThemeConfig(themeName)
  return theme.gradient
}

/**
 * テーマの表示名を取得
 */
export function getThemeDisplayName(themeName: ThemeName, language: 'en' | 'ja'): string {
  const theme = getThemeConfig(themeName)
  return theme.displayName[language]
}

/**
 * テーマがダークモードかどうかを判定
 */
export function isThemeDark(themeName: ThemeName): boolean {
  return themeName === 'halloween'
}
