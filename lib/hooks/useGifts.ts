'use client'

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { VirtualGift } from '@/types'

export const GIFT_CATALOG = [
  { emoji: '🎂', name: 'バースデーケーキ' },
  { emoji: '🎁', name: 'ギフトボックス' },
  { emoji: '💐', name: '花束' },
  { emoji: '🌹', name: 'バラの花' },
  { emoji: '🧸', name: 'テディベア' },
  { emoji: '💝', name: 'ハート' },
  { emoji: '🎈', name: '風船' },
  { emoji: '🍫', name: 'チョコレート' },
  { emoji: '🎀', name: 'リボン' },
  { emoji: '⭐', name: '星' },
  { emoji: '🌸', name: '桜' },
  { emoji: '🎵', name: '音楽' },
]

interface UseGiftsReturn {
  gifts: VirtualGift[]
  isLoading: boolean
  error: string | null
  sendGift: (sender: string, giftEmoji: string, giftName: string, birthdayPerson?: string) => Promise<boolean>
  refetch: () => Promise<void>
}

export function useGifts(): UseGiftsReturn {
  const [gifts, setGifts] = useState<VirtualGift[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGifts = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('virtual_gifts')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setGifts((data || []) as VirtualGift[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ギフト一覧を読み込めませんでした')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGifts()
  }, [fetchGifts])

  const sendGift = useCallback(
    async (sender: string, giftEmoji: string, giftName: string, birthdayPerson?: string): Promise<boolean> => {
      try {
        const { error: insertError } = await supabase.from('virtual_gifts').insert({
          sender,
          gift_emoji: giftEmoji,
          gift_name: giftName,
          birthday_person: birthdayPerson,
        })

        if (insertError) throw insertError
        await fetchGifts()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ギフトを送信できませんでした')
        return false
      }
    },
    [fetchGifts]
  )

  return {
    gifts,
    isLoading,
    error,
    sendGift,
    refetch: fetchGifts,
  }
}
