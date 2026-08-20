'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { useMusicPlayer } from '@/lib/hooks/useMusicPlayer'
import { Icon } from './Icon'

export function MusicPlayer() {
  const { t } = useLanguage()
  const { isPlaying, currentTrack, tracks, toggle, selectTrack, nextTrack, prevTrack } = useMusicPlayer()
  const [showSelector, setShowSelector] = useState(false)

  return (
    <div
      className="music-player"
      style={{
        background: 'rgba(255, 249, 243, 0.95)',
        border: '2px solid #D4B08C',
        borderRadius: 0,
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '4px 4px 0 #D4B08C',
        fontFamily: 'var(--font-body)',
        position: 'relative',
      }}
    >
      {/* 前の曲ボタン */}
      <button
        onClick={prevTrack}
        style={{
          width: '32px',
          height: '32px',
          background: 'transparent',
          color: '#854D27',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, opacity 0.2s, filter 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.filter = 'brightness(1.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
          e.currentTarget.style.filter = 'brightness(0.9)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.filter = 'brightness(1.2)'
        }}
      >
        <Icon name="SkipBack" size={22} />
      </button>

      {/* 再生/一時停止ボタン */}
      <button
        onClick={toggle}
        style={{
          width: '42px',
          height: '42px',
          background: '#854D27',
          color: '#FFF9F3',
          border: '2px solid #D4B08C',
          borderRadius: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2em',
          boxShadow: '2px 2px 0 #D4B08C',
          transition: 'transform 0.2s, box-shadow 0.2s, filter 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-2px, -2px)'
          e.currentTarget.style.boxShadow = '4px 4px 0 #D4B08C'
          e.currentTarget.style.filter = 'brightness(1.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)'
          e.currentTarget.style.boxShadow = '2px 2px 0 #D4B08C'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)'
          e.currentTarget.style.boxShadow = '1px 1px 0 #D4B08C'
          e.currentTarget.style.filter = 'brightness(0.95)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translate(-2px, -2px)'
          e.currentTarget.style.boxShadow = '4px 4px 0 #D4B08C'
          e.currentTarget.style.filter = 'brightness(1.15)'
        }}
      >
        <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} />
      </button>

      {/* 次の曲ボタン */}
      <button
        onClick={nextTrack}
        style={{
          width: '32px',
          height: '32px',
          background: 'transparent',
          color: '#854D27',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, opacity 0.2s, filter 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.filter = 'brightness(1.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)'
          e.currentTarget.style.filter = 'brightness(0.9)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)'
          e.currentTarget.style.filter = 'brightness(1.2)'
        }}
      >
        <Icon name="SkipForward" size={22} />
      </button>

      <span
        className="song-title"
        style={{
          color: '#854D27',
          fontSize: '0.95em',
          fontWeight: 500,
          maxWidth: '150px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {currentTrack?.name || t('birthdaySong') || '曲を選択'}
      </span>

      <button
        onClick={() => setShowSelector(!showSelector)}
        style={{
          padding: '8px 15px',
          background: showSelector ? 'rgba(212, 176, 140, 0.3)' : 'transparent',
          color: '#854D27',
          border: '2px solid #D4B08C',
          borderRadius: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: '0.85em',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          transition: 'background 0.3s, filter 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(1.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'brightness(1)'
        }}
      >
        <Icon name="Music" size={20} />
        <span>{t('selectMusic') || '音楽を選択'}</span>
      </button>

      {/* トラック選択ドロップダウン（プレイヤーの上に絶対配置） */}
      {showSelector && (
        <div
          className="track-selector-dropdown"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '6px',
            minWidth: '260px',
            maxWidth: '90vw',
            background: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: '6px',
            padding: '8px 10px',
            boxShadow: '0 -4px 12px rgba(133, 77, 39, 0.25)',
            maxHeight: '180px',
            overflowY: 'auto',
            zIndex: 10002,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #D4B08C' }}>
            <span style={{ color: '#854D27', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="Music" size={14} /> {t('selectMusic') || '曲を選択'}
            </span>
            <button
              onClick={() => setShowSelector(false)}
              style={{
                background: '#854D27',
                border: 'none',
                color: '#FFF9F3',
                cursor: 'pointer',
                fontSize: '0.75rem',
                padding: '3px 6px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="X" size={14} />
            </button>
          </div>
          {tracks.length === 0 ? (
            <p style={{ color: '#854D27', opacity: 0.6, fontSize: '0.65rem', textAlign: 'center', margin: '6px 0' }}>
              まだ曲がありません
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => {
                    selectTrack(track.id)
                    setShowSelector(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    background: currentTrack?.id === track.id ? 'rgba(212, 176, 140, 0.4)' : 'transparent',
                    border: currentTrack?.id === track.id ? '1px solid #854D27' : '1px solid #D4B08C',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    color: '#854D27',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-body)',
                    textAlign: 'left',
                  }}
                >
                  <Icon name={currentTrack?.id === track.id && isPlaying ? 'Volume' : 'Music'} size={12} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
