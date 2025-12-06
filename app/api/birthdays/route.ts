import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/birthdays - 誕生日一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const month = searchParams.get('month')
    const limit = searchParams.get('limit')
    const orderBy = searchParams.get('orderBy') || 'month'
    const order = searchParams.get('order') || 'asc'

    let query = supabase
      .from('birthdays')
      .select('*')
      .order(orderBy, { ascending: order === 'asc' })

    if (month) {
      query = query.eq('month', parseInt(month))
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: '誕生日リストを読み込めません' },
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

// POST /api/birthdays - 新しい誕生日を作成
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { name, month, day, year, message } = body

    // バリデーション
    if (!name || !month || !day) {
      return NextResponse.json(
        { error: '必須項目が不足しています（name, month, day）' },
        { status: 400 }
      )
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: '月が正しくありません（1〜12）' },
        { status: 400 }
      )
    }

    if (day < 1 || day > 31) {
      return NextResponse.json(
        { error: '日付が正しくありません（1〜31）' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('birthdays')
      .insert({
        name: name.trim(),
        month,
        day,
        year: year || null,
        message: message?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: '新しい誕生日を作成できません' },
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
