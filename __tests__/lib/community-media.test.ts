import { beforeEach, describe, expect, it, vi } from 'vitest'

const storage = vi.hoisted(() => ({ uploadToSignedUrl: vi.fn().mockResolvedValue({ error: null }) }))
vi.mock('@/lib/supabase/client', () => ({ getSupabase: () => ({ storage: { from: () => storage } }) }))

import { uploadCommunityMedia } from '@/lib/supabase/communityMedia'

describe('uploadCommunityMedia', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    storage.uploadToSignedUrl.mockReset()
    storage.uploadToSignedUrl.mockResolvedValue({ error: null })
  })

  it('uploads an allowed file through the media endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: { id: 1, object_path: 'images/id.png', media_url: 'https://example.com/media' },
    }), { status: 201, headers: { 'content-type': 'application/json' } }))
    const file = new File(['image'], 'cake.png', { type: 'image/png' })

    const result = await uploadCommunityMedia({ file, sender: '花子' })

    expect(fetchMock).toHaveBeenCalledWith('/api/community/media', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }))
    expect(result).toEqual(expect.objectContaining({ object_path: 'images/id.png' }))
  })

  it('uses signed direct upload for files above the server body limit', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { path: 'videos/id.webm', token: 'token', uploadToken: 'app-token' } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: 1, object_path: 'videos/id.webm', media_url: 'https://example.com/video' } }), { status: 201 }))
    const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'clip.webm', { type: 'video/webm' })

    await uploadCommunityMedia({ file, sender: '花子', birthdayPerson: '太郎' })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/community/media/sign')
    expect(storage.uploadToSignedUrl).toHaveBeenCalledWith('videos/id.webm', 'token', expect.any(File))
    expect(fetchMock.mock.calls[1][0]).toBe('/api/community/media/finalize')
  })

  it('normalizes MIME parameters before transport', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ data: { id: 1, object_path: 'videos/id.mp4', media_url: 'https://example.com/video' } }), { status: 201 }))

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
