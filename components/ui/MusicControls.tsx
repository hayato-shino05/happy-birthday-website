'use client'

import { Icon } from './Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface MusicControlsProps {
  isPlaying: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
  onPrev?: () => void
  onNext?: () => void
  showPrevNext?: boolean
}

export default function MusicControls({
  isPlaying,
  volume,
  onToggle,
  onVolumeChange,
  onPrev,
  onNext,
  showPrevNext = false,
}: MusicControlsProps) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-3">
      {/* 前の曲ボタン */}
      {showPrevNext && onPrev && (
        <button
          onClick={onPrev}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label={t('previousTrack')}
        >
          <Icon name="SkipBack" size={16} />
        </button>
      )}

      {/* 再生/一時停止ボタン */}
      <button
        onClick={onToggle}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
          aria-label={isPlaying ? t('pause') : t('play')}
      >
        <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
      </button>

      {/* 次の曲ボタン */}
      {showPrevNext && onNext && (
        <button
          onClick={onNext}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label={t('nextTrack')}
        >
          <Icon name="SkipForward" size={16} />
        </button>
      )}

      {/* 音量コントロール */}
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          aria-label={volume === 0 ? t('unmute') : t('mute')}
        >
          <Icon name={volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'} size={16} />
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          aria-label={t('volume')}
        />
      </div>
    </div>
  )
}
