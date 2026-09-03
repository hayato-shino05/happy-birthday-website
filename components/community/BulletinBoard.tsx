'use client'

import { useState } from 'react'
import { usePosts, Post } from '@/lib/hooks/usePosts'
import { Icon } from '@/components/ui/Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import BulletinPost from './BulletinPost'
import PostDetail from './PostDetail'

export default function BulletinBoard() {
  const { t } = useLanguage()
  const { posts, loading, error, refetch, likePost } = usePosts()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div
          className="animate-spin"
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #D4B08C',
            borderTopColor: '#854D27',
            borderRadius: '50%',
            margin: '0 auto',
          }}
        />
        <p style={{ marginTop: '16px', color: '#854D27' }}>{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#dc3545', marginBottom: '16px' }}>{error}</p>
        <button
          onClick={refetch}
          style={{
            padding: '10px 20px',
            background: '#854D27',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '3px 3px 0 #D4B08C',
          }}
        >
          {t('retry')}
        </button>
      </div>
    )
  }

  if (selectedPost) {
    return (
      <PostDetail
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        onLike={likePost}
      />
    )
  }

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon name="ClipboardList" size={24} style={{ color: '#2D8CFF' }} />
          <h3 style={{ color: '#854D27', margin: 0, fontSize: '1.2rem' }}>
            {t('bulletinMessagesCount', { count: posts.length })}
          </h3>
        </div>
      </div>

      {/* 投稿グリッド */}
      {posts.length === 0 ? (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'rgba(212, 176, 140, 0.1)',
            borderRadius: '8px',
          }}
        >
          <Icon name="Mail" size={48} style={{ color: '#E91E63', display: 'block', margin: '0 auto 16px' }} />
          <p style={{ color: '#854D27', opacity: 0.7 }}>
            {t('noBulletinMessages')}
          </p>
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          {posts.map((post) => (
            <BulletinPost
              key={post.id}
              post={post}
              onLike={likePost}
              onReply={() => setSelectedPost(post)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
