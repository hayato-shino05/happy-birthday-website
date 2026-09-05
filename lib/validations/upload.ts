export const MAX_COMMUNITY_MEDIA_SIZE = 50 * 1024 * 1024
export const MAX_MULTIPART_UPLOAD_SIZE = 4 * 1024 * 1024

const COMMUNITY_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
])

export type CommunityMediaKind = 'image' | 'video'

export function normalizeMediaFile(file: File): File {
  const mimeType = file.type.split(';', 1)[0].trim().toLowerCase()
  if (mimeType === file.type) return file
  return new File([file], file.name, { type: mimeType, lastModified: file.lastModified })
}

export function isCommunityMediaMimeType(mimeType: string): boolean {
  return COMMUNITY_MEDIA_TYPES.has(mimeType)
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff]
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46] // 'RIFF' + 4 byte size + 'WEBP'
const GIF87_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] // 'GIF87a'
const GIF89_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] // 'GIF89a'

// 宣言された MIME を信用せず、先頭バイトで実内容を検証する
function matchesSignature(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) return false
  return signature.every((value, index) => bytes[offset + index] === value)
}

function isWebp(bytes: Uint8Array): boolean {
  if (!matchesSignature(bytes, WEBP_SIGNATURE) || bytes.length < 16) return false
  return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50 // 'WEBP'
}

function isMp4(bytes: Uint8Array): boolean {
  // 'ftyp' ボックスが 4〜32 バイト目にある ISO BMFF 形式を mp4 として許容する
  if (bytes.length < 32) return false
  for (let offset = 4; offset <= 8; offset++) {
    if (matchesSignature(bytes, [0x66, 0x74, 0x79, 0x70], offset)) return true
  }
  return false
}

function isWebm(bytes: Uint8Array): boolean {
  // EBML マジック 1A 45 DF A3
  return matchesSignature(bytes, [0x1a, 0x45, 0xdf, 0xa3])
}

// ファイル先頭のマジックナンバーで実内容を検証する（拡張子・宣言 MIME は信頼しない）
export function inspectMediaContent(bytes: Uint8Array): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'video/mp4' | 'video/webm' | null {
  if (matchesSignature(bytes, PNG_SIGNATURE)) return 'image/png'
  if (matchesSignature(bytes, JPEG_SIGNATURE)) return 'image/jpeg'
  if (isWebp(bytes)) return 'image/webp'
  if (matchesSignature(bytes, GIF87_SIGNATURE) || matchesSignature(bytes, GIF89_SIGNATURE)) return 'image/gif'
  if (isMp4(bytes)) return 'video/mp4'
  if (isWebm(bytes)) return 'video/webm'
  return null
}

// jsdom の File は arrayBuffer() を持たないため、slice した Blob を FileReader で読み取って先頭バイトを確認する
export async function inspectMediaFile(file: File): Promise<'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'video/mp4' | 'video/webm' | null> {
  return inspectMediaBlob(file.slice(0, 32))
}

// Blob の先頭バイトを FileReader で読み取って実内容を検証する（node/jsdom 両対応）
export async function inspectMediaBlob(blob: Blob): Promise<'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'video/mp4' | 'video/webm' | null> {
  const text = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('media read failed'))
    reader.readAsBinaryString(blob)
  })
  const bytes = new Uint8Array(text.length)
  for (let index = 0; index < text.length; index++) bytes[index] = text.charCodeAt(index) & 0xff
  return inspectMediaContent(bytes)
}

export function getMediaKind(mimeType: string): CommunityMediaKind | null {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
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
