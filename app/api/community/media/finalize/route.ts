import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/time-capsule/server'
import { getMediaKind, isCommunityMediaMimeType, MAX_COMMUNITY_MEDIA_SIZE } from '@/lib/validations/upload'

function parseText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return normalized && normalized.length <= maxLength ? normalized : null
}

function parseOptionalText(value: unknown, maxLength: number): string | null | undefined {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') return undefined
  const normalized = value.trim()
  return normalized ? normalized.length <= maxLength ? normalized : undefined : null
}

function isSafeObjectPath(value: string): boolean {
  return /^(images|videos|audios)\/[0-9a-f-]{36}\.[a-z0-9]+$/i.test(value)
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'メディア内容が無効です' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'メディア内容が無効です' }, { status: 400 })
  const input = body as Record<string, unknown>
  const objectPath = parseText(input.path, 255)
  const sender = parseText(input.sender, 100)
  const originalName = parseText(input.filename, 255)
  const mimeType = parseText(input.mimeType, 100)?.split(';', 1)[0].trim().toLowerCase()
  const sizeBytes = input.sizeBytes
  const birthdayPerson = parseOptionalText(input.birthdayPerson, 100)
  const description = parseOptionalText(input.description, 1000)
  if (!objectPath || !isSafeObjectPath(objectPath) || !sender || !originalName || !mimeType
    || typeof sizeBytes !== 'number' || !Number.isSafeInteger(sizeBytes) || birthdayPerson === undefined || description === undefined
    || sizeBytes <= 0 || sizeBytes > MAX_COMMUNITY_MEDIA_SIZE
    || /[\\/\p{Cc}]/u.test(originalName) || !isCommunityMediaMimeType(mimeType)) {
    return NextResponse.json({ error: 'メディア内容が無効です' }, { status: 400 })
  }
  const mediaKind = getMediaKind(mimeType)
  if (!mediaKind || !objectPath.startsWith(`${mediaKind}s/`)) {
    return NextResponse.json({ error: 'メディア内容が無効です' }, { status: 400 })
  }

  try {
    const supabase = createServiceClient()
    const { data: object, error: infoError } = await supabase.storage.from('community-media').info(objectPath)
    if (infoError || !object || object.size !== sizeBytes || object.contentType !== mimeType) {
      return NextResponse.json({ error: 'アップロード済みメディアを確認できません' }, { status: 400 })
    }

    const { data, error: insertError } = await supabase.from('media_submissions').insert({
      sender,
      object_path: objectPath,
      media_kind: mediaKind,
      mime_type: mimeType,
      original_name: originalName,
      size_bytes: sizeBytes,
      birthday_person: birthdayPerson ?? null,
      description: description ?? null,
    }).select().single()
    if (insertError || !data || typeof data !== 'object' || !('id' in data) || typeof data.id !== 'number') {
      const { error: cleanupError } = await supabase.storage.from('community-media').remove([objectPath])
      if (cleanupError) console.error('Community media cleanup failed', cleanupError.message)
      throw insertError ?? new Error('invalid media metadata')
    }

    const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(objectPath)
    return NextResponse.json({ data: { ...data, media_url: urlData.publicUrl } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'メディアを確定できません' }, { status: 500 })
  }
}
