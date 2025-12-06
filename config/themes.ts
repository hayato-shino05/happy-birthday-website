// テーマ設定ファイル
import type { ThemeName } from '@/types'

export interface ThemeConfig {
  name: ThemeName
  displayName: {
    en: string
    ja: string
  }
  colors: {
    primary: string
    secondary: string
    background: string
    text: string
    accent: string
  }
  gradient: string
  videoUrl?: string
  fallbackVideoUrl?: string
  effects: ThemeEffect[]
}

export interface ThemeEffect {
  type: 'fallingPetals' | 'fallingLeaves' | 'fallingSnow' | 'floatingLanterns' | 'fireworks' | 'heatWave' | 'sunGlare' | 'christmasLights' | 'bats' | 'ghosts'
  count: number
}

export interface FestivalDate {
  month: number
  startDate: number
  endDate: number
}

// 祭りの日付設定
export const FESTIVAL_DATES: Record<string, FestivalDate | FestivalDate[]> = {
  // 国際的な祭り
  christmas: { month: 12, startDate: 20, endDate: 25 },
  halloween: { month: 10, startDate: 28, endDate: 31 },
  hanami: [
    { month: 3, startDate: 20, endDate: 31 },
    { month: 4, startDate: 1, endDate: 30 },
    { month: 5, startDate: 1, endDate: 10 },
  ],
  obon: { month: 8, startDate: 13, endDate: 16 },
  tsukimi: [
    { month: 9, startDate: 15, endDate: 30 },
    { month: 10, startDate: 1, endDate: 15 },
  ],
  tanabata: { month: 7, startDate: 1, endDate: 7 },
  shogatsu: { month: 1, startDate: 1, endDate: 7 },
  kodomo: { month: 5, startDate: 1, endDate: 5 },
  bunka: { month: 11, startDate: 1, endDate: 7 },
}

// 月ごとの季節設定
export const SEASON_MONTHS: Record<string, number[]> = {
  winter: [12, 1],
  spring: [2, 3, 4],
  summer: [5, 6, 7, 8],
  autumn: [9, 10, 11],
}

