import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/birthdays/[id] - 単一の誕生日を取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('birthdays')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: '誕生日が見つかりません' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// PUT /api/birthdays/[id] - 誕生日情報を更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()
    const body = await request.json()

    const { name, month, day, year, message } = body

    // バリデーション
    if (month && (month < 1 || month > 12)) {
      return NextResponse.json(
        { error: '月が正しくありません（1〜12）' },
        { status: 400 }
      )
    }

    if (day && (day < 1 || day > 31)) {
      return NextResponse.json(
        { error: '日付が正しくありません（1〜31）' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name.trim()
    if (month) updateData.month = month
    if (day) updateData.day = day
    if (year !== undefined) updateData.year = year
    if (message !== undefined) updateData.message = message?.trim() || null

    const { data, error } = await supabase
      .from('birthdays')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: '誕生日を更新できません' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// DELETE /api/birthdays/[id] - 誕生日を削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { error } = await supabase
      .from('birthdays')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: '誕生日を削除できません' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
