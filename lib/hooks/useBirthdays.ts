'use client'

import { useQuery } from '@tanstack/react-query'
import { getBirthdays } from '@/lib/supabase/queries'

// 誕生日データを取得するカスタムフック
export function useBirthdays() {
  return useQuery({
    queryKey: ['birthdays'],
    queryFn: getBirthdays,
    staleTime: 1000 * 60 * 5, // 5分間キャッシュ
    refetchOnWindowFocus: false,
  })
}