// テーマ設定
export const THEMES: Record<ThemeName, ThemeConfig> = {
  // 季節
  spring: {
    name: 'spring',
    displayName: { en: 'Spring', ja: '春' },
    colors: {
      primary: '#E91E63',
      secondary: '#F8DDE4',
      background: '#FFF0F5',
      text: '#C2185B',
      accent: '#FF4081',
    },
    gradient: 'from-pink-100 via-rose-50 to-pink-200',
    videoUrl: '/video/spring.mp4',
    effects: [{ type: 'fallingPetals', count: 30 }],
  },
  summer: {
    name: 'summer',
    displayName: { en: 'Summer', ja: '夏' },
    colors: {
      primary: '#FF9800',
      secondary: '#FFE0B2',
      background: '#FFF8E1',
      text: '#E65100',
      accent: '#FFB74D',
    },
    gradient: 'from-orange-100 via-yellow-50 to-amber-200',
    videoUrl: '/video/summer.mp4',
    effects: [
      { type: 'heatWave', count: 1 },
      { type: 'sunGlare', count: 5 },
    ],
  },
  autumn: {
    name: 'autumn',
    displayName: { en: 'Autumn', ja: '秋' },
    colors: {
      primary: '#E2571E',
      secondary: '#F5CBA7',
      background: '#FFF3E0',
      text: '#BF360C',
      accent: '#FF7043',
    },
    gradient: 'from-orange-200 via-amber-100 to-yellow-200',
    videoUrl: '/video/autumn.mp4',
    effects: [{ type: 'fallingLeaves', count: 40 }],
  },
  winter: {
    name: 'winter',
    displayName: { en: 'Winter', ja: '冬' },
    colors: {
      primary: '#0079B0',
      secondary: '#D1E9F6',
      background: '#E3F2FD',
      text: '#01579B',
      accent: '#4FC3F7',
    },
    gradient: 'from-blue-100 via-cyan-50 to-sky-200',
    videoUrl: '/video/winter.mp4',
    effects: [{ type: 'fallingSnow', count: 50 }],
  },

  // 国際的な祭り
  christmas: {
    name: 'christmas',
    displayName: { en: 'Christmas', ja: 'クリスマス' },
    colors: {
      primary: '#D32F2F',
      secondary: '#4CAF50',
      background: '#FFEBEE',
      text: '#B71C1C',
      accent: '#81C784',
    },
    gradient: 'from-red-200 via-green-100 to-red-100',
    videoUrl: '/video/winter.mp4',
    effects: [{ type: 'christmasLights', count: 30 }],
  },
  halloween: {
    name: 'halloween',
    displayName: { en: 'Halloween', ja: 'ハロウィン' },
    colors: {
      primary: '#FF5722',
      secondary: '#4A148C',
      background: '#311B92',
      text: '#FFCCBC',
      accent: '#FF7043',
    },
    gradient: 'from-purple-900 via-orange-900 to-purple-800',
    videoUrl: '/video/autumn.mp4',
    effects: [
      { type: 'bats', count: 10 },
      { type: 'ghosts', count: 5 },
    ],
  },
  hanami: {
    name: 'hanami',
    displayName: { en: 'Cherry Blossom Festival', ja: '花見' },
    colors: {
      primary: '#E91E63',
      secondary: '#FCE4EC',
      background: '#FFF0F5',
      text: '#C2185B',
      accent: '#F48FB1',
    },
    gradient: 'from-pink-200 via-rose-100 to-pink-100',
    videoUrl: '/video/hanami.mp4',
    effects: [{ type: 'fallingPetals', count: 30 }],
  },
  obon: {
    name: 'obon',
    displayName: { en: 'Obon Festival', ja: 'お盆' },
    colors: {
      primary: '#FF5722',
      secondary: '#FFE0B2',
      background: '#FFF3E0',
      text: '#E64A19',
      accent: '#FFAB91',
    },
    gradient: 'from-orange-200 via-amber-100 to-orange-100',
    videoUrl: '/video/summer.mp4',
    effects: [{ type: 'floatingLanterns', count: 20 }],
  },
  tsukimi: {
    name: 'tsukimi',
    displayName: { en: 'Moon Viewing', ja: '月見' },
    colors: {
      primary: '#1976D2',
      secondary: '#BBDEFB',
      background: '#E3F2FD',
      text: '#0D47A1',
      accent: '#64B5F6',
    },
    gradient: 'from-blue-200 via-indigo-100 to-blue-100',
    videoUrl: '/video/autumn.mp4',
    effects: [{ type: 'fallingLeaves', count: 40 }],
  },
  tanabata: {
    name: 'tanabata',
    displayName: { en: 'Star Festival', ja: '七夕' },
    colors: {
      primary: '#7B1FA2',
      secondary: '#E1BEE7',
      background: '#F3E5F5',
      text: '#4A148C',
      accent: '#BA68C8',
    },
    gradient: 'from-purple-200 via-pink-100 to-purple-100',
    videoUrl: '/video/summer.mp4',
    effects: [
      { type: 'floatingLanterns', count: 15 },
      { type: 'fallingPetals', count: 20 },
    ],
  },
  shogatsu: {
    name: 'shogatsu',
    displayName: { en: 'Japanese New Year', ja: '正月' },
    colors: {
      primary: '#D32F2F',
      secondary: '#FFCDD2',
      background: '#FFEBEE',
      text: '#B71C1C',
      accent: '#EF5350',
    },
    gradient: 'from-red-200 via-white to-red-100',
    videoUrl: '/video/winter.mp4',
    effects: [
      { type: 'fireworks', count: 8 },
      { type: 'floatingLanterns', count: 10 },
    ],
  },
  kodomo: {
    name: 'kodomo',
    displayName: { en: "Children's Day", ja: 'こどもの日' },
    colors: {
      primary: '#1976D2',
      secondary: '#BBDEFB',
      background: '#E3F2FD',
      text: '#0D47A1',
      accent: '#64B5F6',
    },
    gradient: 'from-blue-200 via-cyan-100 to-blue-100',
    videoUrl: '/video/spring.mp4',
    effects: [{ type: 'fallingPetals', count: 25 }],
  },
  bunka: {
    name: 'bunka',
    displayName: { en: 'Culture Day', ja: '文化の日' },
    colors: {
      primary: '#E65100',
      secondary: '#FFE0B2',
      background: '#FFF3E0',
      text: '#BF360C',
      accent: '#FFB74D',
    },
    gradient: 'from-orange-200 via-amber-100 to-orange-100',
    videoUrl: '/video/autumn.mp4',
    effects: [{ type: 'fallingLeaves', count: 30 }],
  },
}

// すべてのテーマ名のリスト
export const ALL_THEME_NAMES: ThemeName[] = Object.keys(THEMES) as ThemeName[]
