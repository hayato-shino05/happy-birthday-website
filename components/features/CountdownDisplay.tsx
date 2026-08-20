'use client'

import { motion } from 'framer-motion'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { CountdownTimer } from './CountdownTimer'
import { Calendar } from 'lucide-react'

// ヴィンテージ・スクラップブック風のカウントダウンカードコンポーネント（想い出箱デザイン）
export function CountdownDisplay() {
  const { nextBirthday, isLoading } = useNextBirthday()
  const { language, t } = useLanguage()
  const { currentTheme } = useThemeContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent"
          style={{ borderColor: 'var(--theme-primary)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!nextBirthday) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="p-8 rounded-2xl bg-[#FDF9E9]/90 backdrop-blur-md border border-[#D7C3B5] text-center shadow-lg">
          <p className="text-lg font-medium text-[#854D27]">
            {t('noBirthdayData')}
          </p>
        </div>
      </div>
    )
  }

  const personName = nextBirthday.person.name
  const targetDateStr = nextBirthday.date ? `${nextBirthday.date.getMonth() + 1}月${nextBirthday.date.getDate()}日` : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`countdown-card-wrapper theme-${currentTheme} w-full flex justify-center px-4`}
    >
      {/* スクラップブック・台紙カード */}
      <div
        className="relative w-full max-w-[760px] rounded-2xl transition-all duration-300 flex flex-col items-center select-none"
        style={{
          background: 'linear-gradient(135deg, rgba(253, 249, 233, 0.92) 0%, rgba(242, 238, 222, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(215, 195, 181, 0.7)',
          boxShadow: '0 20px 50px -15px rgba(74, 36, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.04)',
          padding: '40px 24px 36px',
        }}
      >
        {/* 右上のクリップとヴィンテージチケット装飾 */}
        <div className="absolute -top-3.5 right-6 sm:right-10 transform rotate-6 z-20 pointer-events-none">
          {/* クリップ */}
          <div
            className="w-4 h-10 border-2 rounded-full absolute -top-2 left-3 opacity-75"
            style={{ borderColor: '#867466' }}
          />
          {/* チケットバッジ */}
          <div
            className="px-3 py-1 rounded-xs text-[#895033] text-[11px] font-bold tracking-widest shadow-xs transform -rotate-3 uppercase"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(215, 195, 181, 0.8)',
              fontFamily: 'var(--font-heading), monospace',
            }}
          >
            HAPPY CELEBRATION
          </div>
        </div>

        {/* 上部ヘッダー：想い出箱タイトル & 日付 */}
        <div className="flex flex-col items-center gap-1.5 mb-6 text-center">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold tracking-widest text-[#895033] uppercase"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              OMOIDE BAKO
            </span>
            {targetDateStr && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-[#784327]"
                style={{
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(215, 195, 181, 0.5)',
                }}
              >
                <Calendar className="w-3 h-3 text-[#895033]" />
                {targetDateStr}
              </span>
            )}
          </div>

          {/* メインお祝いタイトル */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#4A2400] tracking-tight relative mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {language === 'ja' ? (
              <>
                <span className="text-[#895033]">{personName}</span>
                <span className="font-normal text-xl sm:text-2xl text-[#52443A] ml-1">さんの誕生日まで</span>
              </>
            ) : (
              <>
                <span className="font-normal text-xl sm:text-2xl text-[#52443A]">Countdown to </span>
                <span className="text-[#895033]">{personName}&apos;s Birthday</span>
              </>
            )}
            {/* タイトル下部の装飾アクセントライン */}
            <div className="w-20 h-0.5 mx-auto mt-2 rounded-full bg-[#BEAB4E]/60" />
          </h1>
        </div>

        {/* ポラロイド風カウントダウンタイマー */}
        <div className="w-full my-2">
          <CountdownTimer targetDate={nextBirthday.date} />
        </div>

        {/* 下部：残り日数ステータス */}
        <div className="mt-7 flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-xs"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              color: '#895033',
              border: '1px solid rgba(215, 195, 181, 0.6)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#3FCF8E] animate-pulse" />
            {language === 'ja'
              ? `あと ${nextBirthday.daysUntil} 日の特別な瞬間`
              : `${nextBirthday.daysUntil} days until celebration`}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
