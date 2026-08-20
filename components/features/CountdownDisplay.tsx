'use client'

import { motion } from 'framer-motion'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { CountdownTimer } from './CountdownTimer'
import { Calendar } from 'lucide-react'

// ヴィンテージ・スクラップブック風のカウントダウンカードコンポーネント（半透明グラス＆高コントラスト視認性向上版）
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
        <div className="p-8 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 text-center shadow-xl">
          <p className="text-lg font-bold text-[#4A2400]">
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
      {/* 半透明スクラップブック台紙（背景動画やパーティクルを透かしつつ、文字の視認性を確保） */}
      <div
        className="relative w-full max-w-[760px] rounded-3xl transition-all duration-300 flex flex-col items-center select-none"
        style={{
          background: 'rgba(253, 249, 233, 0.45)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1.5px solid rgba(255, 255, 255, 0.65)',
          boxShadow: '0 25px 60px -15px rgba(44, 24, 16, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 0 20px rgba(255, 255, 255, 0.3)',
          padding: '38px 24px 34px',
        }}
      >
        {/* 右上のクリップとヴィンテージチケット装飾 */}
        <div className="absolute -top-3.5 right-6 sm:right-10 transform rotate-6 z-20 pointer-events-none">
          {/* クリップ */}
          <div
            className="w-4 h-10 border-2 rounded-full absolute -top-2 left-3 opacity-80"
            style={{ borderColor: '#6E3902' }}
          />
          {/* チケットバッジ */}
          <div
            className="px-3.5 py-1 rounded-xs text-[#522500] text-[11px] font-extrabold tracking-widest shadow-md transform -rotate-3 uppercase"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(215, 195, 181, 0.9)',
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
              className="text-xs font-black tracking-widest text-[#522500] uppercase"
              style={{
                fontFamily: 'var(--font-heading)',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.9)',
              }}
            >
              OMOIDE BAKO
            </span>
            {targetDateStr && (
              <span
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-[#4A2400] shadow-xs"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(215, 195, 181, 0.7)',
                }}
              >
                <Calendar className="w-3 h-3 text-[#6E3902]" />
                {targetDateStr}
              </span>
            )}
          </div>

          {/* メインお祝いタイトル（背景が透けてもくっきり読めるハイコントラスト影を付与） */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2C1400] tracking-tight relative mt-1"
            style={{
              fontFamily: 'var(--font-heading)',
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {language === 'ja' ? (
              <>
                <span className="text-[#6E3902]">{personName}</span>
                <span className="font-extrabold text-xl sm:text-2xl text-[#381A00] ml-1">さんの誕生日まで</span>
              </>
            ) : (
              <>
                <span className="font-extrabold text-xl sm:text-2xl text-[#381A00]">Countdown to </span>
                <span className="text-[#6E3902]">{personName}&apos;s Birthday</span>
              </>
            )}
            {/* タイトル下部の装飾アクセントライン */}
            <div className="w-20 h-0.5 mx-auto mt-2.5 rounded-full bg-[#BEAB4E]/80 shadow-xs" />
          </h1>
        </div>

        {/* ポラロイド風カウントダウンタイマー */}
        <div className="w-full my-2">
          <CountdownTimer targetDate={nextBirthday.date} />
        </div>

        {/* 下部：残り日数ステータス（見やすいクッキリとしたピルデザイン） */}
        <div className="mt-7 flex justify-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wide shadow-md"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              color: '#4A2400',
              border: '1px solid rgba(215, 195, 181, 0.8)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.8)',
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            {language === 'ja'
              ? `あと ${nextBirthday.daysUntil} 日の特別な瞬間`
              : `${nextBirthday.daysUntil} days until celebration`}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
