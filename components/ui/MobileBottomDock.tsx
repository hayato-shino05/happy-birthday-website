'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { Icon } from './Icon'
import { Camera, MessageSquare, Gamepad2, Share2, Sparkles, X } from 'lucide-react'

// モバイル専用の日本風ボトムナビゲーションDockコンポーネント（Touch Target >= 44px 準拠）
export function MobileBottomDock() {
  const { t } = useLanguage()
  const { openModal } = useUIStore()
  const [showGameDrawer, setShowGameDrawer] = useState(false)

  // ゲーム一覧アイテム定義
  const gameItems = [
    { id: 'memoryGame' as const, label: t('memoryGame') || '神経衰弱', icon: 'Brain' as const },
    { id: 'puzzleGame' as const, label: t('puzzleGame') || 'パズル', icon: 'Puzzle' as const },
    { id: 'calendar' as const, label: t('birthdayCalendar') || 'カレンダー', icon: 'Calendar' as const },
    { id: 'quiz' as const, label: t('birthdayQuiz') || 'クイズ', icon: 'HelpCircle' as const },
  ]

  // Web Share API による共有処理
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: 'Omoide | 想い出箱',
      text: '大切な記念日と思い出を分かち合う空間 🎂🎉',
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // 共有キャンセル時は処理をスキップ
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('リンクをクリップボードにコピーしました！')
      } catch {
        // クリップボード例外処理
      }
    }
  }

  return (
    <>
      {/* ゲーム選択ドロワー（モバイルポップアップ） */}
      <AnimatePresence>
        {showGameDrawer && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGameDrawer(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 mx-3 mb-20 p-4 rounded-3xl bg-[#2D1B11]/95 backdrop-blur-xl border border-[#D4B08C]/50 shadow-2xl text-[#FFF9F3]"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4B08C]/30">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-[#E5A93C]" />
                  <span className="font-bold text-sm tracking-wider">お祝いミニゲーム</span>
                </div>
                <button
                  onClick={() => setShowGameDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 active:scale-95"
                  aria-label="閉じる"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {gameItems.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setShowGameDrawer(false)
                      openModal(game.id)
                    }}
                    className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-[#854D27]/80 hover:bg-[#854D27] border border-[#D4B08C]/40 flex items-center gap-2.5 text-xs font-bold text-[#FFF9F3] shadow-md active:scale-95 transition-transform text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-[#E5A93C]">
                      <Icon name={game.icon} size={16} />
                    </div>
                    <span className="truncate">{game.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* メインのモバイルボトムDockバー */}
      <nav
        className="mobile-bottom-dock fixed bottom-3 inset-x-3 max-w-md mx-auto z-40 md:hidden"
        aria-label="Mobile Navigation Dock"
      >
        <div
          className="flex items-center justify-around px-2 py-1.5 rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(45, 27, 17, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(212, 176, 140, 0.45)',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* 1. アルバム / 想い出 */}
          <button
            onClick={() => openModal('album')}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1.5 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform"
            aria-label="アルバム"
          >
            <Camera className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">想い出</span>
          </button>

          {/* 2. 寄せ書き / 掲示板 */}
          <button
            onClick={() => openModal('bulletin')}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1.5 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform"
            aria-label="寄せ書き"
          >
            <MessageSquare className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">寄せ書き</span>
          </button>

          {/* 3. チャット */}
          <button
            onClick={() => openModal('chat')}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1.5 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform"
            aria-label="チャット"
          >
            <Sparkles className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">祝言</span>
          </button>

          {/* 4. ゲーム */}
          <button
            onClick={() => setShowGameDrawer(!showGameDrawer)}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1.5 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform"
            aria-label="ゲームメニュー"
          >
            <Gamepad2 className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">遊び</span>
          </button>

          {/* 5. 共有 */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center min-w-[48px] min-h-[46px] px-1.5 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform"
            aria-label="共有"
          >
            <Share2 className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">共有</span>
          </button>
        </div>
      </nav>
    </>
  )
}
