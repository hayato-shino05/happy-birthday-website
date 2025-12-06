import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/messages - メッセージ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const birthdayPerson = searchParams.get('birthdayPerson')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = supabase
      .from('custom_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (birthdayPerson) {
      query = query.eq('birthday_person', birthdayPerson)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '10') - 1)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'メッセージを読み込めません' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data, count })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// POST /api/messages - 新しいメッセージを作成
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { sender, message, birthday_person } = body

    // バリデーション
    if (!sender || !message) {
      return NextResponse.json(
        { error: '必須項目が不足しています（sender, message）' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'メッセージは1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('custom_messages')
      .insert({
        sender: sender.trim(),
        message: message.trim(),
        birthday_person: birthday_person?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'メッセージを送信できません' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
