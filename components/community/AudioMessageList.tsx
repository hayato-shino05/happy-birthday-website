'use client'

import { useState, useRef } from 'react'
import { useAudioMessages, AudioMessage } from '@/lib/hooks/useAudioMessages'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface AudioMessageListProps {
  birthdayPerson?: string
}

function AudioPlayer({ message }: { message: AudioMessage }) {
  const { locale } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100
    setProgress(percent)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors">
      <audio
        ref={audioRef}
        src={message.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex items-center gap-4">

        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white hover:scale-105 transition-transform cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>


        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-white">{message.sender}</span>
            <span className="text-xs text-white/50">{formatDuration(message.duration)}</span>
          </div>


          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-white/40 mt-1">{formatDate(message.created_at)}</p>
        </div>
      </div>
    </div>
  )
}

export default function AudioMessageList({ birthdayPerson }: AudioMessageListProps) {
  const { t } = useLanguage()
  const { messages, loading, error, refetch } = useAudioMessages(birthdayPerson)

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <p className="text-red-300 text-center">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-white/20 rounded-lg text-white mx-auto block cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        {t('audioWishesCount', { count: messages.length })}
      </h3>

      {messages.length === 0 ? (
        <p className="text-white/60 text-center py-4">
          {t('noAudioWishes')}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {messages.map((message) => (
            <AudioPlayer key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  )
}
