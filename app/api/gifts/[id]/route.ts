import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/gifts/[id] - 単一のギフトを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('virtual_gifts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'ギフトが見つかりません' },
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

// DELETE /api/gifts/[id] - ギフトを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { error } = await supabase
      .from('virtual_gifts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'ギフトを削除できません' },
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
