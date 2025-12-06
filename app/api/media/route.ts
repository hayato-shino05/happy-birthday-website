import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

// GET /api/media - メディアファイル一覧を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') // 'image' | 'video' のいずれか
    const tag = searchParams.get('tag')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const search = searchParams.get('search')

    let query = supabase
      .from('media_files')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('file_type', type)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (search) {
      query = query.or(`file_name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit || '20') - 1)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'メディアを読み込めません' },
        { status: 500 }
      )
    }

    // 統計情報を計算
    const stats = {
      total: count || 0,
      images: data?.filter(m => m.file_type === 'image').length || 0,
      videos: data?.filter(m => m.file_type === 'video').length || 0,
    }

    return NextResponse.json({ data, count, stats })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
