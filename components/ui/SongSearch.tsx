'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'
import { JAPAN_PRESET_TRACKS } from '@/lib/music/presets'
import type { SearchTrack } from '@/lib/music/types'

interface SongSearchProps {
  value?: string
  onChange: (trackId: string) => void
}

export default function SongSearch({ value, onChange }: SongSearchProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchTrack[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const listboxId = useId()

  const stopPreview = useCallback(() => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    setPreviewId(null)
    setIsPlaying(false)
  }, [])

  useEffect(() => stopPreview, [stopPreview])

  const togglePreview = async (track: SearchTrack) => {
    if (previewId === track.reference && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(stopPreview)
      }
      return
    }

    try {
      const response = await fetch(`/api/music/resolve?ref=${encodeURIComponent(track.reference)}`)
      const payload = (await response.json()) as { data?: { streamUrl?: string } }
      if (!response.ok || !payload.data?.streamUrl) throw new Error('music resolve failed')
      const audio = audioRef.current ?? new Audio()
      audioRef.current = audio
      audio.onended = stopPreview
      audio.onerror = stopPreview
      audio.src = payload.data.streamUrl
      audio.load()
      setPreviewId(track.reference)
      audio.play().then(() => setIsPlaying(true)).catch(stopPreview)
    } catch {
      setError(t('songSearchFailed'))
      stopPreview()
    }
  }

  const runSearch = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    setIsLoading(true)
    setError(null)
    setResults(null)
    setActiveIndex(-1)
    stopPreview()
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(trimmedQuery)}&limit=20`)
      const payload = (await response.json()) as { data?: SearchTrack[]; error?: string }
      if (!response.ok || payload.error) throw new Error('music search failed')
      setResults(payload.data ?? [])
    } catch {
      setError(t('songSearchFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const tracks = results ?? JAPAN_PRESET_TRACKS
  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--'
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
  }

  const optionId = (reference: string) => `${listboxId}-option-${reference.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  const activeOptionId = activeIndex >= 0 && tracks[activeIndex] ? optionId(tracks[activeIndex].reference) : undefined

  const moveActive = useCallback((delta: number) => {
    setActiveIndex((current) => {
      if (tracks.length === 0) return -1
      if (current < 0) return delta > 0 ? 0 : tracks.length - 1
      const next = (current + delta + tracks.length) % tracks.length
      return next
    })
  }, [tracks.length])

  const handleListboxKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (tracks.length === 0) return
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveActive(1)
        return
      case 'ArrowUp':
        event.preventDefault()
        moveActive(-1)
        return
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        return
      case 'End':
        event.preventDefault()
        setActiveIndex(tracks.length - 1)
        return
      case 'Enter':
      case ' ': {
        const target = activeIndex >= 0 ? tracks[activeIndex] : tracks[0]
        if (target) {
          event.preventDefault()
          onChange(target.reference)
        }
        return
      }
      default:
        return
    }
  }

  return (
    <section aria-labelledby="song-search-title" style={{ marginBottom: '15px' }}>
      <p id="song-search-title" style={{ fontSize: '0.8rem', color: '#854D27', marginBottom: '6px', fontWeight: 600 }}>
        {t('selectSong')}
      </p>
      <form onSubmit={runSearch} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <label htmlFor="song-search-input" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          {t('songSearchPlaceholder')}
        </label>
        <input
          id="song-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('songSearchPlaceholder')}
          style={{ flex: 1, minWidth: 0, minHeight: '44px', padding: '10px 12px', border: '2px solid #D4B08C', background: '#FFF9F3', color: '#2C1810', fontFamily: 'var(--font-body)', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={isLoading || !query.trim()} style={{ minHeight: '44px', padding: '10px 16px', border: '2px solid #D4B08C', background: isLoading ? '#999' : '#854D27', color: '#FFF9F3', cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icon name="Search" size={16} />
          {isLoading ? t('loading') : t('songSearchButton')}
        </button>
      </form>

      {error && <p role="alert" style={{ fontSize: '0.8rem', color: '#dc3545', marginBottom: '8px' }}>{error}</p>}
      {!isLoading && results !== null && <p style={{ fontSize: '0.75rem', color: '#854D27', marginBottom: '6px' }}>{results.length ? t('searchResultsTitle') : t('songNotFound')}</p>}
      {!results && <p style={{ fontSize: '0.7rem', color: '#8a6a4d', margin: '0 0 6px' }}>{t('presetSongsHint')}</p>}

      <div
        id={listboxId}
        role="listbox"
        aria-label={t('selectSong')}
        aria-activedescendant={activeOptionId}
        tabIndex={0}
        onKeyDown={handleListboxKeyDown}
        style={{ maxHeight: '280px', overflowY: 'auto', border: '2px solid rgba(212, 176, 140, 0.4)' }}
      >
        {tracks.map((track, index) => {
          const selected = track.reference === value
          const previewing = track.reference === previewId
          const isActive = index === activeIndex
          return (
            <div
              key={track.reference}
              id={optionId(track.reference)}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => setActiveIndex(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderBottom: '1px solid rgba(212, 176, 140, 0.25)',
                background: isActive
                  ? 'rgba(133, 77, 39, 0.12)'
                  : selected
                    ? 'rgba(212, 176, 140, 0.18)'
                    : 'transparent',
                outline: 'none',
              }}
            >
              {track.albumImage && <span aria-hidden="true" style={{ width: 40, height: 40, flexShrink: 0, backgroundImage: `url(${track.albumImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />}
              <button type="button" onClick={() => togglePreview(track)} aria-label={previewing && isPlaying ? t('pause') : t('play')} style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', border: '2px solid #D4B08C', background: '#854D27', color: '#FFF9F3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={previewing && isPlaying ? 'Pause' : 'Play'} size={16} />
              </button>
              <button type="button" onClick={() => onChange(track.reference)} aria-pressed={selected} style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-body)', color: '#2C1810' }}>
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', fontWeight: selected ? 700 : 500 }}>{track.name}</span>
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#6b4a2f' }}>{track.artistName}</span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#8a6a4d' }}>{track.licenseUrl?.includes('by-sa') ? 'CC BY-SA' : 'CC BY'} · {formatDuration(track.duration)}</span>
              </button>
              {selected && <span style={{ flexShrink: 0, fontSize: '0.72rem', color: '#854D27', fontWeight: 700 }}>{t('songSelected')}</span>}
              {track.sourceUrl && <a href={track.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t('attributionSource')}: ${track.name}`} style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#854D27', fontSize: '0.7rem' }}>{t('attributionSource')}</a>}
            </div>
          )
        })}
        {!isLoading && tracks.length === 0 && <p style={{ padding: '16px', textAlign: 'center', color: '#854D27' }}>{t('songNotFound')}</p>}
      </div>
      {value && <button type="button" onClick={() => { onChange(''); stopPreview() }} style={{ marginTop: '8px', minHeight: '44px', padding: '6px 12px', border: '1px solid #D4B08C', background: 'transparent', color: '#854D27', cursor: 'pointer' }}>{t('songClear')}</button>}
    </section>
  )
}
