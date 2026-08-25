import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({
  createAccessCode: vi.fn(),
  createInviteToken: vi.fn(),
  createServiceClient: vi.fn(),
  errorResponse: vi.fn(),
  hashAccessCode: vi.fn(),
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
  invite_revoked_at: null,
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
  server.createAccessCode.mockImplementation((_owner: string, _key: string, attempt: number) => String(100000 + attempt))
  server.createInviteToken.mockReturnValue('invite-token')
  server.hashAccessCode.mockImplementation((code: string) => `hash-${code}`)
  server.hashInviteToken.mockReturnValue('token-hash')
  server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: false })
  server.errorResponse.mockImplementation((error: { code?: string; status?: number }) =>
    Response.json({ error: { code: error.code ?? 'internal_error' } }, { status: error.status ?? 500 })
  )
})

describe('POST /api/time-capsules', () => {
  it('creates the capsule and access code through one RPC while preserving the response contract', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ capsule_id: '1', derivation_attempt: 0, idempotent: false }], error: null })
    const capsule = vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }) })) })) }))
    server.createServiceClient.mockReturnValue({ rpc, from: vi.fn(() => capsule()) })

    const response = await POST(request())

    expect(response.status).toBe(201)
    expect(rpc).toHaveBeenCalledWith('create_time_capsule_with_access_code', expect.objectContaining({
      input_owner_id: 'owner-1',
      input_idempotency_key: 'same-key',
      input_access_code_hashes: ['hash-100000', 'hash-100001', 'hash-100002', 'hash-100003', 'hash-100004'],
    }))
    expect(await response.json()).toMatchObject({
      data: { id: 1, isUnlocked: false },
      inviteToken: 'invite-token',
      accessCode: '100000',
      idempotent: false,
    })
  })

  it('returns the deterministic access code on an idempotent replay', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ capsule_id: 1, derivation_attempt: 2, idempotent: true }], error: null })
    const capsule = vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: row, error: null }) })) })) }))
    server.createServiceClient.mockReturnValue({ rpc, from: vi.fn(() => capsule()) })

    const response = await POST(request())

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      inviteToken: 'invite-token',
      accessCode: '100002',
      idempotent: true,
    })
  })

  it('maps an RPC collision exhaustion to the existing write error contract', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'access_code_collision_exhausted' } })
    server.createServiceClient.mockReturnValue({ rpc })

    const response = await POST(request())

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: { code: 'write_failed' } })
  })

  it('rejects an unsafe string capsule id from the RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ capsule_id: '9007199254740992', derivation_attempt: 0, idempotent: false }], error: null })
    server.createServiceClient.mockReturnValue({ rpc })

    const response = await POST(request())

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: { code: 'write_failed' } })
  })

  it.each([
    ['legacy invite hash mismatch', 'idempotency_replay_unavailable'],
    ['existing capsule without access row', 'idempotency_replay_unavailable'],
  ])('keeps %s unavailable', async (_case, message) => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message } })
    server.createServiceClient.mockReturnValue({ rpc })

    const response = await POST(request())

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: { code: 'idempotency_replay_unavailable' } })
  })

  it('does not expose a replay token when the existing invite is expired', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [{ capsule_id: 1, derivation_attempt: 0, idempotent: true }], error: null })
    const capsule = vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({
      data: { ...row, invite_token_expires_at: '2020-01-01T00:00:00.000Z' },
      error: null,
    }) })) })) }))
    server.createServiceClient.mockReturnValue({ rpc, from: vi.fn(() => capsule()) })

    const response = await POST(request())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).not.toHaveProperty('inviteToken')
    expect(body).toMatchObject({ accessCode: '100000', idempotent: true })
  })
})
