'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'

// DBカラム: id (uuid), sender, message, gift_id, media_url, likes, created_at
export interface Post {
  id: string
  sender: string
  message: string
  gift_id?: string
  media_url?: string
  likes: number
  created_at: string
  replies_count?: number
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      
      // 返信数を含む投稿を取得
      const { data, error: fetchError } = await supabase
        .from('bulletin_posts')
        .select('*, post_replies(count)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      // replies_count を含むようにデータを変換し、ネストされたオブジェクトを削除
      const postsWithReplies = (data || []).map(post => ({
        ...post,
        replies_count: post.post_replies?.[0]?.count || 0,
        post_replies: undefined,
      }))
      
      setPosts(postsWithReplies)
    } catch (err) {
      console.error('投稿取得エラー:', err)
      setError('投稿を読み込めません')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createPost = useCallback(async (sender: string, message: string, giftId?: string, mediaUrl?: string) => {
    try {
      const supabase = getSupabase()
      const { data, error: createError } = await supabase
        .from('bulletin_posts')
        .insert({
          sender,
          message,
          gift_id: giftId || null,
          media_url: mediaUrl || null,
          likes: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error('投稿作成エラー:', createError)
        throw createError
      }
      
      setPosts(prev => [data, ...prev])
      return true
    } catch (err) {
      console.error('投稿作成中のエラー:', err)
      return false
    }
  }, [])

  const likePost = useCallback(async (postId: string) => {
    try {
      const supabase = getSupabase()
      const post = posts.find(p => p.id === postId)
      if (!post) return false

      const { error: updateError } = await supabase
        .from('bulletin_posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId)

      if (updateError) throw updateError
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ))
      return true
    } catch {
      return false
    }
  }, [posts])

  const deletePost = useCallback(async (postId: string) => {
    try {
      const supabase = getSupabase()
      const { error: deleteError } = await supabase
        .from('bulletin_posts')
        .delete()
        .eq('id', postId)

      if (deleteError) throw deleteError
      setPosts(prev => prev.filter(p => p.id !== postId))
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    likePost,
    deletePost,
  }
}
