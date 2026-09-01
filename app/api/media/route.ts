import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

const MAX_MEDIA_LIMIT = 100
const MAX_MEDIA_OFFSET = 1_000_000

function parseBoundedInteger(value: string | null, min: number, max: number): number | undefined {
  if (value === null || !/^\d+$/.test(value)) return undefined
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : undefined
}

function escapePostgrestSearch(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

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
      const escapedSearch = escapePostgrestSearch(search)
      query = query.or(`original_name.ilike."%${escapedSearch}%",description.ilike."%${escapedSearch}%"`)
    }

    const validLimit = parseBoundedInteger(limit, 1, MAX_MEDIA_LIMIT)
    const validOffset = parseBoundedInteger(offset, 0, MAX_MEDIA_OFFSET)

    if (validLimit !== undefined) {
      query = query.limit(validLimit)
    }

    if (validOffset !== undefined) {
      query = query.range(validOffset, validOffset + (validLimit ?? 20) - 1)
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
