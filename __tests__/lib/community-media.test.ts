import { beforeEach, describe, expect, it, vi } from 'vitest'

import { uploadCommunityMedia } from '@/lib/supabase/communityMedia'

describe('uploadCommunityMedia', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('uploads an allowed file through the media endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: { id: 1, object_path: 'images/id.png', media_url: 'https://example.com/media' },
    }), { status: 201, headers: { 'content-type': 'application/json' } }))
    const file = new File(['image'], 'cake.png', { type: 'image/png' })

    const result = await uploadCommunityMedia({ file, sender: '花子' })

    expect(fetchMock).toHaveBeenCalledWith('/api/community/media', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }))
    const body = fetchMock.mock.calls[0][1]?.body as FormData
    expect(body.get('sender')).toBe('花子')
    expect(body.get('file')).toBeInstanceOf(File)
    expect(result).toEqual(expect.objectContaining({ object_path: 'images/id.png' }))
  })

  it('normalizes MIME parameters before transport', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { object_path: 'videos/id.mp4', media_url: 'https://example.com/video' } }), { status: 201 }))

    await uploadCommunityMedia({ file: new File(['video'], 'clip.mp4', { type: 'video/mp4; codecs=avc1' }), sender: '花子' })

    const body = vi.mocked(fetch).mock.calls[0]?.[1]?.body as FormData
    expect((body.get('file') as File).type).toBe('video/mp4')
  })

  it('maps endpoint errors without exposing transport details', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'メディア内容が無効です' }), { status: 400 }))

    await expect(uploadCommunityMedia({ file: new File(['image'], 'cake.png', { type: 'image/png' }), sender: '花子' }))
      .rejects.toThrow('メディア内容が無効です')
  })
})
