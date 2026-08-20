'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getTimeUntilBirthday } from '@/lib/utils/birthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface CountdownTimerProps {
  targetDate: Date
  onComplete?: () => void
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false })
  const { t } = useLanguage()

  // ハイドレーションの不整合を防ぐため、時間計算はクライアント側でのみ行う
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
    // SSR 中はプレースホルダーを返す
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <TimeUnitPlaceholder label={t('days')} />
        <TimeUnitPlaceholder label={t('hours')} />
        <TimeUnitPlaceholder label={t('minutes')} />
        <TimeUnitPlaceholder label={t('seconds')} />
      </div>
    )
  }

  if (timeLeft.isExpired) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <TimeUnit value={timeLeft.days} label={t('days')} delay={0} />
      <TimeUnit value={timeLeft.hours} label={t('hours')} delay={0.1} />
      <TimeUnit value={timeLeft.minutes} label={t('minutes')} delay={0.2} />
      <TimeUnit value={timeLeft.seconds} label={t('seconds')} delay={0.3} />
    </div>
  )
}

function TimeUnit({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          background: 'var(--theme-primary)',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '12px',
          minWidth: '60px',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem',
          fontWeight: 700,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{value}</span>
        {/* ハイライトエフェクト */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)',
            borderRadius: '12px 12px 0 0',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#854D27',
          fontFamily: 'var(--font-body)',
          textShadow: '0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}


function TimeUnitPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          background: 'var(--theme-primary)',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: '12px',
          minWidth: '60px',
          textAlign: 'center',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.8rem',
          fontWeight: 700,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>--</span>
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#854D27',
          fontFamily: 'var(--font-body)',
          textShadow: '0 1px 1px rgba(255,255,255,0.9)',
        }}
      >
        {label}
      </span>
    </div>
  )
}
