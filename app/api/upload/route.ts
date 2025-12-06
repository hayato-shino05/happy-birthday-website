import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ファイルサイズを検証（最大50MB）
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // ファイル種別を検証
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    const supabase = getSupabase()

    // 一意なファイル名を生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // File を ArrayBuffer に変換し、さらに Buffer に変換
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storage にアップロード
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)

    // ファイル種別を判定
    const fileType = file.type.startsWith('video/') ? 'video' : 'image'

    // データベースにレコードを登録
    const { data, error: insertError } = await supabase
      .from('media_files')
      .insert({
        file_name: file.name,
        file_path: urlData.publicUrl,
        file_type: fileType,
        file_size: file.size,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      url: urlData.publicUrl,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Upload API - Use POST to upload files' })
}
