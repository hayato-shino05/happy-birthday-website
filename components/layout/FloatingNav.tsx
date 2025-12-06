'use client'

import { useState } from 'react'

interface NavItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

interface FloatingNavProps {
  items: NavItem[]
  position?: 'bottom' | 'right'
}

export default function FloatingNav({ items, position = 'bottom' }: FloatingNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const positionClasses = position === 'bottom'
    ? 'fixed bottom-6 left-1/2 -translate-x-1/2'
    : 'fixed right-6 top-1/2 -translate-y-1/2 flex-col'

  return (
    <nav className={`${positionClasses} z-40`}>
      <div className={`bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-2 flex ${position === 'right' ? 'flex-col' : ''} gap-1`}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveId(item.id)
              item.onClick?.()
            }}
            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer group ${
              activeId === item.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            aria-label={item.label}
          >
            {item.icon}

            {/* ツールチップ */}
            <span className={`absolute ${position === 'right' ? 'right-full mr-3' : 'bottom-full mb-3'} px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
