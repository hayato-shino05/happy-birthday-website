export const MAX_COMMUNITY_MEDIA_SIZE = 50 * 1024 * 1024
export const MAX_MULTIPART_UPLOAD_SIZE = 4 * 1024 * 1024

const COMMUNITY_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
])

export type CommunityMediaKind = 'image' | 'video' | 'audio'

export function normalizeMediaFile(file: File): File {
  const mimeType = file.type.split(';', 1)[0].trim().toLowerCase()
  if (mimeType === file.type) return file
  return new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
}

export function isCommunityMediaMimeType(mimeType: string): boolean {
  return COMMUNITY_MEDIA_TYPES.has(mimeType)
}

export function getMediaKind(mimeType: string): CommunityMediaKind | null {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return null
}

export function validateCommunityMediaFile(file: File): { valid: true } | { valid: false; error: string } {
  if (file.size <= 0 || file.size > MAX_COMMUNITY_MEDIA_SIZE) {
    return { valid: false, error: 'ファイルサイズは50MB以下にしてください' }
  }

  if (!COMMUNITY_MEDIA_TYPES.has(file.type) || !getMediaKind(file.type)) {
    return { valid: false, error: 'サポートされていないファイル形式です' }
  }

  return { valid: true }
}
