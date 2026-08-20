'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { useMusicStore } from '@/lib/stores/musicStore'
import { Icon } from './Icon'
import { GAME_MENU_ITEMS } from './gameConfig'
import { X, Music, Volume2, Share2 } from 'lucide-react'

// 和風レトロ文具・漆器調モバイルボトムナビゲーションDock（Touch Target >= 48px & 伝統工芸スタイル）
export function MobileBottomDock() {
  const { t, language } = useLanguage()
  const { openModal } = useUIStore()
  const { isPlaying, toggle: toggleMusic } = useMusicStore()
  const [showGameDrawer, setShowGameDrawer] = useState(false)
  const drawerId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  const gameToggleRef = useRef<HTMLButtonElement>(null)

  // Escapeキーによるドロワー閉じる操作
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

  // Web Share API による共有処理（安全なフォールバック付き）
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
        return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert(t('notificationCopied'))
        return
      } catch {
        // クリップボード例外処理
      }
    }

    const promptText = language === 'ja' ? '以下のリンクをコピーしてください:' : 'Please copy the link below:'
    window.prompt(promptText, shareUrl)
  }

  return (
    <>
      {/* 桐箱・漆箱風 ゲーム選択ドロワー */}
      <AnimatePresence>
        {showGameDrawer && (
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={language === 'ja' ? 'お祝いミニゲーム' : 'Celebration Games'}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          >
            {/* 背景オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowGameDrawer(false)
                gameToggleRef.current?.focus()
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* 桐箱ドロワー本体 */}
            <motion.div
              ref={drawerRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 mx-2 mb-20 p-4 bg-[#3E2314] border-2 border-[#D4B08C] shadow-2xl text-[#FFF9F3]"
              style={{
                boxShadow: '0 -8px 24px rgba(0,0,0,0.5), 4px 4px 0 #D4B08C',
              }}
            >
              {/* ドロワーヘッダー */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4B08C]/40">
                <div className="flex items-center gap-2">
                  <Icon name="Gamepad" size={20} />
                  <span className="font-bold text-sm tracking-wider font-body">
                    {language === 'ja' ? 'お祝い遊技' : 'Celebration Games'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowGameDrawer(false)
                    gameToggleRef.current?.focus()
                  }}
                  className="min-w-[44px] min-h-[44px] px-2 py-1 bg-[#854D27] border border-[#D4B08C] text-[#FFF9F3] flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ゲーム一覧グリッド */}
              <div className="grid grid-cols-2 gap-2.5">
                {GAME_MENU_ITEMS.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setShowGameDrawer(false)
                      openModal(game.id)
                    }}
                    className="min-h-[50px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] border border-[#D4B08C] flex items-center gap-3 text-xs font-bold text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-none bg-black/20 border border-[#D4B08C]/50 flex items-center justify-center flex-shrink-0 text-[#FFF9F3]">
                      <Icon name={game.icon} size={18} />
                    </div>
                    <span className="truncate font-body">{t(game.i18nKey)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 伝統和風レトロ文具調 ボトムナビゲーションバー */}
      <nav
        className="mobile-bottom-dock fixed bottom-2 inset-x-2 max-w-lg mx-auto z-40 md:hidden"
        aria-label="Mobile Navigation Dock"
      >
        <div
          className="flex items-center justify-around px-1 py-1 bg-[#3E2314] border-2 border-[#D4B08C] shadow-[0_8px_20px_rgba(0,0,0,0.5),3px_3px_0_#D4B08C]"
        >
          {/* 1. 想い出アルバム */}
          <button
            onClick={() => openModal('album')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('viewAlbum')}
          >
            <Icon name="Camera" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '想い出' : 'Album'}
            </span>
          </button>

          {/* 2. 寄せ書き掲示板 */}
          <button
            onClick={() => openModal('bulletin')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('bulletinBoard')}
          >
            <Icon name="ClipboardList" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '寄せ書き' : 'Wishes'}
            </span>
          </button>

          {/* 3. 祝言チャット */}
          <button
            onClick={() => openModal('chat')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('groupChat')}
          >
            <Icon name="MessageCircle" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '祝言' : 'Chat'}
            </span>
          </button>

          {/* 4. お祝い遊技（ゲーム） */}
          <button
            ref={gameToggleRef}
            onClick={() => setShowGameDrawer(!showGameDrawer)}
            aria-expanded={showGameDrawer}
            aria-controls={drawerId}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 ${showGameDrawer ? 'bg-[#854D27] text-[#E5A93C]' : 'text-[#FFF9F3]'} hover:text-[#E5A93C] active:translate-y-0.5 transition-all cursor-pointer`}
            aria-label={language === 'ja' ? 'お祝いミニゲーム' : 'Celebration Games'}
          >
            <Icon name="Gamepad" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '遊技' : 'Games'}
            </span>
          </button>

          {/* 5. 音楽（再生・停止切り替え） */}
          <button
            onClick={() => toggleMusic()}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 ${isPlaying ? 'text-[#E5A93C]' : 'text-[#FFF9F3]'} hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer`}
            aria-label={t('selectMusic')}
          >
            {isPlaying ? (
              <Volume2 className="w-5 h-5 text-[#E5A93C] animate-pulse" />
            ) : (
              <Music className="w-5 h-5" />
            )}
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '音楽' : 'Music'}
            </span>
          </button>

          {/* 6. 共有 */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('inviteFriends')}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '共有' : 'Share'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
