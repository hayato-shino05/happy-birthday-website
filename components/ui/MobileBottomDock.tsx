'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { useMusicPlayer } from '@/lib/hooks/useMusicPlayer'
import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { getThemeDisplayName } from '@/lib/utils/theme'
import { VISUAL_THEME_KEYS } from '@/config/visualThemes'
import { Icon } from './Icon'
import { GAME_MENU_ITEMS } from './gameConfig'
import type { ThemeName } from '@/types'
import { X, Play, Pause, SkipBack, SkipForward, Music, Volume2, Share2, Globe, Palette, Sparkles } from 'lucide-react'

// 和風レトロ文具・漆器調モバイル全機能ナビゲーションDock＆想い出の抽斗（All-in-One Master Mobile Navigation）
export function MobileBottomDock() {
  const { t, language, setLanguage } = useLanguage()
  const { openModal } = useUIStore()
  const { currentTheme, setTheme } = useThemeContext()
  const { isPlaying, currentTrack, tracks, toggle, selectTrack, nextTrack, prevTrack } = useMusicPlayer()
  const [showMasterDrawer, setShowMasterDrawer] = useState(false)
  const [activeTab, setActiveTab] = useState<'games' | 'music' | 'themes'>('games')
  const drawerId = useId()
  const drawerRef = useRef<HTMLDivElement>(null)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  // Escapeキーでドロワーを閉じるアクセシビリティ対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMasterDrawer) {
        setShowMasterDrawer(false)
        menuToggleRef.current?.focus()
      }
    }
    if (showMasterDrawer) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMasterDrawer])

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
      {/* 漆器・和風文具調 全機能展開ドロワー（想い出の抽斗） */}
      <AnimatePresence>
        {showMasterDrawer && (
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={language === 'ja' ? '想い出の全機能メニュー' : 'Master Feature Menu'}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          >
            {/* 背景オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMasterDrawer(false)
                menuToggleRef.current?.focus()
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* 漆箱ドロワー本体 */}
            <motion.div
              ref={drawerRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative z-10 mx-2 mb-20 p-4 bg-[#3E2314] border-2 border-[#D4B08C] shadow-2xl text-[#FFF9F3] max-h-[80vh] overflow-y-auto"
              style={{
                boxShadow: '0 -8px 28px rgba(0,0,0,0.6), 4px 4px 0 #D4B08C',
              }}
            >
              {/* ドロワーヘッダー */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D4B08C]/40">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#E5A93C]" />
                  <span className="font-bold text-sm tracking-wider font-body">
                    {language === 'ja' ? '想い出箱の全機能' : 'Omoide Features'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowMasterDrawer(false)
                    menuToggleRef.current?.focus()
                  }}
                  className="min-w-[44px] min-h-[44px] px-2 py-1 bg-[#854D27] border border-[#D4B08C] text-[#FFF9F3] flex items-center justify-center cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                  aria-label={t('close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* サブナビゲーションタブ切替 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('games')}
                  className={`py-2 px-1 text-xs font-bold font-body border border-[#D4B08C] transition-all cursor-pointer ${
                    activeTab === 'games' ? 'bg-[#854D27] text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C]' : 'bg-[#2D1B11] text-[#D4B08C]/80'
                  }`}
                >
                  {language === 'ja' ? '🎮 遊技' : '🎮 Games'}
                </button>
                <button
                  onClick={() => setActiveTab('music')}
                  className={`py-2 px-1 text-xs font-bold font-body border border-[#D4B08C] transition-all cursor-pointer ${
                    activeTab === 'music' ? 'bg-[#854D27] text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C]' : 'bg-[#2D1B11] text-[#D4B08C]/80'
                  }`}
                >
                  {language === 'ja' ? '🎵 音楽' : '🎵 Music'}
                </button>
                <button
                  onClick={() => setActiveTab('themes')}
                  className={`py-2 px-1 text-xs font-bold font-body border border-[#D4B08C] transition-all cursor-pointer ${
                    activeTab === 'themes' ? 'bg-[#854D27] text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C]' : 'bg-[#2D1B11] text-[#D4B08C]/80'
                  }`}
                >
                  {language === 'ja' ? '🎨 13テーマ' : '🎨 Themes'}
                </button>
              </div>

              {/* タブ1: ミニゲーム ＆ 特別体験 */}
              {activeTab === 'games' && (
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {GAME_MENU_ITEMS.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        setShowMasterDrawer(false)
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
                  {/* 写真フレーム撮影 */}
                  <button
                    onClick={() => {
                      setShowMasterDrawer(false)
                      openModal('photoFrame')
                    }}
                    className="min-h-[50px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] border border-[#D4B08C] flex items-center gap-3 text-xs font-bold text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-none bg-black/20 border border-[#D4B08C]/50 flex items-center justify-center flex-shrink-0 text-[#FFF9F3]">
                      <Icon name="Camera" size={18} />
                    </div>
                    <span className="truncate font-body">{language === 'ja' ? '写真フレーム撮影' : 'Photo Frame'}</span>
                  </button>
                </div>
              )}

              {/* タブ2: 音楽プレイヤー（完全版） */}
              {activeTab === 'music' && (
                <div className="p-3 bg-[#2D1B11] border border-[#D4B08C]/60 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#D4B08C] font-bold">
                      {language === 'ja' ? '再生中の楽曲:' : 'Now Playing:'}
                    </span>
                    <span className="text-xs font-bold text-[#FFF9F3] truncate max-w-[200px]">
                      {currentTrack?.title || 'Happy Birthday'}
                    </span>
                  </div>

                  {/* 音楽操作ボタン群 */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    <button
                      onClick={prevTrack}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] bg-[#854D27] border border-[#D4B08C] flex items-center justify-center text-[#FFF9F3] active:translate-y-0.5 cursor-pointer"
                      aria-label="Previous Track"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button
                      onClick={toggle}
                      className="w-12 h-12 min-w-[48px] min-h-[48px] bg-[#854D27] border-2 border-[#D4B08C] shadow-[2px_2px_0_#D4B08C] flex items-center justify-center text-[#FFF9F3] active:translate-y-0.5 cursor-pointer"
                      aria-label="Play/Pause Track"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                    <button
                      onClick={nextTrack}
                      className="w-10 h-10 min-w-[40px] min-h-[40px] bg-[#854D27] border border-[#D4B08C] flex items-center justify-center text-[#FFF9F3] active:translate-y-0.5 cursor-pointer"
                      aria-label="Next Track"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 楽曲選択リスト */}
                  <div className="mt-3 max-h-36 overflow-y-auto space-y-1">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => selectTrack(track.id)}
                        className={`w-full p-2 text-left text-xs font-body flex items-center justify-between border cursor-pointer ${
                          currentTrack?.id === track.id
                            ? 'bg-[#854D27] border-[#D4B08C] text-[#FFF9F3] font-bold'
                            : 'bg-black/20 border-[#D4B08C]/30 text-[#FFF9F3]/80 hover:bg-black/30'
                        }`}
                      >
                        <span className="truncate">{track.title}</span>
                        {currentTrack?.id === track.id && isPlaying && (
                          <Volume2 className="w-4 h-4 text-[#E5A93C] animate-pulse flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* タブ3: 13テーマ切替 */}
              {activeTab === 'themes' && (
                <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto p-1">
                  {VISUAL_THEME_KEYS.map((themeKey) => {
                    const isCurrent = currentTheme === themeKey
                    const themeName = getThemeDisplayName(themeKey as ThemeName, language)
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey as ThemeName)}
                        className={`p-2 text-xs font-bold font-body flex items-center gap-2 border cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#854D27] border-[#D4B08C] text-[#FFF9F3] shadow-[2px_2px_0_#D4B08C]'
                            : 'bg-[#2D1B11] border-[#D4B08C]/40 text-[#FFF9F3]/80 hover:bg-[#854D27]/50'
                        }`}
                      >
                        <Palette className={`w-4 h-4 ${isCurrent ? 'text-[#E5A93C]' : 'text-[#D4B08C]/60'}`} />
                        <span className="truncate">{themeName}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ユーティリティ行（言語切替 ＋ 共有） */}
              <div className="pt-3 border-t border-[#D4B08C]/30 flex items-center justify-between gap-3">
                {/* 言語切替ボタン */}
                <button
                  onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
                  className="flex-1 py-2 px-3 bg-[#2D1B11] border border-[#D4B08C] text-[#FFF9F3] flex items-center justify-center gap-2 text-xs font-bold font-body cursor-pointer active:translate-y-0.5"
                >
                  <Globe className="w-4 h-4 text-[#E5A93C]" />
                  <span>{language === 'ja' ? 'English に切替' : '日本語に切替'}</span>
                </button>

                {/* 共有ボタン */}
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 bg-[#854D27] border border-[#D4B08C] text-[#FFF9F3] flex items-center justify-center gap-2 text-xs font-bold font-body cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0_#D4B08C]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'ja' ? 'Webを共有' : 'Share Web'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 伝統和風レトロ文具調 メインボトムナビゲーションバー（5大主要アクション） */}
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

          {/* 2. 祝言（お祝いメッセージ送信） */}
          <button
            onClick={() => openModal('message')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('sendMessage')}
          >
            <Icon name="Gift" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '祝言' : 'Wishes'}
            </span>
          </button>

          {/* 3. 寄せ書き（掲示板） */}
          <button
            onClick={() => openModal('bulletin')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('bulletinBoard')}
          >
            <Icon name="ClipboardList" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '寄せ書き' : 'Board'}
            </span>
          </button>

          {/* 4. グループチャット */}
          <button
            onClick={() => openModal('chat')}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:translate-y-0.5 transition-transform cursor-pointer"
            aria-label={t('groupChat')}
          >
            <Icon name="MessageCircle" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '談話' : 'Chat'}
            </span>
          </button>

          {/* 5. 全機能メニュー（想い出の抽斗） */}
          <button
            ref={menuToggleRef}
            onClick={() => setShowMasterDrawer(!showMasterDrawer)}
            aria-expanded={showMasterDrawer}
            aria-controls={drawerId}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[50px] px-1 py-1 ${showMasterDrawer ? 'bg-[#854D27] text-[#E5A93C]' : 'text-[#FFF9F3]'} hover:text-[#E5A93C] active:translate-y-0.5 transition-all cursor-pointer`}
            aria-label={language === 'ja' ? '全機能メニュー' : 'All Features'}
          >
            <Icon name="Gamepad" size={20} />
            <span className="text-[10px] font-bold tracking-tight mt-1 font-body">
              {language === 'ja' ? '全機能' : 'Menu'}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
