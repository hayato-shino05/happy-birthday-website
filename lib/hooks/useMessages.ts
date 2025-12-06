'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Message {
  id: number
  sender: string
  message: string
  gift_id?: string
  media_url?: string
  likes: number
  created_at: string
}

interface UseMessagesReturn {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sendMessage: (sender: string, message: string, birthdayPerson?: string, mediaUrl?: string) => Promise<boolean>
  deleteMessage: (id: number) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useMessages(): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('bulletin_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setMessages((data || []) as Message[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'メッセージ一覧を読み込めませんでした')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const sendMessage = useCallback(
    async (sender: string, message: string, _birthdayPerson?: string, mediaUrl?: string): Promise<boolean> => {
      try {
        const { error: insertError } = await supabase.from('bulletin_posts').insert({
          sender,
          message,
          media_url: mediaUrl || null,
          likes: 0,
        })

        if (insertError) throw insertError
        await fetchMessages()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メッセージを送信できませんでした')
        return false
      }
    },
    [fetchMessages]
  )

  const deleteMessage = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase.from('bulletin_posts').delete().eq('id', id)

        if (deleteError) throw deleteError
        await fetchMessages()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メッセージを削除できませんでした')
        return false
      }
    },
    [fetchMessages]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  }
}
