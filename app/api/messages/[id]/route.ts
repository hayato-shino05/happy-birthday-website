import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/messages/[id] - 単一のメッセージを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('custom_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'メッセージが見つかりません' },
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

// PUT /api/messages/[id] - メッセージを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()
    const body = await request.json()

    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージ内容が入力されていません' },
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
      .update({ message: message.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'メッセージを更新できません' },
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

// DELETE /api/messages/[id] - メッセージを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { error } = await supabase
      .from('custom_messages')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'メッセージを削除できません' },
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
