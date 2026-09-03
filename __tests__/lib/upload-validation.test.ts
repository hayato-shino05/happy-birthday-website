import { describe, expect, it } from 'vitest'
import { getMediaKind, normalizeMediaFile, validateCommunityMediaFile } from '@/lib/validations/upload'

describe('normalizeMediaFile', () => {
  it('strips codec parameters from the MIME type', () => {
    const file = new File(['video'], 'clip.webm', { type: 'video/webm; codecs=vp9' })

    const normalized = normalizeMediaFile(file)

    expect(normalized.type).toBe('video/webm')
    expect(normalized).not.toBe(file)
  })

  it('returns the same File object when the MIME type is already clean', () => {
    const file = new File(['image'], 'photo.png', { type: 'image/png' })

    expect(normalizeMediaFile(file)).toBe(file)
  })

  it('normalizes uppercase and surrounding whitespace', () => {
    const file = new File(['image'], 'photo.png', { type: 'image/png' })
    Object.defineProperty(file, 'type', { configurable: true, value: ' IMAGE/PNG ' })

    const normalized = normalizeMediaFile(file)

    expect(normalized.type).toBe('image/png')
    expect(normalized).not.toBe(file)
  })

  it('returns the same File object when the MIME type is empty', () => {
    const file = new File(['data'], 'empty-type', { type: '' })

    expect(normalizeMediaFile(file)).toBe(file)
  })
})

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

  it('classifies image and video media and rejects audio', () => {
    expect(getMediaKind('image/webp')).toBe('image')
    expect(getMediaKind('video/webm')).toBe('video')
    expect(getMediaKind('audio/webm')).toBeNull()
  })

  it('rejects audio files as unsupported community media', () => {
    const file = new File(['audio'], 'clip.mp3', { type: 'audio/mpeg' })

    expect(validateCommunityMediaFile(file)).toEqual({
      valid: false,
      error: 'サポートされていないファイル形式です',
    })
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
