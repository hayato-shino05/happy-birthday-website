'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTimeUntilBirthday } from '@/lib/utils/birthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

// ポラロイド風ミニフォトカードによるカウントダウンタイマーコンポーネント
export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })
  const { t } = useLanguage()

  // クライアント側でのみ時間計算を実行
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-items-center max-w-[640px] mx-auto">
        <PolaroidPlaceholder label={t('days')} tapeStyle="tape-1" />
        <PolaroidPlaceholder label={t('hours')} tapeStyle="tape-2" />
        <PolaroidPlaceholder label={t('minutes')} tapeStyle="tape-3" />
        <PolaroidPlaceholder label={t('seconds')} tapeStyle="tape-4" />
      </div>
    )
  }

  if (timeLeft.isExpired) {
    return null
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 justify-items-center max-w-[640px] mx-auto">
      <PolaroidUnit
        value={timeLeft.days}
        label={t('days')}
        tapeStyle="tape-1"
        hoverRotate={1}
      />
      <PolaroidUnit
        value={timeLeft.hours}
        label={t('hours')}
        tapeStyle="tape-2"
        hoverRotate={-1}
      />
      <PolaroidUnit
        value={timeLeft.minutes}
        label={t('minutes')}
        tapeStyle="tape-3"
        hoverRotate={2}
      />
      <PolaroidUnit
        value={timeLeft.seconds}
        label={t('seconds')}
        tapeStyle="tape-4"
        hoverRotate={-2}
        isSeconds
      />
    </div>
  )
}

interface PolaroidUnitProps {
  value: number
  label: string
  tapeStyle: 'tape-1' | 'tape-2' | 'tape-3' | 'tape-4'
  hoverRotate: number
  isSeconds?: boolean
}

function PolaroidUnit({ value, label, tapeStyle, hoverRotate, isSeconds = false }: PolaroidUnitProps) {
  const formattedValue = String(value).padStart(2, '0')

  // 和紙テープのスタイルバリエーション
  const getTapeStyle = () => {
    switch (tapeStyle) {
      case 'tape-1':
        return {
          background: 'rgba(215, 195, 181, 0.75)',
          transform: 'rotate(-12deg)',
          top: '-8px',
          left: '-6px',
          width: '42px',
          height: '14px',
        }
      case 'tape-2':
        return {
          background: 'rgba(189, 171, 78, 0.55)',
          transform: 'rotate(10deg)',
          top: '-8px',
          right: '-6px',
          width: '38px',
          height: '14px',
        }
      case 'tape-3':
        return {
          background: 'rgba(215, 195, 181, 0.75)',
          transform: 'rotate(15deg)',
          top: '-8px',
          left: '-4px',
          width: '40px',
          height: '14px',
        }
      case 'tape-4':
        return {
          background: 'rgba(189, 171, 78, 0.55)',
          transform: 'rotate(-10deg)',
          top: '-8px',
          right: '-4px',
          width: '38px',
          height: '14px',
        }
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, rotate: hoverRotate }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative group w-full max-w-[140px] flex flex-col items-center"
    >
      {/* 和紙テープ装飾 */}
      <div
        className="absolute z-20 pointer-events-none rounded-2xs shadow-2xs"
        style={getTapeStyle()}
      />

      {/* ポラロイド写真風カード */}
      <div
        className="w-full bg-[#FFFFFF] p-2.5 pb-3 sm:p-3 sm:pb-4 rounded-xs flex flex-col items-center transition-all duration-300"
        style={{
          boxShadow: '0 8px 16px -4px rgba(137, 80, 51, 0.16), 0 2px 4px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* 写真スロット（点線ボーダーとヴィンテージ背景） */}
        <div
          className="w-full aspect-square flex items-center justify-center rounded-2xs mb-2 sm:mb-2.5"
          style={{
            background: '#FDF9E9',
            border: '1.5px dashed rgba(109, 94, 0, 0.28)',
            boxShadow: 'inset 0 1px 3px rgba(74, 36, 0, 0.06)',
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={formattedValue}
              initial={{ opacity: 0, y: isSeconds ? -4 : 0, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: isSeconds ? 4 : 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="font-extrabold text-[#4A2400] tracking-tight select-none"
              style={{
                fontFamily: 'var(--font-heading), ui-sans-serif, system-ui',
                fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              {formattedValue}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ラベル（手書き風・日本語単位表記） */}
        <span
          className="text-xs sm:text-sm font-bold tracking-widest text-[#895033]"
          style={{
            fontFamily: 'var(--font-body), sans-serif',
          }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  )
}

function PolaroidPlaceholder({ label, tapeStyle }: { label: string; tapeStyle: 'tape-1' | 'tape-2' | 'tape-3' | 'tape-4' }) {
  return (
    <div className="relative w-full max-w-[140px] flex flex-col items-center">
      <div
        className="w-full bg-[#FFFFFF] p-2.5 pb-3 sm:p-3 sm:pb-4 rounded-xs flex flex-col items-center"
        style={{
          boxShadow: '0 8px 16px -4px rgba(137, 80, 51, 0.16)',
        }}
      >
        <div
          className="w-full aspect-square flex items-center justify-center rounded-2xs mb-2"
          style={{
            background: '#FDF9E9',
            border: '1.5px dashed rgba(109, 94, 0, 0.28)',
          }}
        >
          <span
            className="font-bold text-[#4A2400]/40"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
            }}
          >
            --
          </span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-[#895033]">
          {label}
        </span>
      </div>
    </div>
  )
}
