import { getMediaKind, normalizeMediaFile, validateCommunityMediaFile } from '@/lib/validations/upload'

interface CommunityMediaUploadInput {
  file: File
  sender: string
  birthdayPerson?: string
  description?: string
}

export interface CommunityMediaSubmission {
  id: number
  sender: string
  object_path: string
  media_kind: 'image' | 'video' | 'audio'
  original_name: string
  size_bytes: number
  description: string | null
  created_at: string
  media_url: string
}

export async function uploadCommunityMedia({
  file,
  sender,
  birthdayPerson,
  description,
}: CommunityMediaUploadInput): Promise<CommunityMediaSubmission> {
  const normalizedFile = normalizeMediaFile(file)
  const validation = validateCommunityMediaFile(normalizedFile)
  const mediaKind = getMediaKind(normalizedFile.type)

  if (!validation.valid || !mediaKind) {
    throw new Error(validation.valid ? 'サポートされていないファイル形式です' : validation.error)
  }

  const normalizedSender = sender.trim()
  if (!normalizedSender || normalizedSender.length > 100) {
    throw new Error('送信者名が無効です')
  }

  const normalizedBirthdayPerson = birthdayPerson?.trim() || null
  if (normalizedBirthdayPerson && normalizedBirthdayPerson.length > 100) {
    throw new Error('誕生日の人の名前が無効です')
  }

  const normalizedDescription = description?.trim() || null
  if (normalizedDescription && normalizedDescription.length > 1000) {
    throw new Error('説明が長すぎます')
  }

  const normalizedOriginalName = normalizedFile.name.trim()
  if (!normalizedOriginalName || normalizedOriginalName.length > 255 || /[\\/\p{Cc}]/u.test(normalizedOriginalName)) {
    throw new Error('ファイル名が無効です')
  }

  const formData = new FormData()
  formData.set('file', normalizedFile, normalizedOriginalName)
  formData.set('sender', normalizedSender)
  if (normalizedBirthdayPerson) formData.set('birthdayPerson', normalizedBirthdayPerson)
  if (normalizedDescription) formData.set('description', normalizedDescription)

  const response = await fetch('/api/community/media', { method: 'POST', body: formData })
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('メディアをアップロードできません')
  }

  if (!response.ok) {
    const error = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'メディアをアップロードできません'
    throw new Error(error)
  }

  const data = payload && typeof payload === 'object' && 'data' in payload ? payload.data : null
  if (!data || typeof data !== 'object' || !('object_path' in data) || typeof data.object_path !== 'string') {
    throw new Error('メディア応答が無効です')
  }
  return data as CommunityMediaSubmission
}
