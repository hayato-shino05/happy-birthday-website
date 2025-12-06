import { supabase } from './client'
import type { Birthday, CustomMessage } from '@/types'

// 誕生日データの取得
export async function getBirthdays(): Promise<Birthday[]> {
  const { data, error } = await supabase
    .from('birthdays')
    .select('*')
    .order('month')
    .order('day')

  if (error) {
    console.error('誕生日データの取得エラー:', error)
    throw error
  }

  return data || []
}

// 単一の誕生日データを取得
export async function getBirthdayById(id: number): Promise<Birthday | null> {
  const { data, error } = await supabase.from('birthdays').select('*').eq('id', id).single()

  if (error) {
    console.error('誕生日データの取得エラー:', error)
    return null
  }

  return data
}

// カスタムメッセージの取得
export async function getCustomMessages(birthdayPerson?: string): Promise<CustomMessage[]> {
  let query = supabase.from('custom_messages').select('*').order('created_at', { ascending: false })

  if (birthdayPerson) {
    query = query.eq('birthday_person', birthdayPerson)
  }

  const { data, error } = await query

  if (error) {
    console.error('メッセージの取得エラー:', error)
    throw error
  }

  return data || []
}

// 最新のカスタムメッセージを取得
export async function getLatestCustomMessage(
  birthdayPerson: string
): Promise<CustomMessage | null> {
  const { data, error } = await supabase
    .from('custom_messages')
    .select('*')
    .eq('birthday_person', birthdayPerson)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('最新メッセージの取得エラー:', error)
    return null
  }

  return data
}

// カスタムメッセージの保存
export async function saveCustomMessage(
  sender: string,
  message: string,
  birthdayPerson?: string
): Promise<boolean> {
  const { error } = await supabase.from('custom_messages').insert([
    {
      sender,
      message,
      birthday_person: birthdayPerson,
    },
  ])

  if (error) {
    console.error('メッセージの保存エラー:', error)
    return false
  }

  return true
}
