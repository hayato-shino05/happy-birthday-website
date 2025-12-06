'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase/client'

export interface VideoMessage {
  id: number
  sender: string
  video_url: string
  thumbnail_url?: string
  duration: number
  birthday_person?: string
  created_at: string
}

export function useVideoMessages(birthdayPerson?: string) {
  const [messages, setMessages] = useState<VideoMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabase()
      let query = supabase
        .from('video_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (birthdayPerson) {
        query = query.eq('birthday_person', birthdayPerson)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setMessages(data || [])
    } catch {
      setError('ビデオを読み込めません')
    } finally {
      setLoading(false)
    }
  }, [birthdayPerson])

  const deleteMessage = useCallback(async (id: number) => {
    try {
      const supabase = getSupabase()
      const { error: deleteError } = await supabase
        .from('video_messages')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setMessages(prev => prev.filter(m => m.id !== id))
      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    deleteMessage,
  }
}
