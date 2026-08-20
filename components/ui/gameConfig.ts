import { IconName } from './Icon'
import type { TranslationKey } from '@/lib/i18n/types'

// ミニゲームの共通設定アイテム定義
export interface GameMenuItem {
  id: 'memoryGame' | 'puzzleGame' | 'calendar' | 'quiz'
  icon: IconName
  i18nKey: TranslationKey
  defaultLabel: string
}

export const GAME_MENU_ITEMS: GameMenuItem[] = [
  { id: 'memoryGame', icon: 'Brain', i18nKey: 'memoryGame', defaultLabel: '神経衰弱' },
  { id: 'puzzleGame', icon: 'Puzzle', i18nKey: 'puzzleGame', defaultLabel: 'パズル' },
  { id: 'calendar', icon: 'Calendar', i18nKey: 'birthdayCalendar', defaultLabel: 'カレンダー' },
  { id: 'quiz', icon: 'HelpCircle', i18nKey: 'birthdayQuiz', defaultLabel: 'クイズ' },
]
