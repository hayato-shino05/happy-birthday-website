'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Track } from '@/lib/hooks/useMusicPlayer'

interface MusicState {
  isPlaying: boolean
  currentTrackId: string | null
  volume: number
  isMuted: boolean
  playlist: Track[]
  repeatMode: 'none' | 'one' | 'all'
  shuffle: boolean
  
  // アクション
  setPlaying: (playing: boolean) => void
  setCurrentTrack: (trackId: string | null) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setPlaylist: (tracks: Track[]) => void
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void
  setShuffle: (shuffle: boolean) => void
  
  // プレイヤーアクション
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  toggleMute: () => void
  cycleRepeat: () => void
  toggleShuffle: () => void
  addToPlaylist: (track: Track) => void
  removeFromPlaylist: (trackId: string) => void
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentTrackId: null,
      volume: 0.5,
      isMuted: false,
      playlist: [],
      repeatMode: 'none',
      shuffle: false,

      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTrack: (trackId) => set({ currentTrackId: trackId }),
      setVolume: (volume) => set({ volume }),
      setMuted: (muted) => set({ isMuted: muted }),
      setPlaylist: (tracks) => set({ playlist: tracks }),
      setRepeatMode: (mode) => set({ repeatMode: mode }),
      setShuffle: (shuffle) => set({ shuffle }),

      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

      next: () => {
        const { playlist, currentTrackId, shuffle, repeatMode } = get()
        if (playlist.length === 0) return

        const currentIndex = playlist.findIndex((t) => t.id === currentTrackId)
        let nextIndex: number

        if (shuffle) {
          nextIndex = Math.floor(Math.random() * playlist.length)
        } else if (repeatMode === 'one') {
          nextIndex = currentIndex
        } else {
          nextIndex = (currentIndex + 1) % playlist.length
        }

        set({ currentTrackId: playlist[nextIndex].id })
      },

      prev: () => {
        const { playlist, currentTrackId } = get()
        if (playlist.length === 0) return

        const currentIndex = playlist.findIndex((t) => t.id === currentTrackId)
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
        set({ currentTrackId: playlist[prevIndex].id })
      },

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      cycleRepeat: () => {
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all']
        const currentIndex = modes.indexOf(get().repeatMode)
        const nextIndex = (currentIndex + 1) % modes.length
        set({ repeatMode: modes[nextIndex] })
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

      addToPlaylist: (track) => {
        const { playlist } = get()
        if (!playlist.find((t) => t.id === track.id)) {
          set({ playlist: [...playlist, track] })
        }
      },

      removeFromPlaylist: (trackId) => {
        set({ playlist: get().playlist.filter((t) => t.id !== trackId) })
      },
    }),
    {
      name: 'music-storage',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
      }),
    }
  )
)
