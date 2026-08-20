'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'

export interface Post {
  id: string
  sender: string
  message: string
  media_object_path: string | null
  media_url?: string
  birthday_person: string | null
  created_at: string
  likes: number
  replies_count?: number
}

type PostRecord = Omit<Post, 'media_url' | 'replies_count' | 'likes'> & {
  likes?: number
  post_replies?: { count: number }[]
}

function toPost(post: PostRecord): Post {
  const { data } = post.media_object_path
    ? getSupabase().storage.from('community-media').getPublicUrl(post.media_object_path)
    : { data: undefined }

  return {
    ...post,
    media_url: data?.publicUrl,
    likes: post.likes ?? 0,
    replies_count: post.post_replies?.[0]?.count ?? 0,
  }
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let queryResult: any = await getSupabase()
        .from('bulletin_posts')
        .select('id, sender, message, media_object_path, birthday_person, created_at, likes, post_replies(count)')
        .order('created_at', { ascending: false })

      if (queryResult.error && (queryResult.error.message?.includes('likes') || queryResult.error.code === '42703')) {
        queryResult = await getSupabase()
          .from('bulletin_posts')
          .select('id, sender, message, media_object_path, birthday_person, created_at, post_replies(count)')
          .order('created_at', { ascending: false })
      }

      if (queryResult.error) throw queryResult.error
      setPosts((queryResult.data ?? []).map((post: any) => toPost(post as PostRecord)))
    } catch (err) {
      console.error('投稿取得エラー:', err)
      setError('投稿を読み込めません')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const createPost = useCallback(async (
    sender: string,
    message: string,
    birthdayPerson?: string,
    mediaObjectPath?: string
  ) => {
    try {
      const { data, error: createError } = await getSupabase()
        .from('bulletin_posts')
        .insert({
          sender,
          message,
          birthday_person: birthdayPerson || null,
          media_object_path: mediaObjectPath || null,
        })
        .select('id, sender, message, media_object_path, birthday_person, created_at')
        .single()

      if (createError) throw createError
      setPosts((prev) => [{ ...toPost(data as PostRecord), replies_count: 0 }, ...prev])
      return true
    } catch (err) {
      console.error('投稿作成中のエラー:', err)
      return false
    }
  }, [])

  const likePost = useCallback(async (postId: string) => {
    const { data: likes, error: likeError } = await getSupabase()
      .rpc('increment_bulletin_post_likes', { p_post_id: postId })

    if (likeError || typeof likes !== 'number') return false

    setPosts((prev) => prev.map((post) => (
      post.id === postId ? { ...post, likes } : post
    )))
    return true
  }, [])

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    likePost,
  }
}
