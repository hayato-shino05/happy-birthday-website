import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getMediaKind, validateCommunityMediaFile } from '@/lib/validations/upload'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const sender = formData.get('sender')
    const birthdayPerson = formData.get('birthday_person')
    const description = formData.get('description')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'ファイルが必要です' }, { status: 400 })
    }

    if (typeof sender !== 'string' || !sender.trim() || sender.trim().length > 100) {
      return NextResponse.json({ error: '送信者名が無効です' }, { status: 400 })
    }

    if (typeof birthdayPerson === 'string' && birthdayPerson.trim().length > 100) {
      return NextResponse.json({ error: '誕生日の名前が無効です' }, { status: 400 })
    }

    if (typeof description === 'string' && description.length > 1000) {
      return NextResponse.json({ error: '説明が長すぎます' }, { status: 400 })
    }

    const validation = validateCommunityMediaFile(file)
    const mediaKind = getMediaKind(file.type)
    if (!validation.valid || !mediaKind) {
      return NextResponse.json(
        { error: validation.valid ? 'サポートされていないファイル形式です' : validation.error },
        { status: 400 }
      )
    }

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
    const objectPath = `${mediaKind}s/${randomUUID()}.${extension}`
    const supabase = getSupabaseAdmin()
    const { error: uploadError } = await supabase.storage
      .from('community-media')
      .upload(objectPath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'ファイルを保存できませんでした' }, { status: 500 })
    }

    const { data, error: insertError } = await supabase
      .from('media_submissions')
      .insert({
        sender: sender.trim(),
        object_path: objectPath,
        media_kind: mediaKind,
        mime_type: file.type,
        original_name: file.name,
        size_bytes: file.size,
        birthday_person: typeof birthdayPerson === 'string' && birthdayPerson.trim() ? birthdayPerson.trim() : null,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      })
      .select()
      .single()

    if (insertError) {
      await supabase.storage.from('community-media').remove([objectPath])
      return NextResponse.json({ error: 'メディア情報を保存できませんでした' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(objectPath)
    return NextResponse.json({ success: true, data: { ...data, media_url: urlData.publicUrl } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'アップロード中に問題が発生しました' }, { status: 500 })
  }
}
