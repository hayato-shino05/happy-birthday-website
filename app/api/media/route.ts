import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const tag = searchParams.get('tag')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const search = searchParams.get('search')

    if (tag) {
      return NextResponse.json({ error: 'タグ検索はサポートされていません' }, { status: 400 })
    }

    let query = supabase
      .from('media_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('media_kind', type)
    }

    if (search) {
      query = query.or(`original_name.ilike.%${search}%,description.ilike.%${search}%`)
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

    const stats = {
      total: count || 0,
      images: data?.filter(media => media.media_kind === 'image').length || 0,
      videos: data?.filter(media => media.media_kind === 'video').length || 0,
    }

    return NextResponse.json({ data, count, stats })
  } catch {
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
