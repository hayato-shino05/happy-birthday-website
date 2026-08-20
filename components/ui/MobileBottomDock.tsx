'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { useMusicPlayer } from '@/lib/hooks/useMusicPlayer'
import { Icon } from './Icon'
import { GAME_MENU_ITEMS } from './gameConfig'
import { X, Play, Pause, SkipBack, SkipForward, Music, Share2, Camera } from 'lucide-react'

// デスクトップと完全一致する色合いと機能性を持つ標準モバイルボトムナビゲーション
export function MobileBottomDock() {
  const { t, language } = useLanguage()
  const { openModal } = useUIStore()
  const { isPlaying, currentTrack, tracks, toggle, selectTrack, nextTrack, prevTrack } = useMusicPlayer()
  const [showMenuSheet, setShowMenuSheet] = useState(false)
  const [showMusicList, setShowMusicList] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Escapeキーでメニューを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMenuSheet) {
        setShowMenuSheet(false)
        menuBtnRef.current?.focus()
      }
    }
    if (showMenuSheet) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMenuSheet])

  // Web Share API 共有処理
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
      {/* 1. モバイル用コンパクト・ミュージックバー（デスクトップのMusicPlayerと完全同等デザイン） */}
      <div className="fixed bottom-[70px] inset-x-2 max-w-lg mx-auto z-30 md:hidden">
        <div
          style={{
            background: 'rgba(255, 249, 243, 0.96)',
            border: '2px solid #D4B08C',
            boxShadow: '3px 3px 0 #D4B08C',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-body)',
          }}
        >
          {/* 曲名 ＆ 音楽リスト開閉 */}
          <button
            onClick={() => setShowMusicList(!showMusicList)}
            className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0 mr-2"
            aria-label={t('selectMusic')}
          >
            <div className={`w-6 h-6 rounded-none bg-[#854D27] text-[#FFF9F3] flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-bold text-[#854D27] block truncate">
                {currentTrack?.name || 'Happy Birthday'}
              </span>
            </div>
          </button>

          {/* プレイヤー操作ボタン（前、再生/停止、次） */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={prevTrack}
              className="w-7 h-7 bg-transparent text-[#854D27] hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer transition-transform"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={toggle}
              className="w-8 h-8 bg-[#854D27] text-[#FFF9F3] border border-[#D4B08C] shadow-[1px_1px_0_#D4B08C] flex items-center justify-center active:translate-y-0.5 cursor-pointer"
              aria-label="Play/Pause"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <button
              onClick={nextTrack}
              className="w-7 h-7 bg-transparent text-[#854D27] hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer transition-transform"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 楽曲選択ドロップダウンポップアップ */}
        <AnimatePresence>
          {showMusicList && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-1 p-2 bg-[#FFF9F3] border-2 border-[#D4B08C] shadow-[3px_3px_0_#D4B08C] max-h-40 overflow-y-auto"
            >
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    selectTrack(track.id)
                    setShowMusicList(false)
                  }}
                  className={`w-full p-2 text-left text-xs font-body flex items-center justify-between border-b border-[#D4B08C]/30 last:border-none cursor-pointer ${
                    currentTrack?.id === track.id
                      ? 'bg-[#854D27] text-[#FFF9F3] font-bold'
                      : 'text-[#854D27] hover:bg-[#854D27]/10'
                  }`}
                >
                  <span className="truncate">{track.name}</span>
                  {currentTrack?.id === track.id && (
                    <span className="text-[10px] font-bold text-[#E5A93C] ml-1">●</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. ミニゲーム＆その他メニューシート（標準的でクリーンなポップアップ） */}
      <AnimatePresence>
        {showMenuSheet && (
          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={language === 'ja' ? 'ゲーム＆メニュー' : 'Games & Menu'}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          >
            {/* オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMenuSheet(false)
                menuBtnRef.current?.focus()
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* メニューコンテンツ（デスクトップと完全に同等の配色・質感） */}
            <motion.div
              ref={menuRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 mx-2 mb-20 p-4 bg-[#FFF9F3] border-2 border-[#D4B08C] text-[#854D27]"
              style={{
                boxShadow: '0 -8px 24px rgba(0,0,0,0.3), 4px 4px 0 #D4B08C',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#D4B08C]">
                <div className="flex items-center gap-2">
                  <Icon name="Gamepad" size={20} />
                  <span className="font-bold text-sm font-body tracking-wider text-[#854D27]">
                    {language === 'ja' ? 'ミニゲーム ＆ 特別機能' : 'Games & Features'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    menuBtnRef.current?.focus()
                  }}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] bg-[#854D27] text-[#FFF9F3] border border-[#D4B08C] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ゲームボタン 4種 ＋ 写真フレーム ＋ 共有 */}
              <div className="grid grid-cols-2 gap-2.5">
                {GAME_MENU_ITEMS.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setShowMenuSheet(false)
                      openModal(game.id)
                    }}
                    className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[2px_2px_0_#D4B08C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 bg-white/15 flex items-center justify-center flex-shrink-0 text-[#FFF9F3]">
                      <Icon name={game.icon} size={16} />
                    </div>
                    <span className="truncate">{t(game.i18nKey)}</span>
                  </button>
                ))}

                {/* 写真フレーム撮影 */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('photoFrame')
                  }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[2px_2px_0_#D4B08C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 bg-white/15 flex items-center justify-center flex-shrink-0 text-[#FFF9F3]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="truncate">{language === 'ja' ? '写真フレーム' : 'Photo Frame'}</span>
                </button>

                {/* 友達を招待・共有 */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    handleShare()
                  }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[2px_2px_0_#D4B08C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 bg-white/15 flex items-center justify-center flex-shrink-0 text-[#FFF9F3]">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="truncate">{t('inviteFriends')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. メイン・モバイルボトムナビゲーションバー（デスクトップと統一された和風ブラウン＆ゴールド配色） */}
      <nav
        className="mobile-bottom-dock fixed bottom-2 inset-x-2 max-w-lg mx-auto z-40 md:hidden"
        aria-label="Mobile Navigation Dock"
      >
        <div
          style={{
            background: '#854D27',
            border: '2px solid #D4B08C',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3), 3px 3px 0 #D4B08C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '4px 2px',
          }}
        >
          {/* 1. アルバムを見る */}
          <button
            onClick={() => openModal('album')}
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('viewAlbum')}
          >
            <Icon name="Camera" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? 'アルバム' : 'Album'}
            </span>
          </button>

          {/* 2. お祝いメッセージ送信 */}
          <button
            onClick={() => openModal('message')}
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('sendMessage')}
          >
            <Icon name="Gift" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? 'メッセージ' : 'Wishes'}
            </span>
          </button>

          {/* 3. 掲示板 */}
          <button
            onClick={() => openModal('bulletin')}
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('bulletinBoard')}
          >
            <Icon name="ClipboardList" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '掲示板' : 'Board'}
            </span>
          </button>

          {/* 4. グループチャット */}
          <button
            onClick={() => openModal('chat')}
            className="flex flex-col items-center justify-center min-w-[52px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('groupChat')}
          >
            <Icon name="MessageCircle" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? 'チャット' : 'Chat'}
            </span>
          </button>

          {/* 5. ゲーム ＆ メニュー */}
          <button
            ref={menuBtnRef}
            onClick={() => setShowMenuSheet(!showMenuSheet)}
            aria-expanded={showMenuSheet}
            aria-controls={menuId}
            className={`flex flex-col items-center justify-center min-w-[52px] min-h-[50px] px-1 py-1 ${showMenuSheet ? 'bg-[#6D3D1E] text-[#E5A93C]' : 'text-[#FFF9F3]'} hover:text-[#E5A93C] active:translate-y-0.5 transition-all cursor-pointer`}
            aria-label={language === 'ja' ? 'ゲーム＆メニュー' : 'Games & Menu'}
          >
            <Icon name="Gamepad" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? 'ゲーム' : 'Games'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
