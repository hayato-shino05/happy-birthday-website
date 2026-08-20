'use client'

import { motion } from 'framer-motion'
import { useMessages } from '@/lib/hooks/useMessages'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { CustomMessage } from '@/types'

interface MessageListProps {
  limit?: number
}

export function MessageList({ limit }: MessageListProps) {
  const { messages, isLoading, error } = useMessages()
  const { t } = useLanguage()

  const displayMessages = limit ? messages.slice(0, limit) : messages

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#854D27' }}>{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#dc3545' }}>{error}</p>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: '#854D27' }}>{t('noWishes')}</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {displayMessages.map((msg, index) => (
        <MessageCard key={msg.id} message={msg} index={index} />
      ))}
    </div>
  )
}

function MessageCard({ message, index }: { message: CustomMessage; index: number }) {
  const { locale } = useLanguage()
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        padding: '15px',
        background: '#FFF9F3',
        border: '2px solid #D4B08C',
        borderRadius: '8px',
        boxShadow: '3px 3px 0 #D4B08C',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontWeight: 600, color: '#854D27' }}>{message.sender}</span>
        <span style={{ fontSize: '0.8rem', color: '#854D27', opacity: 0.7 }}>
          {formatDate(message.created_at)}
        </span>
      </div>
      <p style={{ color: '#2C1810', margin: 0, lineHeight: 1.6 }}>{message.message}</p>
    </motion.div>
  )
}
