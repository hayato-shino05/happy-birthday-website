// テーマユーティリティ関数
import { FESTIVAL_DATES, SEASON_MONTHS, THEMES, type ThemeConfig } from '@/config/themes'
import type { ThemeName } from '@/types'

/**
 * 指定された日付で祭りがアクティブかどうかを確認
 */
export function isFestivalActive(festivalKey: string, month: number, date: number): boolean {
  const festivalConfig = FESTIVAL_DATES[festivalKey]
  if (!festivalConfig) return false

  // 複数月にまたがる祭りの配列を処理
  if (Array.isArray(festivalConfig)) {
    return festivalConfig.some(
      (range) => month === range.month && date >= range.startDate && date <= range.endDate
    )
  }

  // 単一月の祭り期間を処理
  return (
    month === festivalConfig.month && date >= festivalConfig.startDate && date <= festivalConfig.endDate
  )
}

/**
 * 現在の日付に基づいて季節と祭りを検出
 */
export function detectSeasonAndFestival(currentDate: Date = new Date()): ThemeName {
  const month = currentDate.getMonth() + 1 // 月は1-12
  const date = currentDate.getDate()

  // 国際的な祭りと日本の祭りを優先して判定する
  const festivals: ThemeName[] = [
    'christmas',
    'halloween',
    'hanami',
    'obon',
    'tsukimi',
    'tanabata',
    'shogatsu',
    'kodomo',
    'bunka',
  ]

  for (const festival of festivals) {
    if (isFestivalActive(festival, month, date)) {
      return festival
    }
  }

  // 祭りがない場合は季節で判定
  // 正確性を確保するため特定の順序でチェック
  if (SEASON_MONTHS.winter.includes(month)) return 'winter'
  if (SEASON_MONTHS.spring.includes(month)) return 'spring'
  if (SEASON_MONTHS.summer.includes(month)) return 'summer'
  if (SEASON_MONTHS.autumn.includes(month)) return 'autumn'

  return 'spring' // デフォルト
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
