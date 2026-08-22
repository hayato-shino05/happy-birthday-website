import { beforeEach, describe, expect, it, vi } from 'vitest'

class FakeImage {
  static behavior: 'load' | 'error' = 'load'
  width = 100
  height = 50
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  set src(_value: string) {
    queueMicrotask(() => {
      if (FakeImage.behavior === 'error') this.onerror?.()
      else this.onload?.()
    })
  }
}

function makeCanvas(ctx: { drawImage: ReturnType<typeof vi.fn> } | null) {
  return {
    width: 0,
    height: 0,
    getContext: () => ctx,
    toBlob: (cb: (b: Blob | null) => void) => cb(new Blob(['thumb'], { type: 'image/jpeg' })),
  }
}

describe('media object URL lifecycle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:mock-${Math.random()}`)
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  it('compressImage revokes URL on load error', async () => {
    const { compressImage } = await import('@/lib/utils/media')
    FakeImage.behavior = 'error'
    vi.stubGlobal('Image', FakeImage)

    const promise = compressImage(new File(['x'], 'a.jpg'))

    await expect(promise).rejects.toThrow('Failed to load image')
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(vi.mocked(URL.createObjectURL).mock.results[0].value)
    vi.unstubAllGlobals()
  })

  it('compressImage revokes URL after successful compression', async () => {
    const { compressImage } = await import('@/lib/utils/media')
    FakeImage.behavior = 'load'
    vi.stubGlobal('Image', FakeImage)
    const ctx = { drawImage: vi.fn() }
    const canvas = makeCanvas(ctx)
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => (tag === 'canvas' ? canvas : null)) as unknown as typeof document.createElement)

    const blob = await compressImage(new File(['x'], 'a.jpg'))

    expect(blob).toBeInstanceOf(Blob)
    expect(ctx.drawImage).toHaveBeenCalled()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(vi.mocked(URL.createObjectURL).mock.results[0].value)
    createElement.mockRestore()
    vi.unstubAllGlobals()
  })

  it('generateVideoThumbnail revokes URL when canvas context is unavailable', async () => {
    const { generateVideoThumbnail } = await import('@/lib/utils/media')
    const fakeVideo = {
      preload: '',
      muted: false,
      playsInline: false,
      duration: 3,
      videoWidth: 640,
      videoHeight: 480,
      currentTime: 0,
      src: '',
      onloadedmetadata: (() => {}) as (() => void) | null,
      onseeked: (() => {}) as (() => void) | null,
      onerror: (() => {}) as (() => void) | null,
      load: () => {},
    }
    const emptyCanvas = makeCanvas(null)
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => (tag === 'video' ? fakeVideo : emptyCanvas)) as unknown as typeof document.createElement)

    const promise = generateVideoThumbnail(new File(['v'], 'a.mp4'))
    fakeVideo.onloadedmetadata?.()
    fakeVideo.onseeked?.()
    const result = await promise

    expect(result).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(vi.mocked(URL.createObjectURL).mock.results[0].value)
    createElement.mockRestore()
  })

  it('generateVideoThumbnail revokes URL on decode error', async () => {
    const { generateVideoThumbnail } = await import('@/lib/utils/media')
    const fakeVideo = {
      preload: '',
      muted: false,
      playsInline: false,
      duration: 0,
      videoWidth: 0,
      videoHeight: 0,
      currentTime: 0,
      src: '',
      onloadedmetadata: (() => {}) as (() => void) | null,
      onseeked: (() => {}) as (() => void) | null,
      onerror: (() => {}) as (() => void) | null,
      load: () => {},
    }
    const canvas = makeCanvas({ drawImage: vi.fn() })
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => (tag === 'video' ? fakeVideo : canvas)) as unknown as typeof document.createElement)

    const promise = generateVideoThumbnail(new File(['v'], 'a.mp4'))
    fakeVideo.onerror?.()
    const result = await promise

    expect(result).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    createElement.mockRestore()
  })
})
