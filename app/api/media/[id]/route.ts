import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/media/[id] - 単一のメディアファイルを取得
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'メディアが見つかりません' },
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

// PUT /api/media/[id] - メディアのメタデータを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()
    const body = await request.json()

    const { tags, description } = body

    const updateData: Record<string, unknown> = {}
    if (tags !== undefined) updateData.tags = tags
    if (description !== undefined) updateData.description = description?.trim() || null

    const { data, error } = await supabase
      .from('media_files')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'メディアを更新できません' },
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

// DELETE /api/media/[id] - メディアファイルを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = getSupabase()

    // ファイル情報を先に取得
    const { data: media } = await supabase
      .from('media_files')
      .select('file_path')
      .eq('id', id)
      .single()

    if (media?.file_path) {
      // ストレージから削除
      await supabase.storage
        .from('media')
        .remove([media.file_path])
    }

    // データベースから削除
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'メディアを削除できません' },
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
