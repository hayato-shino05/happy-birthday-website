import { getSupabase } from '@/lib/supabase/client'
import { getMediaKind, validateCommunityMediaFile } from '@/lib/validations/upload'

interface CommunityMediaUploadInput {
  file: File
  sender: string
  birthdayPerson?: string
  description?: string
}

export async function uploadCommunityMedia({
  file,
  sender,
  birthdayPerson,
  description,
}: CommunityMediaUploadInput) {
  const validation = validateCommunityMediaFile(file)
  const mediaKind = getMediaKind(file.type)

  if (!validation.valid || !mediaKind) {
    throw new Error(validation.valid ? 'サポートされていないファイル形式です' : validation.error)
  }

  const normalizedSender = sender.trim()
  if (!normalizedSender || normalizedSender.length > 100) {
    throw new Error('送信者名が無効です')
  }

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
  const objectPath = `${mediaKind}s/${crypto.randomUUID()}.${extension}`
  const supabase = getSupabase()
  const { error: uploadError } = await supabase.storage
    .from('community-media')
    .upload(objectPath, file, { contentType: file.type, upsert: false })

  if (uploadError) throw uploadError

  const { data, error: insertError } = await supabase
    .from('media_submissions')
    .insert({
      sender: normalizedSender,
      object_path: objectPath,
      media_kind: mediaKind,
      mime_type: file.type,
      original_name: file.name,
      size_bytes: file.size,
      birthday_person: birthdayPerson?.trim() || null,
      description: description?.trim() || null,
    })
    .select()
    .single()

  if (insertError) throw insertError

  const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(objectPath)
  return { ...data, media_url: urlData.publicUrl }
}
