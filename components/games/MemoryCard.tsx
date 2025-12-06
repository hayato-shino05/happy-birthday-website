'use client'

import { motion } from 'framer-motion'

interface MemoryCardProps {
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  onClick: () => void
}

export function MemoryCard({ emoji, isFlipped, isMatched, onClick }: MemoryCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: isFlipped ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        aspectRatio: '1',
        cursor: isFlipped ? 'default' : 'pointer',
        perspective: '1000px',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* カードの裏面 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: '#854D27',
            border: '2px solid #D4B08C',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: '#D4B08C',
            boxShadow: '2px 2px 0 #D4B08C',
          }}
        >
          🎂
        </div>

        {/* カードの表面 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: isMatched ? 'rgba(76, 175, 80, 0.2)' : '#FFF9F3',
            border: `2px solid ${isMatched ? '#4CAF50' : '#D4B08C'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: isMatched ? '0 0 10px rgba(76, 175, 80, 0.5)' : '2px 2px 0 #D4B08C',
          }}
        >
          {emoji}
        </div>
      </motion.div>
    </motion.div>
  )
}
