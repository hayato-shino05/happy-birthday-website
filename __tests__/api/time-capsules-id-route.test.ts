import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
  errorResponse: vi.fn(),
  findByInviteToken: vi.fn(),
  parseId: vi.fn(),
  parseInviteToken: vi.fn(),
  recordFirstOpen: vi.fn(),
  requireUser: vi.fn(),
  serializeCapsule: vi.fn(),
}))

vi.mock('@/lib/time-capsule/server', () => ({
  TIME_CAPSULE_SELECT: 'time-capsule-select',
  TimeCapsuleError: class TimeCapsuleError extends Error {
    constructor(readonly code: string, readonly status: number, message: string) {
      super(message)
    }
  },
  ...server,
}))

import { GET } from '@/app/api/time-capsules/[id]/route'

function request(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/time-capsules/1', { headers })
}

const row = { id: 1, invite_revoked_at: null }

beforeEach(() => {
  vi.resetAllMocks()
  server.parseId.mockReturnValue(1)
  server.parseInviteToken.mockReturnValue('a'.repeat(32))
  server.findByInviteToken.mockResolvedValue({ client: {}, row })
  server.recordFirstOpen.mockResolvedValue(true)
  server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: false })
  server.errorResponse.mockImplementation((error: { code?: string; status?: number }) =>
    Response.json({ error: { code: error.code ?? 'internal_error' } }, { status: error.status ?? 500 })
  )
})

describe('GET /api/time-capsules/[id]', () => {
  it('does not record an unlocked invite GET', async () => {
    const data = { id: 1, isUnlocked: true, message: '本文' }
    server.serializeCapsule.mockResolvedValue(data)

    const response = await GET(request({ 'x-time-capsule-invite-token': 'a'.repeat(32) }), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    expect(server.recordFirstOpen).not.toHaveBeenCalled()
    expect(await response.json()).toEqual({ data })
  })

  it('does not record a sealed invite access', async () => {
    await GET(request({ 'x-time-capsule-invite-token': 'a'.repeat(32) }), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(server.recordFirstOpen).not.toHaveBeenCalled()
  })

  it('does not record an owner view', async () => {
    const from = vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }) })) })) })) }))
    server.requireUser.mockResolvedValue({ user: { id: 'owner-1' } })
    server.createServiceClient.mockReturnValue({ from })
    server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: true, message: '本文' })

    await GET(request(), { params: Promise.resolve({ id: '1' }) })

    expect(server.recordFirstOpen).not.toHaveBeenCalled()
  })

  it('returns unlocked invite content when first-open tracking fails', async () => {
    const data = { id: 1, isUnlocked: true, message: '本文' }
    server.serializeCapsule.mockResolvedValue(data)
    server.recordFirstOpen.mockRejectedValue(new Error('database unavailable'))

    const response = await GET(request({ 'x-time-capsule-invite-token': 'a'.repeat(32) }), {
      params: Promise.resolve({ id: '1' }),
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data })
  })
})
