import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/time-capsule/server', () => server)

import { POST } from '@/app/api/community/media/route'
import { MAX_MULTIPART_UPLOAD_SIZE } from '@/lib/validations/upload'

function makeClient(insertResult: { data: Record<string, unknown> | null; error: Error | null } = { data: { id: 1, object_path: 'images/id.png' }, error: null }) {
  const remove = vi.fn().mockResolvedValue({ error: null })
  const upload = vi.fn().mockResolvedValue({ error: null })
  const single = vi.fn().mockResolvedValue(insertResult)
  const client = {
    storage: { from: vi.fn(() => ({ upload, remove, getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/media' } }) })) },
    from: vi.fn(() => ({ insert: vi.fn(() => ({ select: vi.fn(() => ({ single })) })) })),
  }
  server.createServiceClient.mockReturnValue(client)
  return { client, upload, remove, single }
}

function request(fields: Record<string, string>, file?: File) {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.set(key, value))
  if (file) body.set('file', file)
  return { formData: async () => body } as unknown as NextRequest
}

beforeEach(() => vi.resetAllMocks())

describe('POST /api/community/media', () => {
  it('validates before creating a service client', async () => {
    makeClient()
    const response = await POST(request({ sender: '花子' }, new File(['x'], 'bad.exe', { type: 'application/octet-stream' })))

    expect(response.status).toBe(400)
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('uploads and inserts media, returning its public URL', async () => {
    const { client, upload } = makeClient()
    const response = await POST(request({ sender: '花子', description: 'ケーキ' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(201)
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^images\//), expect.any(File), { contentType: 'image/png', upsert: false })
    expect(client.from).toHaveBeenCalledWith('media_submissions')
    await expect(response.json()).resolves.toEqual({ data: expect.objectContaining({ id: 1, media_url: 'https://example.com/media' }) })
  })

  it('rejects files above the multipart threshold before creating a service client', async () => {
    makeClient()
    const file = new File([new Uint8Array(MAX_MULTIPART_UPLOAD_SIZE + 1)], 'large.png', { type: 'image/png' })

    const response = await POST(request({ sender: '花子' }, file))

    expect(response.status).toBe(400)
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('returns a safe error when storage upload fails without cleanup', async () => {
    const { upload, remove } = makeClient()
    upload.mockResolvedValueOnce({ error: new Error('upload failed') })

    const response = await POST(request({ sender: '花子' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(500)
    expect(remove).not.toHaveBeenCalled()
  })

  it('cleans up after a definite metadata insert failure', async () => {
    const insertError = new Error('insert failed')
    const { upload, remove } = makeClient({ data: null, error: insertError })
    const response = await POST(request({ sender: '花子' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(500)
    expect(remove).toHaveBeenCalledWith([upload.mock.calls[0][0]])
  })

  it('does not clean up when metadata transport rejects', async () => {
    const { client, remove } = makeClient()
    client.from.mockImplementation(() => ({ insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockRejectedValue(new Error('transport')) })) })) }))
    const response = await POST(request({ sender: '花子' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(500)
    expect(remove).not.toHaveBeenCalled()
  })

  it('does not clean up when the metadata response is unusable', async () => {
    const { remove } = makeClient({ data: null, error: null })
    const response = await POST(request({ sender: '花子' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(500)
    expect(remove).not.toHaveBeenCalled()
  })
})
