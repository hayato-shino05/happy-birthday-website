'use client'

import { useState } from 'react'
import { usePosts, Post } from '@/lib/hooks/usePosts'
import { Icon } from '@/components/ui/Icon'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import BulletinPost from './BulletinPost'
import PostDetail from './PostDetail'

const VIDEO_URL_PATTERN = /\.(?:mp4|webm|ogg|mov|avi|mkv)(?:$|[?#])/i
const IMAGE_LOAD_TIMEOUT_MS = 5000

function isVideoUrl(url: string): boolean {
  return VIDEO_URL_PATTERN.test(url)
}

function waitForImage(image: HTMLImageElement): Promise<boolean> {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve(true)

  return new Promise((resolve) => {
    let settled = false
    const settle = (loaded: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      image.removeEventListener('load', onLoad)
      image.removeEventListener('error', onError)
      resolve(loaded)
    }
    const onLoad = () => {
      if (typeof image.decode === 'function') {
        void image.decode().then(() => settle(true)).catch(() => settle(false))
        return
      }
      settle(true)
    }
    const onError = () => settle(false)
    const timeoutId = window.setTimeout(() => settle(false), IMAGE_LOAD_TIMEOUT_MS)

    image.addEventListener('load', onLoad, { once: true })
    image.addEventListener('error', onError, { once: true })
  })
}

export default function BulletinBoard() {
  const { locale, t } = useLanguage()
  const { posts, loading, error, refetch, likePost } = usePosts()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [exportError, setExportError] = useState(false)

  const handleExport = async () => {
    if (posts.length === 0) {
      setExportError(true)
      return
    }

    setExportError(false)
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setExportError(true)
      return
    }

    printWindow.opener = null
    const document = printWindow.document
    document.title = t('bulletinKeepsakeTitle')
    document.head.innerHTML = `<meta charset="utf-8"><style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #854D27; font-family: sans-serif; }
      h1 { margin: 0 0 20px; font-size: 24px; }
      .keepsake-grid { display: grid; gap: 16px; }
      .keepsake-post { break-inside: avoid; border: 2px solid #D4B08C; border-radius: 8px; padding: 16px; }
      .keepsake-sender { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
      .keepsake-date { margin: 0 0 12px; color: #854D27; font-size: 12px; opacity: .7; }
      .keepsake-message { margin: 0; white-space: pre-wrap; }
      .keepsake-media { display: block; width: 100%; max-height: 260px; margin-top: 12px; object-fit: contain; }
      @media print { .keepsake-post { border-color: #999; } }
    </style>`

    try {
      const root = document.createElement('main')
      const title = document.createElement('h1')
      title.textContent = t('bulletinKeepsakeTitle')
      root.append(title)

      const grid = document.createElement('div')
      grid.className = 'keepsake-grid'
      posts.forEach((post) => {
        const article = document.createElement('article')
        article.className = 'keepsake-post'

        const sender = document.createElement('h2')
        sender.className = 'keepsake-sender'
        sender.textContent = post.sender
        article.append(sender)

        const date = document.createElement('p')
        date.className = 'keepsake-date'
        date.textContent = new Date(post.created_at).toLocaleString(locale)
        article.append(date)

        const message = document.createElement('p')
        message.className = 'keepsake-message'
        message.textContent = post.message
        article.append(message)

        if (post.media_url) {
          if (isVideoUrl(post.media_url)) {
            const media = document.createElement('p')
            media.className = 'keepsake-media keepsake-video'
            media.textContent = t('videoMediaLabel')
            article.append(media)
          } else {
            const media = document.createElement('img')
            media.className = 'keepsake-media'
            media.src = post.media_url
            media.alt = t('mediaAlt')
            article.append(media)
          }
        }

        grid.append(article)
      })
      root.append(grid)
      document.body.replaceChildren(root)
      const imagesLoaded = await Promise.all(
        Array.from(document.querySelectorAll('img')).map(waitForImage)
      )
      if (!imagesLoaded.every(Boolean)) throw new Error('Keepsake media failed to load')
      printWindow.focus()
      printWindow.print()
    } catch {
      setExportError(true)
      if (!printWindow.closed) printWindow.close()
    }
  }

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon name="ClipboardList" size={24} style={{ color: '#2D8CFF' }} />
          <h3 style={{ color: '#854D27', margin: 0, fontSize: '1.2rem' }}>
            {t('bulletinMessagesCount', { count: posts.length })}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleExport}
          aria-label={t('bulletinKeepsakeExportAction')}
          style={{
            padding: '8px 14px',
            background: '#FFF9F3',
            color: '#854D27',
            border: '2px solid #D4B08C',
            borderRadius: '20px',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
          }}
        >
          {t('bulletinKeepsakeExportAction')}
        </button>
      </div>
      {exportError && (
        <p role="alert" style={{ color: '#dc3545', marginBottom: '16px' }}>
          {t('bulletinKeepsakeExportError')}
        </p>
      )}

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
