'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { Post } from '@/lib/hooks/usePosts'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface BulletinPostProps {
  post: Post
  onLike: (postId: string) => Promise<boolean>
  onReply?: () => void
}

export default function BulletinPost({ post, onLike, onReply }: BulletinPostProps) {
  const { locale, t } = useLanguage()
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [localLikes, setLocalLikes] = useState(post.likes)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    // 完全な日時を表示用に整形
    const fullDate = date.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const relative = minutes < 1
      ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'minute')
      : minutes < 60
        ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-minutes, 'minute')
        : hours < 24
          ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-hours, 'hour')
          : days < 7
            ? new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day')
            : ''

    return relative ? `${relative} • ${fullDate}` : fullDate
  }

  const handleLike = async () => {
    if (liked || liking) return

    setLiking(true)
    setLiked(true)
    setLocalLikes(prev => prev + 1)

    try {
      const success = await onLike(post.id)
      if (!success) {
        setLiked(false)
        setLocalLikes(prev => prev - 1)
      }
    } catch {
      setLiked(false)
      setLocalLikes(prev => prev - 1)
    } finally {
      setLiking(false)
    }
  }

  return (
    <div
      style={{
        background: '#FFF9F3',
        border: '2px solid #D4B08C',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '2px 2px 0 #D4B08C',
        cursor: onReply ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onClick={onReply}
      onMouseEnter={(e) => {
        if (onReply) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '4px 4px 0 #D4B08C'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '2px 2px 0 #D4B08C'
      }}
    >

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#854D27',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF9F3',
            fontWeight: 'bold',
            flexShrink: 0,
          }}
        >
          {post.sender?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, color: '#854D27', margin: 0 }}>{post.sender}</p>
          <p style={{ fontSize: '0.75rem', color: '#854D27', opacity: 0.6, margin: 0 }}>
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>


      <p style={{
        color: '#854D27',
        marginBottom: '12px',
        whiteSpace: 'pre-wrap',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {post.message}
      </p>


      {post.media_url && (
        <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', width: '100%' }}>
          {post.media_url.endsWith('.mp4') || post.media_url.endsWith('.webm') || post.media_url.endsWith('.ogg') ? (
            <video
              src={post.media_url}
              style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
              muted
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.media_url}
              alt={t('mediaAlt')}
              loading="lazy"
              decoding="async"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      )}


      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #D4B08C',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleLike}
          disabled={liked || liking}
          aria-label={`${liked ? t('liked') : t('like')} (${localLikes})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: liked ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: liked ? '#E91E63' : '#D4B08C',
            borderRadius: '20px',
            padding: '6px 12px',
            cursor: liked ? 'default' : 'pointer',
            color: liked ? '#E91E63' : '#854D27',
            fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
        >
          <Icon name="Heart" size={18} style={{ color: liked ? '#E91E63' : '#854D27' }} />
          <span>{localLikes}</span>
        </button>

        {onReply && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReply()
            }}
            aria-label={`${t('reply')} (${post.replies_count || 0})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid #D4B08C',
              borderRadius: '20px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: '#854D27',
              fontSize: '0.85rem',
            }}
          >
            <Icon name="MessageCircle" size={18} style={{ color: '#2D8CFF' }} />
            <span>{post.replies_count || 0}</span>
          </button>
        )}
      </div>
    </div>
  )
}
