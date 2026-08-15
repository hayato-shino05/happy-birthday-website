'use client'

import { useState } from 'react'
import { useVideoMessages, VideoMessage } from '@/lib/hooks/useVideoMessages'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface VideoMessageListProps {
  birthdayPerson?: string
}

function VideoCard({ message }: { message: VideoMessage }) {
  const { locale } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(false)

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
    })
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-colors">
      <div className="relative aspect-video bg-black/50">
        <video
          src={message.video_url}
          controls={isPlaying}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          poster={message.thumbnail_url}
        />

        {!isPlaying && (
          <button
            onClick={() => {
              const video = document.querySelector(`video[src="${message.video_url}"]`) as HTMLVideoElement
              video?.play()
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
          {formatDuration(message.duration)}
        </div>
      </div>

      <div className="p-3">
        <p className="font-medium text-white">{message.sender}</p>
        <p className="text-xs text-white/50">{formatDate(message.created_at)}</p>
      </div>
    </div>
  )
}

export default function VideoMessageList({ birthdayPerson }: VideoMessageListProps) {
  const { t } = useLanguage()
  const { messages, loading, error, refetch } = useVideoMessages(birthdayPerson)

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {t('videoWishesCount', { count: messages.length })}
      </h3>

      {messages.length === 0 ? (
        <p className="text-white/60 text-center py-4">
          {t('noVideoWishes')}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((message) => (
            <VideoCard key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  )
}
