import { createServiceClient } from '@/lib/time-capsule/server'
import { getMediaKind, type CommunityMediaKind } from '@/lib/validations/upload'

const COMMUNITY_MEDIA_BUCKET = 'community-media'

export type CommunitySubmissionKind = 'message' | 'post'

export type CommunitySubmissionInput = {
  kind: CommunitySubmissionKind
  sender: string
  content: string
  birthdayPerson: string | null
  description: string | null
  file: File | null
}

export async function createCommunitySubmission(input: CommunitySubmissionInput): Promise<unknown> {
  const serviceClient = createServiceClient()
  let objectPath: string | null = null
  let mediaKind: CommunityMediaKind | null = null
  const file = input.file

  if (file) {
    mediaKind = getMediaKind(file.type)
    if (!mediaKind) throw new Error('サポートされていないファイル形式です')
    const extension = file.name.trim().split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin'
    objectPath = `${mediaKind}s/${crypto.randomUUID()}.${extension}`
    const { error } = await serviceClient.storage
      .from(COMMUNITY_MEDIA_BUCKET)
      .upload(objectPath, file, { contentType: file.type, upsert: false })
    if (error) throw error
  }

  const cleanupUploadedMedia = async () => {
    if (!objectPath) return
    try {
      const { error: cleanupError } = await serviceClient.storage.from(COMMUNITY_MEDIA_BUCKET).remove([objectPath])
      if (cleanupError) console.error('Community media cleanup failed')
    } catch {
      console.error('Community media cleanup failed')
    }
  }

  try {
    const { data, error } = await serviceClient.rpc('create_community_submission', {
      p_kind: input.kind,
      p_sender: input.sender,
      p_content: input.content,
      p_birthday_person: input.birthdayPerson,
      p_description: input.description,
      p_object_path: objectPath,
      p_media_kind: mediaKind,
      p_mime_type: file?.type ?? null,
      p_original_name: file?.name ?? null,
      p_size_bytes: file?.size ?? null,
    })

    if (error) throw error
    return data
  } catch (error) {
    await cleanupUploadedMedia()
    throw error
  }
}
