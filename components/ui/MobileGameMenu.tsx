'use client'

import { useState, useRef, useEffect } from 'react'
import { Gamepad2, X, Brain, Puzzle, Calendar, HelpCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'

const menuButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#854D27',
  color: '#FFF9F3',
  border: '2px solid #D4B08C',
  borderRadius: 0,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: '0.7em',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  boxShadow: '2px 2px 0 #D4B08C',
  transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  whiteSpace: 'nowrap',
}

const menuItemStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'transparent',
  color: '#FFF9F3',
  border: 'none',
  borderBottom: '1px solid rgba(212, 176, 140, 0.3)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85em',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  textAlign: 'left',
  transition: 'background 0.2s',
}

export function MobileGameMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const { openModal } = useUIStore()

  const games = [
    { id: 'memoryGame' as const, icon: Brain, label: t('memoryGame') },
    { id: 'puzzleGame' as const, icon: Puzzle, label: t('puzzleGame') },
    { id: 'calendar' as const, icon: Calendar, label: t('birthdayCalendar') },
    { id: 'quiz' as const, icon: HelpCircle, label: t('birthdayQuiz') },
  ]

  // 外側をクリックしたらメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  const handleGameClick = (gameId: 'memoryGame' | 'puzzleGame' | 'calendar' | 'quiz') => {
    openModal(gameId)
    setIsOpen(false)
  }

  return (
    <div className="mobile-game-menu" ref={menuRef}>

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={menuButtonStyle}
        className="mobile-game-toggle"
        aria-label={isOpen ? t('closeGameMenu') : t('openGameMenu')}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X size={16} />
        ) : (
          <Gamepad2 size={16} />
        )}
        <span>{t('games')}</span>
      </button>


      {isOpen && (
        <div className="mobile-game-dropdown">
          {games.map((game) => {
            const IconComponent = game.icon
            return (
              <button
                key={game.id}
                onClick={() => handleGameClick(game.id)}
                style={menuItemStyle}
                className="mobile-game-item"
              >
                <IconComponent size={18} />
                <span>{game.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
