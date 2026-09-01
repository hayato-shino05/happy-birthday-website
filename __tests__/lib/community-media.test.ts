import { beforeEach, describe, expect, it, vi } from 'vitest'

const upload = vi.fn().mockResolvedValue({ error: null })
const remove = vi.fn().mockResolvedValue({ error: null })
const insert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }) }),
})

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({
    storage: { from: () => ({ upload, remove, getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/media' } }) }) },
    from: () => ({ insert }),
  }),
}))

import { uploadCommunityMedia } from '@/lib/supabase/communityMedia'

describe('uploadCommunityMedia', () => {
  beforeEach(() => {
    upload.mockClear()
    remove.mockClear()
    insert.mockClear()
  })

  it('uploads an allowed file and records its object path', async () => {
    const file = new File(['image'], 'cake.png', { type: 'image/png' })

    await uploadCommunityMedia({ file, sender: '花子' })

    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^images\//), file, {
      contentType: 'image/png',
      upsert: false,
    })
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      sender: '花子',
      media_kind: 'image',
      original_name: 'cake.png',
    }))
  })

  it('removes the object when metadata insert fails', async () => {
    const insertError = new Error('insert failed')
    insert.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: insertError }) }),
    })

    await expect(uploadCommunityMedia({ file: new File(['image'], 'cake.png', { type: 'image/png' }), sender: '花子' }))
      .rejects.toBe(insertError)
    const uploadedPath = upload.mock.calls[0]?.[0]
    expect(uploadedPath).toEqual(expect.stringMatching(/^images\//))
    expect(remove).toHaveBeenCalledWith([uploadedPath])
  })
})
