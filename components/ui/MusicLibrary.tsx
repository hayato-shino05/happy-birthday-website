'use client'

import { useState } from 'react'
import { Icon } from './Icon'
import TrackSelector from './TrackSelector'
import MusicControls from './MusicControls'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Track {
  id: string
  name: string
  url: string
  duration?: number
  category?: string
}

interface MusicLibraryProps {
  tracks: Track[]
  currentTrackId?: string
  isPlaying: boolean
  volume: number
  onSelectTrack: (trackId: string) => void
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

export default function MusicLibrary({
  tracks,
  currentTrackId,
  isPlaying,
  volume,
  onSelectTrack,
  onToggle,
  onVolumeChange,
}: MusicLibraryProps) {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // トラックからカテゴリ一覧を抽出
  const categories: string[] = ['all', ...new Set(tracks.map(t => t.category).filter((c): c is string => Boolean(c)))]

  // 選択されたカテゴリでトラックを絞り込む
  const filteredTracks = activeCategory === 'all'
    ? tracks
    : tracks.filter(t => t.category === activeCategory)

  const currentTrack = tracks.find(t => t.id === currentTrackId)

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon name="Music" size={24} />
          {t('musicLibrary')}
        </h3>
      </div>

      {/* 再生中のトラック表示 */}
      {currentTrack && (
        <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4 mb-4 border border-white/10">
          <p className="text-xs text-white/50 mb-1">{t('nowPlaying')}</p>
          <p className="text-white font-medium mb-3">{currentTrack.name}</p>
          <MusicControls
            isPlaying={isPlaying}
            volume={volume}
            onToggle={onToggle}
            onVolumeChange={onVolumeChange}
          />
        </div>
      )}

      {/* カテゴリタブ */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? t('allMedia') : cat}
            </button>
          ))}
        </div>
      )}

      {/* トラック一覧 */}
      <TrackSelector
        tracks={filteredTracks}
        currentTrackId={currentTrackId}
        onSelect={onSelectTrack}
        isPlaying={isPlaying}
      />
    </div>
  )
}
