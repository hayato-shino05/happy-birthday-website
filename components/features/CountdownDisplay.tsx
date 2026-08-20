'use client'

import { motion } from 'framer-motion'
import { useNextBirthday } from '@/lib/hooks/useNextBirthday'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { CountdownTimer } from './CountdownTimer'

export function CountdownDisplay() {
  const { nextBirthday, isLoading } = useNextBirthday()
  const { language, t } = useLanguage()
  const { currentTheme } = useThemeContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--theme-primary)' }}
        ></div>
      </div>
    )
  }

  if (!nextBirthday) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xl" style={{ color: 'var(--theme-text)' }}>
          {t('noBirthdayData')}
        </p>
      </div>
    )
  }

  const getTitle = () => {
    switch (language) {
      case 'en':
        return `${t('countdownTitle')} ${nextBirthday.person.name}`
      case 'ja':
        return `${nextBirthday.person.name}${t('countdownTitle')}`
      default:
        return `${t('countdownTitle')} ${nextBirthday.person.name}`
    }
  }

  const getDaysLeftText = () => {
    switch (language) {
      case 'en':
        return `${nextBirthday.daysUntil} ${t('daysLeft')}`
      case 'ja':
        return `あと ${nextBirthday.daysUntil} ${t('daysLeft')}`
      default:
        return `${nextBirthday.daysUntil} ${t('daysLeft')}`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`countdown-card theme-${currentTheme}`}
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderRadius: '24px',
        border: '2px solid rgba(212, 176, 140, 0.6)',
        boxShadow: '0 12px 40px rgba(44, 24, 16, 0.2)',
        padding: '40px 50px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-80px',
      }}
    >
      {/* 装飾用グラデーションオーバーレイ */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--theme-primary), var(--theme-secondary), var(--theme-primary))',
          borderRadius: '24px 24px 0 0',
        }}
      />

      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: '#2C1810',
          marginBottom: '30px',
          fontWeight: 700,
          lineHeight: 1.4,
          textShadow: '0 1px 1px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(44, 24, 16, 0.15)',
        }}
      >
        {getTitle()}
      </motion.h1>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <CountdownTimer targetDate={nextBirthday.date} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        style={{
          marginTop: '25px',
          fontSize: '1.05rem',
          color: '#854D27',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          textShadow: '0 1px 1px rgba(255, 255, 255, 0.8)',
        }}
      >
        {getDaysLeftText()}
      </motion.p>
    </motion.div>
  )
}
