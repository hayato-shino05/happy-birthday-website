'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTimeUntilBirthday } from '@/lib/utils/birthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

// カウントダウンタイマーコンポーネント（洗練された木目・和モダン調のタイルフリップデザイン）
export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })
  const { t } = useLanguage()

  // クライアント側でのみ時間計算を実行しハイドレーションの不整合を防止
  useEffect(() => {
    setMounted(true)
    setTimeLeft(getTimeUntilBirthday(targetDate))
  }, [targetDate])

  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(() => {
      const newTimeLeft = getTimeUntilBirthday(targetDate)
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.isExpired && onComplete) {
        onComplete()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete, mounted])

  if (!mounted) {
    return (
      <div className="flex justify-center items-center gap-2 sm:gap-4 flex-nowrap">
        <TimeUnitPlaceholder label={t('days')} />
        <TimeSeparator />
        <TimeUnitPlaceholder label={t('hours')} />
        <TimeSeparator />
        <TimeUnitPlaceholder label={t('minutes')} />
        <TimeSeparator />
        <TimeUnitPlaceholder label={t('seconds')} />
      </div>
    )
  }

  if (timeLeft.isExpired) {
    return null
  }

  return (
    <div className="flex justify-center items-center gap-1.5 sm:gap-3 md:gap-4 flex-nowrap">
      <TimeUnit value={timeLeft.days} label={t('days')} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.hours} label={t('hours')} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.minutes} label={t('minutes')} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.seconds} label={t('seconds')} isSeconds />
    </div>
  )
}

function TimeSeparator() {
  return (
    <div className="flex flex-col gap-1.5 justify-center pb-6 opacity-40">
      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#854D27]" />
      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#854D27]" />
    </div>
  )
}

interface TimeUnitProps {
  value: number
  label: string
  isSeconds?: boolean
}

function TimeUnit({ value, label, isSeconds = false }: TimeUnitProps) {
  const formattedValue = String(value).padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative group flex items-center justify-center rounded-2xl transition-transform duration-200"
        style={{
          background: 'linear-gradient(145deg, #9C5D33 0%, #76411E 100%)',
          boxShadow: '0 8px 20px -4px rgba(44, 24, 16, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
          minWidth: '58px',
          width: 'clamp(58px, 14vw, 84px)',
          height: 'clamp(62px, 15vw, 88px)',
          padding: '0 4px',
        }}
      >
        {/* 上部微細ハイライト */}
        <div
          className="absolute top-0 inset-x-0 h-1/2 rounded-t-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        />

        {/* 中央フリップライン（精巧な木製時計のディテール） */}
        <div
          className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 80%, transparent 100%)',
          }}
        />

        {/* 数値アニメーション表示 */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ opacity: 0, y: isSeconds ? -6 : 0, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isSeconds ? 6 : 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 font-bold text-white tracking-wider"
            style={{
              fontFamily: 'var(--font-heading), ui-sans-serif, system-ui',
              fontSize: 'clamp(1.4rem, 3.8vw, 2.3rem)',
              fontVariantNumeric: 'tabular-nums',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.35)',
            }}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* 単位ラベル */}
      <span
        className="text-[0.7rem] sm:text-xs font-bold tracking-wider text-[#854D27] uppercase"
        style={{
          fontFamily: 'var(--font-body)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function TimeUnitPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, #9C5D33 0%, #76411E 100%)',
          boxShadow: '0 8px 20px -4px rgba(44, 24, 16, 0.3)',
          minWidth: '58px',
          width: 'clamp(58px, 14vw, 84px)',
          height: 'clamp(62px, 15vw, 88px)',
        }}
      >
        <span
          className="font-bold text-white/80"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(1.4rem, 3.8vw, 2.3rem)',
          }}
        >
          --
        </span>
      </div>
      <span className="text-[0.7rem] sm:text-xs font-bold tracking-wider text-[#854D27] uppercase">
        {label}
      </span>
    </div>
  )
}
