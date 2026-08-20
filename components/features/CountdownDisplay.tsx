'use client'

import { motion } from 'framer-motion'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { CountdownTimer } from './CountdownTimer'
import { Sparkles, Calendar } from 'lucide-react'

// カウントダウンカードコンポーネント（洗練された日本の美意識と温かみのあるデザイン）
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
        <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-[#D4B08C]/30 text-center shadow-lg">
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
      <div
        className="relative w-full max-w-[620px] rounded-[28px] overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255, 252, 248, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(212, 176, 140, 0.45)',
          boxShadow: '0 20px 50px -12px rgba(44, 24, 16, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          padding: '36px 32px 32px',
        }}
      >
        {/* 上部バッジ：次の記念日 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase"
            style={{
              background: 'rgba(133, 77, 39, 0.08)',
              color: '#854D27',
              border: '1px solid rgba(133, 77, 39, 0.15)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4B08C]" />
            {language === 'ja' ? '次の記念日' : 'Next Celebration'}
          </span>
          {targetDateStr && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-[#854D27]/80"
              style={{
                background: 'rgba(255, 255, 255, 0.6)',
                border: '1px solid rgba(212, 176, 140, 0.25)',
              }}
            >
              <Calendar className="w-3 h-3 text-[#854D27]/70" />
              {targetDateStr}
            </span>
          )}
        </div>

        {/* メインタイトル */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-tight leading-snug mb-7 text-[#2C1810]"
          style={{
            fontFamily: 'var(--font-heading)',
          }}
        >
          {language === 'ja' ? (
            <>
              <span className="text-[#854D27]">{personName}</span>
              <span className="font-normal text-xl sm:text-2xl text-[#5C3A21] ml-1">さんの誕生日まで</span>
            </>
          ) : (
            <>
              <span className="font-normal text-xl sm:text-2xl text-[#5C3A21]">Countdown to </span>
              <span className="text-[#854D27]">{personName}&apos;s Birthday</span>
            </>
          )}
        </motion.h1>

        {/* カウントダウンタイマー本体 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="py-1"
        >
          <CountdownTimer targetDate={nextBirthday.date} />
        </motion.div>

        {/* 残り日数フッターピル */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-xs"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#854D27',
              border: '1px solid rgba(212, 176, 140, 0.35)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#3FCF8E] animate-pulse" />
            {language === 'ja'
              ? `あと ${nextBirthday.daysUntil} 日のお祝い`
              : `${nextBirthday.daysUntil} days left`}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
