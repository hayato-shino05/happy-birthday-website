'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { Icon } from './Icon'
import { GAME_MENU_ITEMS } from './gameConfig'
import { Camera, MessageSquare, Gamepad2, Share2, Sparkles, X } from 'lucide-react'

// モバイル専用の日本風ボトムナビゲーションDockコンポーネント（Touch Target >= 44px 準拠 & 完全i18n対応）
export function MobileBottomDock() {
  const { t, language } = useLanguage()
  const { openModal } = useUIStore()
  const [showGameDrawer, setShowGameDrawer] = useState(false)
  const drawerId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  const gameToggleRef = useRef<HTMLButtonElement>(null)

  // Escapeキーでドロワーを閉じるキーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showGameDrawer) {
        setShowGameDrawer(false)
        gameToggleRef.current?.focus()
      }
    }
    if (showGameDrawer) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showGameDrawer])

  // Web Share API による共有処理（クリップボード非対応環境の安全なフォールバック付き）
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const defaultShareText = language === 'ja' ? '大切な記念日と思い出を分かち合う空間 🎂🎉' : 'A special place to share birthdays and memories 🎂🎉'
    const shareData = {
      title: 'Omoide | 想い出箱',
      text: defaultShareText,
      url: shareUrl,
    }

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // キャンセル時は何もしない
        return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert(t('notificationCopied'))
        return
      } catch {
        // クリップボード例外時はプロンプトへフォールバック
      }
    }

    const promptText = language === 'ja' ? '以下のリンクをコピーしてください:' : 'Please copy the link below:'
    window.prompt(promptText, shareUrl)
  }

  return (
    <>
      {/* ゲーム選択ドロワー（モバイルポップアップ） */}
      <AnimatePresence>
        {showGameDrawer && (
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={t('birthdayQuiz')}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowGameDrawer(false)
                gameToggleRef.current?.focus()
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              ref={drawerRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 mx-3 mb-20 p-4 rounded-3xl bg-[#2D1B11]/95 backdrop-blur-xl border border-[#D4B08C]/50 shadow-2xl text-[#FFF9F3]"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4B08C]/30">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-[#E5A93C]" />
                  <span className="font-bold text-sm tracking-wider">
                    {language === 'ja' ? 'お祝いミニゲーム' : 'Celebration Games'}
                  </span>
                </div>
                {/* 閉じるボタン（Touch Target >= 44px） */}
                <button
                  onClick={() => {
                    setShowGameDrawer(false)
                    gameToggleRef.current?.focus()
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 active:scale-95 transition-colors cursor-pointer"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {GAME_MENU_ITEMS.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setShowGameDrawer(false)
                      openModal(game.id)
                    }}
                    className="min-h-[48px] px-3 py-2.5 rounded-2xl bg-[#854D27]/80 hover:bg-[#854D27] border border-[#D4B08C]/40 flex items-center gap-2.5 text-xs font-bold text-[#FFF9F3] shadow-md active:scale-95 transition-transform text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-[#E5A93C]">
                      <Icon name={game.icon} size={16} />
                    </div>
                    <span className="truncate">{t(game.i18nKey as any)}</span>
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
          className="flex items-center justify-around px-1.5 py-1.5 rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(45, 27, 17, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(212, 176, 140, 0.45)',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* 1. アルバム / 想い出 */}
          <button
            onClick={() => openModal('album')}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[46px] px-1 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform cursor-pointer"
            aria-label={t('viewAlbum')}
          >
            <Camera className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">
              {language === 'ja' ? '想い出' : 'Memories'}
            </span>
          </button>

          {/* 2. 寄せ書き / 掲示板 */}
          <button
            onClick={() => openModal('bulletin')}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[46px] px-1 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform cursor-pointer"
            aria-label={t('bulletinBoard')}
          >
            <MessageSquare className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">
              {language === 'ja' ? '寄せ書き' : 'Wishes'}
            </span>
          </button>

          {/* 3. チャット / 祝言 */}
          <button
            onClick={() => openModal('chat')}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[46px] px-1 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform cursor-pointer"
            aria-label={t('groupChat')}
          >
            <Sparkles className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">
              {language === 'ja' ? '祝言' : 'Chat'}
            </span>
          </button>

          {/* 4. ゲーム */}
          <button
            ref={gameToggleRef}
            onClick={() => setShowGameDrawer(!showGameDrawer)}
            aria-expanded={showGameDrawer}
            aria-controls={drawerId}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[46px] px-1 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform cursor-pointer"
            aria-label={language === 'ja' ? 'お祝いミニゲーム' : 'Celebration Games'}
          >
            <Gamepad2 className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">
              {language === 'ja' ? '遊び' : 'Games'}
            </span>
          </button>

          {/* 5. 共有 */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[46px] px-1 py-1 rounded-xl text-[#FFF9F3] hover:text-[#E5A93C] active:scale-90 transition-transform cursor-pointer"
            aria-label={t('inviteFriends')}
          >
            <Share2 className="w-5 h-5 text-[#E5A93C]" />
            <span className="text-[9px] font-bold tracking-tight mt-0.5 opacity-90">
              {language === 'ja' ? '共有' : 'Share'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
