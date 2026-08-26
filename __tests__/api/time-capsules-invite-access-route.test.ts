import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({
  errorResponse: vi.fn(),
  findByInviteToken: vi.fn(),
  parseId: vi.fn(),
  parseInviteToken: vi.fn(),
  recordFirstOpen: vi.fn(),
  serializeCapsule: vi.fn(),
}))

vi.mock('@/lib/time-capsule/server', () => ({
  TimeCapsuleError: class TimeCapsuleError extends Error {
    constructor(readonly code: string, readonly status: number, message: string) {
      super(message)
    }
  },
  ...server,
}))

import { POST } from '@/app/api/time-capsules/[id]/access/route'

function request(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/time-capsules/1/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  server.parseId.mockReturnValue(1)
  server.parseInviteToken.mockReturnValue('a'.repeat(32))
  server.findByInviteToken.mockResolvedValue({ client: {}, row: { id: 1 } })
  server.recordFirstOpen.mockResolvedValue(true)
  server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: false })
  server.errorResponse.mockImplementation((error: { code?: string; status?: number }) =>
    Response.json({ error: { code: error.code ?? 'internal_error' } }, { status: error.status ?? 500 })
  )
})

describe('POST /api/time-capsules/[id]/access', () => {
  it('returns the unlocked capsule when first-open persistence fails', async () => {
    const data = { id: 1, isUnlocked: true, message: '本文' }
    server.serializeCapsule.mockResolvedValue(data)
    server.recordFirstOpen.mockRejectedValue(new Error('database unavailable'))

    const response = await POST(request({ inviteToken: 'a'.repeat(32) }), { params: Promise.resolve({ id: '1' }) })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data })
  })
})
