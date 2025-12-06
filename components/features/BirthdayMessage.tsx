'use client'

import { motion } from 'framer-motion'

interface BirthdayMessageProps {
  message: string
}

// 誕生日メッセージコンポーネント
export function BirthdayMessage({ message }: BirthdayMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto"
    >
      <p className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 text-center leading-relaxed">
        {message}
      </p>
    </motion.div>
  )
}
