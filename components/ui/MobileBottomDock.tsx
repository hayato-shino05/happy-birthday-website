'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useUIStore } from '@/lib/stores/uiStore'
import { useMusicPlayer } from '@/lib/hooks/useMusicPlayer'
import { buildLineShareUrl } from '@/lib/share'
import { Icon } from './Icon'

// テーマインジケーターと同等の優美な角丸（カプセル・ピル形状）を持つモバイルナビゲーション
export function MobileBottomDock() {
  const { t } = useLanguage()
  const { openModal } = useUIStore()
  const { isPlaying, currentTrack, tracks, toggle, selectTrack, nextTrack, prevTrack } = useMusicPlayer()
  const [showMenuSheet, setShowMenuSheet] = useState(false)
  const [showMusicList, setShowMusicList] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const menuId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // Escapeキーでメニューを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMenuSheet) {
        setShowMenuSheet(false)
        setShowShareOptions(false)
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

  // PC（SocialButtons.tsx）と完全同一のSNSシェア処理
  const handleShare = async (platform: string) => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareText = `${t('happyBirthday')} 🎂🎉`

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'width=600,height=400')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400')
        break
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank')
        break
      case 'line':
        window.open(buildLineShareUrl(t('happyBirthday'), shareText, shareUrl), '_blank')
        break
      case 'copy':
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(shareUrl)
            alert(t('linkCopied'))
            return
          } catch {
          }
        }
        window.prompt(t('copyLinkPrompt'), shareUrl)
        break
    }
  }

  return (
    <>
      {/* 1. モバイル用ミュージックプレイヤー（優雅な角丸カプセルバー） */}
      <div className="fixed bottom-[74px] inset-x-3 max-w-md mx-auto z-30 md:hidden">
        <div
          style={{
            background: 'rgba(255, 249, 243, 0.98)',
            border: '2px solid #D4B08C',
            borderRadius: '22px',
            boxShadow: '0 4px 14px rgba(133, 77, 39, 0.25)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-body)',
          }}
        >
          {/* 曲名 ＆ 楽曲リスト開閉ボタン */}
          <button
            onClick={() => setShowMusicList(!showMusicList)}
            className="flex items-center gap-2 text-left cursor-pointer flex-1 min-w-0 mr-2 min-h-[44px]"
            aria-label={t('selectMusic')}
          >
            <div
              style={{ borderRadius: '10px' }}
              className={`w-7 h-7 bg-[#854D27] text-[#FFF9F3] border border-[#D4B08C] flex items-center justify-center flex-shrink-0 ${isPlaying ? 'animate-pulse' : ''}`}
            >
              <Icon name="Music" size={18} />
            </div>
            <div className="truncate">
              <span className="text-[11px] font-bold text-[#854D27] block truncate">
                {currentTrack?.name || t('birthdaySong')}
              </span>
            </div>
          </button>

          {/* 前の曲・再生/停止・次の曲 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* 前の曲 */}
            <button
              onClick={prevTrack}
              className="min-w-[44px] min-h-[44px] bg-transparent hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer transition-transform"
              aria-label={t('previousTrack')}
            >
              <Icon name="SkipBack" size={20} />
            </button>

            {/* 再生 / 一時停止 */}
            <button
              onClick={toggle}
              style={{ borderRadius: '12px' }}
              className="min-w-[44px] min-h-[44px] bg-[#854D27] text-[#FFF9F3] border border-[#D4B08C] shadow-[1px_1px_0_#D4B08C] flex items-center justify-center active:translate-y-0.5 cursor-pointer"
              aria-label={isPlaying ? t('pause') : t('play')}
            >
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
            </button>

            {/* 次の曲 */}
            <button
              onClick={nextTrack}
              className="min-w-[44px] min-h-[44px] bg-transparent hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer transition-transform"
              aria-label={t('nextTrack')}
            >
              <Icon name="SkipForward" size={20} />
            </button>
          </div>
        </div>

        {/* 楽曲選択ドロップダウン */}
        <AnimatePresence>
          {showMusicList && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              style={{ borderRadius: '16px' }}
              className="mt-2 p-2.5 bg-[#FFF9F3] border-2 border-[#D4B08C] shadow-[0_6px_20px_rgba(133,77,39,0.3)] max-h-44 overflow-y-auto"
            >
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    selectTrack(track.id)
                    setShowMusicList(false)
                  }}
                  style={{ borderRadius: '8px' }}
                  className={`w-full min-h-[44px] p-2 mb-1 last:mb-0 text-left text-xs font-body flex items-center justify-between cursor-pointer transition-colors ${
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

      {/* 2. PCのGameButtons & SocialButtons を完全統合したメニューシート */}
      <AnimatePresence>
        {showMenuSheet && (
          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={t('gamesAndSocial')}
            className="fixed inset-0 z-50 md:hidden flex flex-col justify-end"
          >
            {/* 背景オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowMenuSheet(false)
                setShowShareOptions(false)
                menuBtnRef.current?.focus()
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* シート本体（上品な角丸設計） */}
            <motion.div
              ref={menuRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative z-10 mx-3 mb-20 p-4 bg-[#FFF9F3] border-2 border-[#D4B08C] text-[#854D27] max-h-[80vh] overflow-y-auto"
              style={{
                borderRadius: '24px 24px 16px 16px',
                boxShadow: '0 -8px 28px rgba(133, 77, 39, 0.35), 0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#D4B08C]">
                <div className="flex items-center gap-2">
                  <Icon name="Gamepad" size={22} />
                  <span className="font-bold text-sm font-body tracking-wider text-[#854D27]">
                    {t('gamesAndSocial')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    setShowShareOptions(false)
                    menuBtnRef.current?.focus()
                  }}
                  style={{ borderRadius: '12px' }}
                  className="min-w-[44px] min-h-[44px] bg-[#854D27] text-[#FFF9F3] border border-[#D4B08C] flex items-center justify-center cursor-pointer active:translate-y-0.5"
                  aria-label={t('close')}
                >
                  <Icon name="X" size={18} />
                </button>
              </div>

              {/* PC GameButtons / 記念機能 と 100% 同一の機能グリッド */}
              <div className="grid grid-cols-2 gap-2.5 mb-3">
                {/* おみくじ */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('omikuji')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Sparkles" size={20} />
                  </div>
                  <span className="truncate">{t('omikujiTitle')}</span>
                </button>

                {/* あの日の思い出 */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('flashback')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Calendar" size={20} />
                  </div>
                  <span className="truncate">{t('flashbackTitle')}</span>
                </button>

                {/* タイムカプセル */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('timeCapsule')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer col-span-2"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Archive" size={20} />
                  </div>
                  <span className="truncate">{t('timeCapsuleTitle')}</span>
                </button>

                {/* 1. 記憶ゲーム (Brain) */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('memoryGame')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Brain" size={20} />
                  </div>
                  <span className="truncate">{t('memoryGame')}</span>
                </button>

                {/* 2. パズル (Puzzle) */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('puzzleGame')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Puzzle" size={20} />
                  </div>
                  <span className="truncate">{t('puzzleGame')}</span>
                </button>

                {/* 3. カレンダー (Calendar) */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('calendar')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Calendar" size={20} />
                  </div>
                  <span className="truncate">{t('birthdayCalendar')}</span>
                </button>

                {/* 4. クイズ (HelpCircle) */}
                <button
                  onClick={() => {
                    setShowMenuSheet(false)
                    openModal('quiz')
                  }}
                  style={{ borderRadius: '14px' }}
                  className="min-h-[48px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center gap-2.5 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 transition-all text-left cursor-pointer"
                >
                  <div style={{ borderRadius: '8px' }} className="w-7 h-7 bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="HelpCircle" size={20} />
                  </div>
                  <span className="truncate">{t('birthdayQuiz')}</span>
                </button>
              </div>

              {/* PC SocialButtons と 100% 同一の「友達を招待 (Users)」ボタン */}
              <div className="border-t border-[#D4B08C]/50 pt-2.5">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  style={{ borderRadius: '14px' }}
                  className="w-full min-h-[46px] p-2.5 bg-[#854D27] hover:bg-[#6D3D1E] text-[#FFF9F3] border-2 border-[#D4B08C] flex items-center justify-center gap-2 text-xs font-bold font-body shadow-[0_2px_8px_rgba(133,77,39,0.3)] active:translate-y-0.5 cursor-pointer"
                >
                  <Icon name="Users" size={22} />
                  <span>{t('inviteFriends')}</span>
                </button>

                {/* PCと全く同一の5大SNSシェアメニュー（Facebook, Twitter, WhatsApp, Telegram, コピー） */}
                {showShareOptions && (
                  <div style={{ borderRadius: '14px' }} className="grid grid-cols-2 gap-2 mt-2 p-2.5 bg-[#FFF9F3] border border-[#D4B08C]">
                    <button
                      onClick={() => handleShare('facebook')}
                      style={{ borderRadius: '8px' }}
                      className="flex items-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span>Facebook</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('line')}
                      aria-label={t('shareOnLine')}
                      style={{ borderRadius: '8px' }}
                      className="flex items-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <span className="font-bold">LINE</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      style={{ borderRadius: '8px' }}
                      className="flex items-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      style={{ borderRadius: '8px' }}
                      className="flex items-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      style={{ borderRadius: '8px' }}
                      className="flex items-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                      <span>Telegram</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      style={{ borderRadius: '8px' }}
                      className="col-span-2 flex items-center justify-center gap-2 min-h-[44px] p-2 bg-white border border-[#D4B08C] text-xs font-body text-[#854D27] cursor-pointer"
                    >
                      <Icon name="Copy" size={18} />
                      <span>{t('copyLink')}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. メイン・モバイルボトムナビゲーションバー（テーマインジケーターと同等の優美な角丸カプセル設計） */}
      <nav
        className="mobile-bottom-dock fixed bottom-2 inset-x-3 max-w-md mx-auto z-40 md:hidden"
        aria-label={t('mobileNavDock')}
      >
        <div
          style={{
            background: '#854D27',
            border: '2px solid #D4B08C',
            borderRadius: '26px',
            boxShadow: '0 4px 16px rgba(133, 77, 39, 0.4), 0 2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 8px',
          }}
        >
          {/* 1. アルバムを見る (PC: Camera) */}
          <button
            onClick={() => openModal('album')}
            style={{ borderRadius: '16px' }}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:scale-95 transition-all cursor-pointer"
            aria-label={t('viewAlbum')}
          >
            <Icon name="Camera" size={22} />
              <span className="text-[10px] font-bold tracking-tight mt-1 font-body text-[#FFF9F3]">
                {t('dockAlbum')}
              </span>
          </button>

          {/* 2. メッセージを送る (PC: PenLine) */}
          <button
            onClick={() => openModal('message')}
            style={{ borderRadius: '16px' }}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:scale-95 transition-all cursor-pointer"
            aria-label={t('sendMessage')}
          >
            <Icon name="PenLine" size={22} />
              <span className="text-[10px] font-bold tracking-tight mt-1 font-body text-[#FFF9F3]">
                {t('dockWishes')}
              </span>
          </button>

          {/* 3. 掲示板 (PC: ClipboardList) */}
          <button
            onClick={() => openModal('bulletin')}
            style={{ borderRadius: '16px' }}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:scale-95 transition-all cursor-pointer"
            aria-label={t('bulletinBoard')}
          >
            <Icon name="ClipboardList" size={22} />
              <span className="text-[10px] font-bold tracking-tight mt-1 font-body text-[#FFF9F3]">
                {t('dockBoard')}
              </span>
          </button>

          {/* 4. グループチャット (PC: MessageCircle) */}
          <button
            onClick={() => openModal('chat')}
            style={{ borderRadius: '16px' }}
            className="flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 text-[#FFF9F3] hover:text-[#E5A93C] active:scale-95 transition-all cursor-pointer"
            aria-label={t('groupChat')}
          >
            <Icon name="MessageCircle" size={22} />
              <span className="text-[10px] font-bold tracking-tight mt-1 font-body text-[#FFF9F3]">
                {t('dockChat')}
              </span>
          </button>

          {/* 5. ゲーム ＆ 共有 (PC: Gamepad) */}
          <button
            ref={menuBtnRef}
            onClick={() => setShowMenuSheet(!showMenuSheet)}
            aria-expanded={showMenuSheet}
            aria-controls={menuId}
            style={{ borderRadius: '16px' }}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[48px] px-1 py-1 ${showMenuSheet ? 'bg-[#6D3D1E] text-[#E5A93C]' : 'text-[#FFF9F3]'} hover:text-[#E5A93C] active:scale-95 transition-all cursor-pointer`}
            aria-label={t('gamesAndSocial')}
          >
            <Icon name="Gamepad" size={22} />
              <span className="text-[10px] font-bold tracking-tight mt-1 font-body text-[#FFF9F3]">
                {t('dockGames')}
              </span>
          </button>
        </div>
      </nav>
    </>
  )
}
