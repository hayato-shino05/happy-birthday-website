import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/time-capsule/server', () => server)

import { POST } from '@/app/api/community/route'

function makeClient(rpcResult: { data: unknown; error: Error | null } = { data: { message: { id: 1 } }, error: null }) {
  const remove = vi.fn().mockResolvedValue({ error: null })
  const upload = vi.fn().mockResolvedValue({ error: null })
  const client = {
    rpc: vi.fn().mockResolvedValue(rpcResult),
    storage: { from: vi.fn(() => ({ upload, remove })) },
  }
  server.createServiceClient.mockReturnValue(client)
  return { client, upload, remove }
}

function request(fields: Record<string, string>, file?: File) {
  const body = new FormData()
  Object.entries(fields).forEach(([key, value]) => body.set(key, value))
  if (file) body.set('media', file)
  return { formData: async () => body } as unknown as NextRequest
}

beforeEach(() => vi.resetAllMocks())

describe('POST /api/community', () => {
  it('uploads media and creates a message through the fixed RPC', async () => {
    const { client, upload } = makeClient()
    const response = await POST(request({ kind: 'message', sender: '花子', content: 'おめでとう' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(201)
    expect(upload).toHaveBeenCalledOnce()
    expect(client.rpc).toHaveBeenCalledWith('create_community_submission', expect.objectContaining({ p_kind: 'message', p_object_path: expect.stringMatching(/^images\//) }))
  })

  it('removes uploaded media when the RPC fails and returns a safe error', async () => {
    const { remove } = makeClient({ data: null, error: new Error('database detail') })
    const response = await POST(request({ kind: 'post', sender: '花子', content: '本文' }, new File(['image'], 'cake.png', { type: 'image/png' })))

    expect(response.status).toBe(500)
    expect(remove).toHaveBeenCalledOnce()
    await expect(response.json()).resolves.toEqual({ error: '投稿を送信できません' })
  })

  it('removes uploaded media when the RPC transport rejects', async () => {
    const { client, remove, upload } = makeClient()
    client.rpc.mockRejectedValue(new Error('transport failure'))
    const response = await POST(request({ kind: 'post', sender: '花子', content: '本文' }, new File(['image'], 'cake.png', { type: 'image/png' })))
    const [[uploadedPath]] = upload.mock.calls

    expect(response.status).toBe(500)
    expect(remove).toHaveBeenCalledWith([uploadedPath])
    await expect(response.json()).resolves.toEqual({ error: '投稿を送信できません' })
  })

  it('rejects unsupported input before creating a service client', async () => {
    makeClient()
    const response = await POST(request({ kind: 'message', sender: '', content: '本文' }))

    expect(response.status).toBe(400)
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects overlong optional fields instead of silently dropping them', async () => {
    makeClient()
    const birthdayPersonResponse = await POST(request({
      kind: 'message',
      sender: '花子',
      content: '本文',
      birthdayPerson: 'あ'.repeat(101),
    }))
    const descriptionResponse = await POST(request({
      kind: 'post',
      sender: '花子',
      content: '本文',
      description: 'あ'.repeat(1001),
    }))

    expect(birthdayPersonResponse.status).toBe(400)
    expect(descriptionResponse.status).toBe(400)
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('rejects overlong filenames before uploading media', async () => {
    const { upload } = makeClient()
    const longName = new File(['image'], `${'a'.repeat(252)}.png`, { type: 'image/png' })

    const response = await POST(request({ kind: 'message', sender: '花子', content: '本文' }, longName))

    expect(response.status).toBe(400)
    expect(upload).not.toHaveBeenCalled()
  })
})
