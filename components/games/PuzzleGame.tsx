'use client'

import { motion } from 'framer-motion'
import { usePuzzleGame } from '@/lib/hooks/usePuzzleGame'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'

interface PuzzleGameProps {
  onClose: () => void
}

export function PuzzleGame({ onClose }: PuzzleGameProps) {
  const { pieces, moves, isComplete, isPlaying, timeElapsed, movePiece, startGame } =
    usePuzzleGame()
  const { t } = useLanguage()

  const gridSize = 3
  const emptyId = gridSize * gridSize - 1

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const sortedPieces = [...pieces].sort((a, b) => a.currentPos - b.currentPos)

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
            {t('puzzleGameInstructions') || 'タイルを1-8の順に並べましょう！'}
          </p>
          <button
            onClick={() => startGame(3)}
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
            移動: {moves} | 時間: {formatTime(timeElapsed)}
          </p>
          <button
            onClick={() => startGame(3)}
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
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: '4px',
            background: '#D4B08C',
            padding: '4px',
            borderRadius: '8px',
          }}
        >
          {sortedPieces.map((piece) => (
            <motion.button
              key={piece.id}
              onClick={() => movePiece(piece.id)}
              whileHover={{ scale: piece.id !== emptyId ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
              style={{
                aspectRatio: '1',
                background: piece.id === emptyId ? 'transparent' : '#854D27',
                border: piece.id === emptyId ? 'none' : '2px solid #D4B08C',
                borderRadius: '4px',
                cursor: piece.id === emptyId ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#FFF9F3',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {piece.id !== emptyId && piece.id + 1}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
