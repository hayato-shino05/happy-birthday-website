'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGifts, GIFT_CATALOG } from '@/lib/hooks/useGifts'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface GiftSelectorProps {
  onClose: () => void
  birthdayPerson?: string
}

export function GiftSelector({ onClose, birthdayPerson }: GiftSelectorProps) {
  const { gifts, sendGift } = useGifts()
  const { t } = useLanguage()
  const [sender, setSender] = useState('')
  const [selectedGift, setSelectedGift] = useState<{ emoji: string; name: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSendGift = async () => {
    if (!sender.trim() || !selectedGift) return

    setIsSubmitting(true)
    const success = await sendGift(sender.trim(), selectedGift.emoji, selectedGift.name, birthdayPerson)
    setIsSubmitting(false)

    if (success) {
      setSender('')
      setSelectedGift(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFF9F3',
          border: '3px solid #D4B08C',
          borderRadius: '16px',
          padding: '30px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '8px 8px 0 #D4B08C',
        }}
      >
        {/* ヘッダー */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#854D27', fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.5rem' }}>
            🎁 バーチャルギフトを送る
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#854D27' }}
          >
            ✕
          </button>
        </div>

        {/* 送信者入力 */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="お名前"
            style={{
              width: '100%',
              padding: '12px 15px',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              background: '#FFF9F3',
              color: '#2C1810',
            }}
          />
        </div>

        {/* ギフト一覧グリッド */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          {GIFT_CATALOG.map((gift) => (
            <motion.button
              key={gift.emoji}
              onClick={() => setSelectedGift(gift)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '15px 10px',
                background: selectedGift?.emoji === gift.emoji ? 'rgba(133, 77, 39, 0.2)' : '#FFF9F3',
                border: `2px solid ${selectedGift?.emoji === gift.emoji ? '#854D27' : '#D4B08C'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{gift.emoji}</span>
              <span style={{ fontSize: '0.7rem', color: '#854D27' }}>{gift.name}</span>
            </motion.button>
          ))}
        </div>

        {/* 送信ボタン */}
        <button
          onClick={handleSendGift}
          disabled={!sender.trim() || !selectedGift || isSubmitting}
          style={{
            width: '100%',
            padding: '12px 25px',
            background: !sender.trim() || !selectedGift || isSubmitting ? '#999' : '#854D27',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: !sender.trim() || !selectedGift || isSubmitting ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '4px 4px 0 #D4B08C',
          }}
        >
          {isSubmitting ? '送信中...' : 'ギフトを送る'}
        </button>

        {/* 最近受け取ったギフト */}
        {gifts.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ color: '#854D27', fontSize: '1rem', marginBottom: '15px' }}>受け取ったギフト</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {gifts.slice(0, 10).map((gift) => (
                <div
                  key={gift.id}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(212, 176, 140, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    color: '#854D27',
                  }}
                >
                  {gift.gift_emoji} {gift.sender}さんから
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
