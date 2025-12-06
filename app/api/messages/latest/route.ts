import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/messages/latest - 最新のメッセージを取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const birthdayPerson = searchParams.get('birthdayPerson')
    const limit = parseInt(searchParams.get('limit') || '5')

    let query = supabase
      .from('custom_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (birthdayPerson) {
      query = query.eq('birthday_person', birthdayPerson)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'メッセージを読み込めません' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, count: data?.length || 0 })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
