'use client'

import { motion } from 'framer-motion'
import { useMemoryGame } from '@/lib/hooks/useMemoryGame'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'
import { MemoryCard } from './MemoryCard'

interface MemoryGameProps {
  onClose: () => void
}

export function MemoryGame({ onClose }: MemoryGameProps) {
  const { cards, score, moves, isComplete, isPlaying, timeElapsed, flipCard, startGame } =
    useMemoryGame()
  const { t } = useLanguage()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div>
      {/* ステータス */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(212, 176, 140, 0.2)',
          borderRadius: '8px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#854D27' }}>{score}</div>
          <div style={{ fontSize: '0.8rem', color: '#854D27' }}>{t('gameScore') || 'スコア'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#854D27' }}>{moves}</div>
          <div style={{ fontSize: '0.8rem', color: '#854D27' }}>Moves</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#854D27' }}>{formatTime(timeElapsed)}</div>
          <div style={{ fontSize: '0.8rem', color: '#854D27' }}>{t('gameTime') || '時間'}</div>
        </div>
      </div>

      {/* ゲームボードまたは開始画面 */}
      {!isPlaying ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: '#854D27', marginBottom: '20px', fontSize: '1rem' }}>
            {t('memoryGameInstructions') || 'カードをめくって同じペアを見つけましょう！'}
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '12px 30px',
              background: '#854D27',
              color: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '4px 4px 0 #D4B08C',
            }}
          >
            {t('gameStart') || 'スタート'}
          </button>
        </div>
      ) : isComplete ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ color: '#854D27', fontSize: '1.5rem', marginBottom: '10px' }}>
            <Icon name="Party" size={22} aria-hidden="true" /> {t('gameWin') || 'おめでとう！'}
          </h3>
          <p style={{ color: '#854D27', marginBottom: '20px' }}>
            スコア: {score} | 移動: {moves} | 時間: {formatTime(timeElapsed)}
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '12px 30px',
              background: '#854D27',
              color: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '4px 4px 0 #D4B08C',
            }}
          >
            {t('gameRestart') || 'もう一度プレイ'}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
          }}
        >
          {cards.map((card) => (
            <MemoryCard
              key={card.id}
              emoji={card.emoji}
              isFlipped={card.isFlipped || card.isMatched}
              isMatched={card.isMatched}
              onClick={() => flipCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
