'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Track {
  id: string
  name: string
  url: string
  duration?: number
}

interface TrackSelectorProps {
  tracks: Track[]
  currentTrackId?: string
  onSelect: (trackId: string) => void
  isPlaying?: boolean
}

export default function TrackSelector({
  tracks,
  currentTrackId,
  onSelect,
  isPlaying = false,
}: TrackSelectorProps) {
  const { t } = useLanguage()
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <h4 className="text-sm font-medium text-white/70 mb-3">{t('chooseSong')}</h4>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {tracks.map((track) => {
          const isActive = track.id === currentTrackId

          return (
            <button
              key={track.id}
              onClick={() => onSelect(track.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              {/* Play indicator / Music icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isActive ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {isActive && isPlaying ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 bg-white rounded-full animate-pulse"
                        style={{
                          height: `${8 + Math.random() * 8}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-white/80'}`}>
                  {track.name}
                </p>
              </div>

              {/* Duration */}
              <span className="text-xs text-white/50 flex-shrink-0">
                {formatDuration(track.duration)}
              </span>
            </button>
          )
        })}
      </div>

      {tracks.length === 0 && (
        <p className="text-white/50 text-sm text-center py-4">
          {t('noTracks')}
        </p>
      )}
    </div>
  )
}
