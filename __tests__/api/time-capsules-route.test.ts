import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({
  createInviteToken: vi.fn(),
  createServiceClient: vi.fn(),
  errorResponse: vi.fn(),
  hashInviteToken: vi.fn(),
  parseCapsuleInput: vi.fn(),
  parseIdempotencyKey: vi.fn(),
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

import { POST } from '@/app/api/time-capsules/route'

const input = {
  sender: '送信者',
  recipient: null,
  message: '本文',
  unlockDate: '2999-01-01',
  photoObjectPath: null,
}

const row = {
  id: 1,
  invite_token_hash: 'token-hash',
  invite_token_expires_at: '2030-01-01T00:00:00.000Z',
}

function request(): NextRequest {
  return new NextRequest('http://localhost/api/time-capsules', {
    method: 'POST',
    headers: { 'Idempotency-Key': 'same-key' },
    body: JSON.stringify(input),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  server.requireUser.mockResolvedValue({ user: { id: 'owner-1' } })
  server.parseIdempotencyKey.mockReturnValue('same-key')
  server.parseCapsuleInput.mockReturnValue(input)
  server.createInviteToken.mockReturnValue('invite-token')
  server.hashInviteToken.mockReturnValue('token-hash')
  server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: false })
  server.errorResponse.mockImplementation((error: { code?: string; status?: number }) =>
    Response.json({ error: { code: error.code ?? 'internal_error' } }, { status: error.status ?? 500 })
  )
})

describe('POST /api/time-capsules idempotency', () => {
  it('returns the deterministic token without updating an existing capsule on replay', async () => {
    const insert = vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'time_capsules_owner_idempotency_key_uidx' },
    }) })) }))
    const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null })
    const select = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) })) }))
    server.createServiceClient.mockReturnValue({ from: vi.fn()
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce({ select }) })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(server.createInviteToken).toHaveBeenCalledWith('owner-1', 'same-key')
    expect(server.hashInviteToken).toHaveBeenCalledWith('invite-token')
    expect(await response.json()).toMatchObject({ inviteToken: 'invite-token', idempotent: true })
  })

  it('rejects a replay when the existing token was issued by the legacy scheme', async () => {
    const insert = vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'time_capsules_owner_idempotency_key_uidx' },
    }) })) }))
    const maybeSingle = vi.fn().mockResolvedValue({ data: { ...row, invite_token_hash: 'legacy-hash' }, error: null })
    const select = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) })) }))
    server.createServiceClient.mockReturnValue({ from: vi.fn()
      .mockReturnValueOnce({ insert })
      .mockReturnValueOnce({ select }) })

    const response = await POST(request())

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: { code: 'idempotency_replay_unavailable' } })
  })
})
