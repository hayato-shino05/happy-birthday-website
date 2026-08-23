import { describe, expect, it } from 'vitest'
import { getMediaKind, validateCommunityMediaFile } from '@/lib/validations/upload'

describe('validateCommunityMediaFile', () => {
  it('accepts a supported image within the size limit', () => {
    const file = new File(['image'], 'birthday.png', { type: 'image/png' })

    expect(validateCommunityMediaFile(file)).toEqual({ valid: true })
  })

  it('rejects an unsupported file type', () => {
    const file = new File(['binary'], 'birthday.exe', { type: 'application/octet-stream' })

    expect(validateCommunityMediaFile(file)).toEqual({
      valid: false,
      error: 'サポートされていないファイル形式です',
    })
  })

  it('classifies image, video, and audio media', () => {
    expect(getMediaKind('image/webp')).toBe('image')
    expect(getMediaKind('video/webm')).toBe('video')
    expect(getMediaKind('audio/webm')).toBe('audio')
  })

  it('rejects files over the 50MB limit', () => {
    const oversized = new File([new Uint8Array(51)], 'big.png', { type: 'image/png' })
    Object.defineProperty(oversized, 'size', { value: 50 * 1024 * 1024 + 1 })

    expect(validateCommunityMediaFile(oversized)).toEqual({
      valid: false,
      error: 'ファイルサイズは50MB以下にしてください',
    })
  })

  it('rejects zero-byte files', () => {
    const empty = new File([], 'empty.png', { type: 'image/png' })

    expect(validateCommunityMediaFile(empty)).toEqual({
      valid: false,
      error: 'ファイルサイズは50MB以下にしてください',
    })
  })

  it('rejects unsupported subtypes even when the prefix matches', () => {
    const heic = new File(['image'], 'photo.heic', { type: 'image/heic' })

    expect(validateCommunityMediaFile(heic)).toEqual({
      valid: false,
      error: 'サポートされていないファイル形式です',
    })
  })
})
