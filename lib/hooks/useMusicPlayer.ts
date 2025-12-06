'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export interface Track {
  id: string
  name: string
  url: string
  duration?: number
  category?: string
}

const DEFAULT_TRACKS: Track[] = [
  { id: 'happy-birthday', name: 'Happy Birthday', url: '/audio/happy-birthday.mp3', category: 'Birthday' },
]

interface UseMusicPlayerReturn {
  isPlaying: boolean
  currentTrack: Track | null
  currentTrackIndex: number
  volume: number
  tracks: Track[]
  currentTime: number
  duration: number
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  selectTrack: (trackId: string) => void
  nextTrack: () => void
  prevTrack: () => void
  seekTo: (time: number) => void
  addTrack: (track: Track) => void
  removeTrack: (trackId: string) => void
  autoPlayOnBirthday: (isBirthday: boolean) => void
}

export function useMusicPlayer(customTracks?: Track[]): UseMusicPlayerReturn {
  const [tracks, setTracks] = useState<Track[]>(customTracks || DEFAULT_TRACKS)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [volume, setVolumeState] = useState(0.5)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentTrack = tracks[currentTrackIndex] || null

  // オーディオ要素を初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume

      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
      })

      audioRef.current.addEventListener('ended', () => {
        // 次のトラックを自動再生
        setCurrentTrackIndex(prev => (prev + 1) % tracks.length)
      })

      // オーディオ読み込みエラーを静かに処理
      audioRef.current.addEventListener('error', () => {
        // オーディオファイルが見つからない - 静かに無視
        setIsPlaying(false)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // トラックが変更されたらオーディオソースを更新
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const wasPlaying = isPlaying
      audioRef.current.src = currentTrack.url
      audioRef.current.load()

      if (wasPlaying) {
        audioRef.current.play().catch(() => {
          setIsPlaying(false)
        })
      }
    }
  }, [currentTrackIndex, currentTrack?.url])

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    }
  }, [currentTrack])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  const selectTrack = useCallback((trackId: string) => {
    const index = tracks.findIndex(t => t.id === trackId)
    if (index !== -1) {
      setCurrentTrackIndex(index)
      setIsPlaying(true)
    }
  }, [tracks])

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length)
  }, [tracks.length])

  const prevTrack = useCallback(() => {
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length)
  }, [tracks.length])

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const addTrack = useCallback((track: Track) => {
    setTracks(prev => [...prev, track])
  }, [])

  const removeTrack = useCallback((trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId))
  }, [])

  const autoPlayOnBirthday = useCallback((isBirthday: boolean) => {
    if (isBirthday && !isPlaying) {
      play()
    }
  }, [isPlaying, play])

  return {
    isPlaying,
    currentTrack,
    currentTrackIndex,
    volume,
    tracks,
    currentTime,
    duration,
    play,
    pause,
    toggle,
    setVolume,
    selectTrack,
    nextTrack,
    prevTrack,
    seekTo,
    addTrack,
    removeTrack,
    autoPlayOnBirthday,
  }
}
