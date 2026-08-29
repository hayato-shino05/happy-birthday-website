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
})
