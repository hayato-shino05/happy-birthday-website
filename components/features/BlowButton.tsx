'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'

interface BlowButtonProps {
  onClick: () => void
  disabled?: boolean
  allCandlesBlown?: boolean
}

// ろうそくを吹くボタンコンポーネント
export function BlowButton({ onClick, disabled, allCandlesBlown }: BlowButtonProps) {
  const { t } = useLanguage()

  if (allCandlesBlown) {
    return null
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-xl font-bold rounded-full shadow-2xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {/* ボタンの光沢エフェクト */}
      <motion.div
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />

      <span
        className="relative z-10 inline-flex items-center gap-2"
        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
      >
        <Icon name="Wind" size={20} />
        {t('blowCandles')}
      </span>
    </motion.button>
  )
}
