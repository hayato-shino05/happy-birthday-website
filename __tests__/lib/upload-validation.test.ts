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
})
