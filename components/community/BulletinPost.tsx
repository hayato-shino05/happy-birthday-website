'use client'

import { Post } from '@/lib/hooks/usePosts'

interface BulletinPostProps {
  post: Post
  onReply?: () => void
}

export default function BulletinPost({ post, onReply }: BulletinPostProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    const fullDate = date.toLocaleString('ja-JP', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    let relative = ''
    if (minutes < 1) relative = 'たった今'
    else if (minutes < 60) relative = `${minutes}分前`
    else if (hours < 24) relative = `${hours}時間前`
    else if (days < 7) relative = `${days}日前`

    return relative ? `${relative} • ${fullDate}` : fullDate
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
            <img
              src={post.media_url}
              alt="添付メディア"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      )}

      {onReply && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingTop: '12px',
            borderTop: '1px solid #D4B08C',
            color: '#854D27',
            fontSize: '0.85rem',
          }}
        >
          <span>💬</span>
          <span>{post.replies_count || 0}</span>
        </div>
      )}
    </div>
  )
}
