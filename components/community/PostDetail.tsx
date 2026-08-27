'use client'

import { useState, useEffect, useCallback } from 'react'
import { Post } from '@/lib/hooks/usePosts'
import { Icon } from '@/components/ui/Icon'
import { getSupabase } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface Reply {
  id: string
  post_id: string
  sender: string
  message: string
  created_at: string
}

interface PostDetailProps {
  post: Post
  onBack: () => void
  onLike: (postId: string) => Promise<boolean>
}

export default function PostDetail({ post, onBack, onLike }: PostDetailProps) {
  const { locale, t } = useLanguage()
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [replyName, setReplyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(post.likes)

  // 共有ストレージから自動入力する
  useEffect(() => {
    const savedName = localStorage.getItem('birthday_user_name')
    if (savedName) {
      setReplyName(savedName)
    }
  }, [])

  const fetchReplies = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('post_replies')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (err) {
      console.error('Error fetching replies:', err)
    } finally {
      setLoading(false)
    }
  }, [post.id])

  useEffect(() => {
    fetchReplies()
  }, [fetchReplies])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !replyName.trim()) return

    setSubmitting(true)
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('post_replies')
        .insert({
          post_id: post.id,
          sender: replyName.trim(),
          message: replyText.trim(),
        })
        .select()
        .single()

      if (error) throw error
      setReplies(prev => [...prev, data])
      // 名前を共有ストレージへ保存する
      localStorage.setItem('birthday_user_name', replyName.trim())
      setReplyText('')
    } catch (err) {
      console.error('Error submitting reply:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setLocalLikes(prev => prev + 1)
    const success = await onLike(post.id)
    if (!success) {
      setLiked(false)
      setLocalLikes(prev => prev - 1)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#854D27',
          cursor: 'pointer',
          padding: '0 0 16px 0',
          fontSize: '0.95rem',
        }}
      >
        <Icon name="ArrowLeft" size={18} style={{ color: '#854D27' }} />
        <span>{t('back')}</span>
      </button>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              background: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: '12px',
              padding: '20px',
            }}
          >

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#854D27',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF9F3',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                }}
              >
                {post.sender?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: '#854D27', margin: 0, fontSize: '1.1rem' }}>{post.sender}</p>
                <p style={{ fontSize: '0.8rem', color: '#854D27', opacity: 0.6, margin: 0 }}>
                  {formatDate(post.created_at)}
                </p>
              </div>
            </div>


            <p style={{ color: '#854D27', fontSize: '1.05rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
              {post.message}
            </p>


            {post.media_url && (
              <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                {post.media_url.endsWith('.mp4') || post.media_url.endsWith('.webm') || post.media_url.endsWith('.ogg') ? (
                  <video src={post.media_url} controls style={{ width: '100%', maxHeight: '400px', background: '#000' }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.media_url} alt={t('mediaAlt')} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                )}
              </div>
            )}


            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #D4B08C' }}>
              <button
                onClick={handleLike}
                disabled={liked}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: liked ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: liked ? '#E91E63' : '#D4B08C',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  cursor: liked ? 'default' : 'pointer',
                  color: liked ? '#E91E63' : '#854D27',
                }}
              >
                <Icon name="Heart" size={18} style={{ color: liked ? '#E91E63' : '#854D27' }} />
                <span>{localLikes} {t('liked')}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#854D27', opacity: 0.7 }}>
                <Icon name="MessageCircle" size={18} style={{ color: '#2D8CFF' }} />
                <span>{replies.length} {t('replies')}</span>
              </div>
            </div>
          </div>
        </div>


        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', background: 'rgba(212,176,140,0.1)', borderRadius: '12px', padding: '16px' }}>
          <h4 style={{ color: '#854D27', margin: '0 0 16px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="MessageCircle" size={18} style={{ color: '#2D8CFF' }} />
            {t('replies')} ({replies.length})
          </h4>


          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
            {loading ? (
              <p style={{ color: '#854D27', opacity: 0.6, textAlign: 'center' }}>{t('loading')}</p>
            ) : replies.length === 0 ? (
              <p style={{ color: '#854D27', opacity: 0.6, textAlign: 'center', fontSize: '0.9rem' }}>
                {t('noRepliesPrompt')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {replies.map((reply) => (
                  <div
                    key={reply.id}
                    style={{
                      background: '#FFF9F3',
                      border: '1px solid #D4B08C',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#854D27',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFF9F3',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {reply.sender?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#854D27', margin: 0, fontSize: '0.85rem' }}>{reply.sender}</p>
                        <p style={{ fontSize: '0.7rem', color: '#854D27', opacity: 0.6, margin: 0 }}>
                          {formatDate(reply.created_at)}
                        </p>
                      </div>
                    </div>
                    <p style={{ color: '#854D27', margin: 0, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>


          <form onSubmit={handleSubmitReply} style={{ borderTop: '1px solid #D4B08C', paddingTop: '12px' }}>
            <input
              type="text"
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              placeholder={t('yourName')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D4B08C',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '0.85rem',
                background: '#FFF9F3',
                color: '#854D27',
              }}
            />
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('typeReply')}
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #D4B08C',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '0.85rem',
                resize: 'none',
                background: '#FFF9F3',
                color: '#854D27',
              }}
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim() || !replyName.trim()}
              style={{
                width: '100%',
                padding: '8px 16px',
                background: submitting ? '#999' : '#854D27',
                color: '#FFF9F3',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                opacity: (!replyText.trim() || !replyName.trim()) ? 0.5 : 1,
              }}
            >
              {submitting ? t('sending') : t('sendMessage')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
