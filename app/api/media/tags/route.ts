import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/media/tags - すべてのユニークなタグを取得
export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('media_files')
      .select('tags')

    if (error) {
      return NextResponse.json(
        { error: 'タグを読み込めません' },
        { status: 500 }
      )
    }

    // ユニークなタグを抽出
    const allTags = data?.flatMap(item => item.tags || []) || []
    const uniqueTags = [...new Set(allTags)]
    
    // 出現回数をカウント
    const tagCounts = uniqueTags.map(tag => ({
      tag,
      count: allTags.filter(t => t === tag).length,
    })).sort((a, b) => b.count - a.count)

    return NextResponse.json({ 
      tags: uniqueTags,
      tagCounts,
      total: uniqueTags.length 
    })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// POST /api/media/tags - メディアにタグを追加
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const { mediaId, tags } = body

    if (!mediaId || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: '必須項目が不足しています（mediaId, tags）' },
        { status: 400 }
      )
    }

    // 現在のタグを取得
    const { data: media } = await supabase
      .from('media_files')
      .select('tags')
      .eq('id', mediaId)
      .single()

    const currentTags = media?.tags || []
    const newTags = [...new Set([...currentTags, ...tags])]

    const { data, error } = await supabase
      .from('media_files')
      .update({ tags: newTags })
      .eq('id', mediaId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'タグを更新できません' },
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
