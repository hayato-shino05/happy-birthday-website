'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'
import type { ResolvedTrack } from '@/lib/music/types'

interface MusicCommentProps {
  trackReference: string
}

const sectionStyle: React.CSSProperties = {
  marginTop: '12px',
  padding: '12px',
  border: '1px solid rgba(212, 176, 140, 0.55)',
  borderRadius: '6px',
  background: 'linear-gradient(135deg, rgba(255, 249, 243, 0.85), rgba(212, 176, 140, 0.18))',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: 0,
}

const playButtonStyle: React.CSSProperties = {
  flexShrink: 0,
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  border: '2px solid #854D27',
  background: '#854D27',
  color: '#FFF9F3',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '2px 2px 0 #D4B08C',
}

const disabledPlayButtonStyle: React.CSSProperties = {
  ...playButtonStyle,
  cursor: 'wait',
  opacity: 0.75,
}

const trackMetaStyle: React.CSSProperties = {
  minWidth: 0,
  flex: 1,
}

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: '#2C1810',
  fontSize: '0.9rem',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const artistStyle: React.CSSProperties = {
  margin: '2px 0 0',
  color: '#6b4a2f',
  fontSize: '0.75rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const pendingTitleStyle: React.CSSProperties = {
  ...titleStyle,
  color: '#854D27',
  opacity: 0.75,
  fontWeight: 500,
}

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '2px 8px',
  marginBottom: '4px',
  borderRadius: '999px',
  background: 'rgba(133, 77, 39, 0.12)',
  color: '#854D27',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
}

const errorStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#a52a2a',
  fontSize: '0.78rem',
}

const sourceLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '6px',
  color: '#854D27',
  fontSize: '0.72rem',
  textDecoration: 'underline',
}

function isResolvedTrack(value: unknown): value is ResolvedTrack {
  if (!value || typeof value !== 'object') return false
  const track = value as Record<string, unknown>
  return typeof track.streamUrl === 'string' && track.streamUrl.startsWith('https://')
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function MusicComment({ trackReference }: MusicCommentProps) {
  const { t } = useLanguage()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState<ResolvedTrack | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => () => {
    audioRef.current?.pause()
  }, [])

  const handleToggle = async () => {
    if (isResolving) return
    if (track && audioRef.current) {
      setIsPlaying((current) => !current)
      return
    }
    setIsResolving(true)
    setError(null)
    try {
      const response = await fetch(`/api/music/resolve?ref=${encodeURIComponent(trackReference)}`)
      const payload = (await response.json().catch(() => null)) as { data?: unknown } | null
      if (!response.ok || !isResolvedTrack(payload?.data)) throw new Error('music resolution failed')
      setTrack(payload.data)
      setIsPlaying(true)
    } catch {
      setError(t('songSearchFailed'))
    } finally {
      setIsResolving(false)
    }
  }

  const buttonLabel = isResolving
    ? t('loading')
    : isPlaying
      ? t('pause')
      : t('play')
  const buttonStyle = isResolving ? disabledPlayButtonStyle : playButtonStyle
  const showResolvedMeta = track !== null

  return (
    <section
      aria-label={t('music')}
      style={sectionStyle}
    >
      <div style={rowStyle}>
        <button
          type="button"
          onClick={() => void handleToggle()}
          disabled={isResolving}
          aria-label={buttonLabel}
          aria-pressed={isPlaying}
          style={buttonStyle}
        >
          <Icon
            name={isResolving ? 'Volume' : isPlaying ? 'Pause' : 'Play'}
            size={18}
          />
        </button>
        <div style={trackMetaStyle}>
          <span style={badgeStyle}>
            <Icon name="Music" size={12} />
            {t('music')}
          </span>
          {showResolvedMeta ? (
            <>
              <p style={titleStyle} title={track.name}>{track.name}</p>
              {track.artistName && (
                <p style={artistStyle} title={track.artistName}>
                  {track.artistName}
                  {track.duration ? ` · ${formatDuration(track.duration)}` : ''}
                </p>
              )}
              {track.sourceUrl && (
                <a
                  href={track.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={sourceLinkStyle}
                >
                  {t('attributionSource')}
                </a>
              )}
            </>
          ) : (
            <p style={pendingTitleStyle} title={trackReference}>
              {trackReference}
            </p>
          )}
        </div>
      </div>
      {track && (
        <audio
          ref={audioRef}
          preload="none"
          src={track.streamUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false)
            setError(t('songSearchFailed'))
          }}
        >
          <track kind="captions" />
        </audio>
      )}
      {error && (
        <p role="status" style={errorStyle}>{error}</p>
      )}
    </section>
  )
}