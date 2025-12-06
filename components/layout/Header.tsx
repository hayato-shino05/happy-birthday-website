'use client'

import { useState } from 'react'
import { LanguageSelector } from '@/components/ui/LanguageSelector'

interface HeaderProps {
  title?: string
  showLanguageSelector?: boolean
  onMenuClick?: () => void
}

export default function Header({ title, showLanguageSelector = true, onMenuClick }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* ロゴ / タイトル */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <span className="text-xl">🎂</span>
            </div>
            <h1 className="text-lg font-bold text-white hidden sm:block">
              {title || 'Happy Birthday'}
            </h1>
          </div>
          {/* デスクトップ用ナビゲーション */}
          <nav className="hidden md:flex items-center gap-4">
            {showLanguageSelector && <LanguageSelector />}
          </nav>

          {/* モバイルメニューのボタン */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen)
              onMenuClick?.()
            }}
            className="md:hidden w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {showLanguageSelector && (
                <div className="py-2">
                  <LanguageSelector />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
