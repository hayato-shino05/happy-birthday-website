import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/time-capsule/server', async () => {
  const actual = await vi.importActual<typeof import('@/lib/time-capsule/server')>('@/lib/time-capsule/server')
  return { ...actual, createServiceClient: server.createServiceClient }
})

import { POST as sign } from '@/app/api/community/media/sign/route'
import { POST as finalize } from '@/app/api/community/media/finalize/route'
import { createCommunityMediaUploadToken } from '@/lib/time-capsule/server'

const payload = { path: 'images/12345678-1234-1234-1234-123456789012.png', filename: 'cake.png', mimeType: 'image/png', sizeBytes: 5, sender: '花子', birthdayPerson: null, description: null }
const request = (body: unknown) => ({ json: async () => body } as unknown as NextRequest)

function client(existing: unknown = null, insert: unknown = { id: 1 }, info: unknown = { size: 5, contentType: 'image/png' }, winner: unknown = null, insertError: unknown = null) {
  const remove = vi.fn().mockResolvedValue({ error: null })
  const maybeSingle = vi.fn()
    .mockResolvedValueOnce({ data: existing, error: null })
    .mockResolvedValue({ data: winner, error: null })
  const table = { select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) })), insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: insert, error: insertError }) })) })) }
  const storage = { info: vi.fn().mockResolvedValue({ data: info, error: null }), remove, getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/media' } })) }
  server.createServiceClient.mockReturnValue({ storage: { from: vi.fn(() => storage) }, from: vi.fn(() => table) })
  return { remove, storage, table }
}

beforeEach(() => { vi.resetAllMocks(); process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key' })

describe('signed community media routes', () => {
  it('rejects missing or invalid finalize tokens', async () => {
    client()
    const response = await finalize(request({ ...payload, uploadToken: 'invalid' }))
    expect(response.status).toBe(400)
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects metadata or path mismatches', async () => {
    client()
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, path: payload.path.replace('images', 'videos'), uploadToken: token }))
    expect(response.status).toBe(400)
  })

  it('accepts generated paths longer than 255 characters within the storage path limit', async () => {
    const extension = 'a'.repeat(250)
    const path = `images/12345678-1234-1234-1234-123456789012.${extension}`
    const input = { ...payload, path, filename: `cake.${extension}` }
    client(null, { id: 1, object_path: path, media_kind: 'image' }, { size: 5, contentType: 'image/png' })
    const token = createCommunityMediaUploadToken(JSON.stringify(input), Date.now() + 60_000)

    const response = await finalize(request({ ...input, uploadToken: token }))

    expect(response.status).toBe(201)
  })

  it('rejects Storage metadata mismatches without deleting the object', async () => {
    const { remove } = client(null, null, { size: 99, contentType: 'image/png' })
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, uploadToken: token }))
    expect(response.status).toBe(400)
    expect(remove).not.toHaveBeenCalled()
  })

  it('issues signed upload authorization for validated metadata', async () => {
    const storage = { createSignedUploadUrl: vi.fn().mockResolvedValue({ data: { token: 'storage-token' }, error: null }) }
    server.createServiceClient.mockReturnValue({ storage: { from: vi.fn(() => storage) } })
    const response = await sign(request({ filename: 'cake.png', mimeType: 'image/png', sizeBytes: 5, sender: '花子' }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ data: expect.objectContaining({ token: 'storage-token', uploadToken: expect.any(String) }) })
  })

  it('returns an existing row without deleting on duplicate finalize', async () => {
    const { remove } = client({ id: 1, object_path: payload.path, media_kind: 'image' })
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, uploadToken: token }))
    expect(response.status).toBe(200)
    expect(remove).not.toHaveBeenCalled()
  })

  it('returns the committed row after a concurrent duplicate insert without deleting the object', async () => {
    const { remove } = client(null, null, undefined, { id: 2, object_path: payload.path, media_kind: 'image' }, { code: '23505' })
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, uploadToken: token }))
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ data: expect.objectContaining({ id: 2, object_path: payload.path }) })
    expect(remove).not.toHaveBeenCalled()
  })

  it('cleans up after definite finalize insert failure', async () => {
    const { remove } = client(null, null, undefined, undefined, { code: 'P0001', message: 'insert failed' })
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, uploadToken: token }))
    expect(response.status).toBe(500)
    expect(remove).toHaveBeenCalledWith([payload.path])
  })

  it('does not clean up when the finalize response is unusable', async () => {
    const { remove } = client(null, null, undefined, undefined, null)
    const token = createCommunityMediaUploadToken(JSON.stringify(payload), Date.now() + 60_000)
    const response = await finalize(request({ ...payload, uploadToken: token }))
    expect(response.status).toBe(500)
    expect(remove).not.toHaveBeenCalled()
  })
})
