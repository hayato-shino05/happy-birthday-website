import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/video - ビデオメッセージ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const birthdayPerson = searchParams.get('birthdayPerson')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('video_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (birthdayPerson) {
      query = query.eq('birthday_person', birthdayPerson)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'ビデオを読み込めません' },
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

// POST /api/video - ビデオメッセージのレコードを作成
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { sender, video_url, thumbnail_url, duration, birthday_person } = body

    if (!sender || !video_url) {
      return NextResponse.json(
        { error: '必須項目が不足しています（sender, video_url）' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('video_messages')
      .insert({
        sender: sender.trim(),
        video_url,
        thumbnail_url: thumbnail_url || null,
        duration: duration || 0,
        birthday_person: birthday_person?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'ビデオを保存できません' },
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
