import { describe, expect, it, vi } from 'vitest'

const upload = vi.fn().mockResolvedValue({ error: null })
const insert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }) }),
})

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({
    storage: { from: () => ({ upload, getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/media' } }) }) },
    from: () => ({ insert }),
  }),
}))

import { uploadCommunityMedia } from '@/lib/supabase/communityMedia'

describe('uploadCommunityMedia', () => {
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
})
