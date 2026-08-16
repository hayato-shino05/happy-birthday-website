'use client'

import { Brain, Puzzle, Calendar, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { MobileGameMenu } from './MobileGameMenu'

const gameButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#854D27',
  color: '#FFF9F3',
  border: '2px solid #D4B08C',
  borderRadius: 0,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85em',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  boxShadow: '4px 4px 0 #D4B08C',
  transition: 'transform 0.3s, box-shadow 0.3s',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
}

export function GameButtons() {
  const { t } = useLanguage()
  const { openModal } = useUIStore()

  const games = [
    { id: 'memoryGame' as const, icon: Brain, label: t('memoryGame') },
    { id: 'puzzleGame' as const, icon: Puzzle, label: t('puzzleGame') },
    { id: 'calendar' as const, icon: Calendar, label: t('birthdayCalendar') },
    { id: 'quiz' as const, icon: HelpCircle, label: t('birthdayQuiz') },
  ]

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)'
    e.currentTarget.style.boxShadow = '6px 6px 0 #D4B08C'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)'
    e.currentTarget.style.boxShadow = '4px 4px 0 #D4B08C'
  }

  return (
    <>
      <div className="games-mobile-only">
        <MobileGameMenu />
      </div>

      <div className="games-container games-desktop-only" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {games.map((game) => {
          const IconComponent = game.icon
          return (
            <button
              key={game.id}
              className="game-button"
              onClick={() => openModal(game.id)}
              style={gameButtonStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <IconComponent size={16} />
              <span>{game.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
