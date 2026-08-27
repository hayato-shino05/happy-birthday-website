import { beforeEach, describe, expect, it, vi } from 'vitest'

const { maybeSingle, query, rpc, createClient } = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const rpc = vi.fn()
  const query = {
    select: vi.fn(() => query),
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    gt: vi.fn(() => query),
    maybeSingle,
  }
  return {
    maybeSingle,
    query,
    rpc,
    createClient: vi.fn(() => ({
      from: vi.fn(() => query),
      rpc,
      storage: { from: vi.fn() },
    })),
  }
})

vi.mock('@supabase/supabase-js', () => ({ createClient }))

import {
  createAccessCode,
  findByAccessCode,
  TIME_CAPSULE_SELECT,
  getAccessAttemptBucketFingerprint,
  createInviteToken,
  findByInviteToken,
  hashAccessCode,
  hashInviteToken,
  parseAccessCode,
  parseInviteToken,
  serializeCapsule,
  recordFirstOpen,
  TimeCapsuleError,
} from '@/lib/time-capsule/server'

describe('Time Capsule server boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key'
  })

  it('rejects malformed invite tokens before lookup', () => {
    expect(() => parseInviteToken('short')).toThrow(TimeCapsuleError)
    expect(createClient).not.toHaveBeenCalled()
  })

  it('keeps reads compatible before the open-tracking migration', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 1, message: 'secret' }, error: null })

    const result = await findByInviteToken('a'.repeat(43))

    expect(result.row).toEqual({ id: 1, message: 'secret' })
    expect(query.select).toHaveBeenCalledWith(TIME_CAPSULE_SELECT)
    expect(TIME_CAPSULE_SELECT).not.toContain('opened_at')
  })

  it('rejects expired or revoked invite lookup results', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(findByInviteToken('a'.repeat(43))).rejects.toMatchObject({ code: 'invite_not_found', status: 404 })
    expect(query.is).toHaveBeenCalledWith('invite_revoked_at', null)
    expect(query.gt).toHaveBeenCalledWith('invite_token_expires_at', expect.any(String))
  })

  it('does not expose sealed capsule content', async () => {
    const client = { storage: { from: vi.fn() } } as never
    const result = await serializeCapsule(client, {
      id: 1,
      owner_id: 'owner-1',
      sender: 'A',
      recipient: null,
      message: 'secret',
      photo_url: 'https://example.invalid/photo.jpg',
      photo_object_path: 'owner-1/photo.jpg',
      unlock_date: '2999-01-01',
      created_at: '2026-01-01T00:00:00.000Z',
      invite_token_hash: null,
      invite_token_expires_at: null,
      invite_revoked_at: null,
    })

    expect(result).not.toHaveProperty('message')
    expect(result).not.toHaveProperty('photoUrl')
    expect(result.isUnlocked).toBe(false)
  })

  it('derives the same invite token for an idempotent replay', () => {
    const original = createInviteToken('owner-1', 'same-key')
    expect(createInviteToken('owner-1', 'same-key')).toBe(original)
    expect(createInviteToken('owner-1', 'different-key')).not.toBe(original)
  })

  it('hashes invite tokens without exposing the raw token', () => {
    const token = 'a'.repeat(43)
    expect(hashInviteToken(token)).toMatch(/^[a-f0-9]{64}$/)
    expect(hashInviteToken(token)).not.toBe(token)
  })

  it('creates the same six-digit access code for an idempotent replay', () => {
    const code = createAccessCode('owner-1', 'same-key')
    expect(code).toMatch(/^\d{6}$/)
    expect(createAccessCode('owner-1', 'same-key')).toBe(code)
    expect(createAccessCode('owner-1', 'different-key')).not.toBe(code)
    expect(parseAccessCode(` ${code.slice(0, 3)}-${code.slice(3)} `)).toBe(code)
    expect(hashAccessCode(code)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('rejects malformed access codes', () => {
    expect(() => parseAccessCode('12345')).toThrow(TimeCapsuleError)
    expect(() => parseAccessCode('1234567')).toThrow(TimeCapsuleError)
    expect(() => parseAccessCode('abcdef')).toThrow(TimeCapsuleError)
  })

  it('does not use spoofable proxy headers for the attempt bucket', () => {
    const first = new Request('http://localhost', {
      headers: { 'user-agent': 'test-browser', 'x-forwarded-for': '203.0.113.10' },
    })
    const second = new Request('http://localhost', {
      headers: { 'user-agent': 'test-browser', 'x-forwarded-for': '198.51.100.2' },
    })

    expect(getAccessAttemptBucketFingerprint(first)).toBe(getAccessAttemptBucketFingerprint(second))
    expect(getAccessAttemptBucketFingerprint(first)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('consumes an access code through the atomic RPC and loads its capsule', async () => {
    rpc.mockResolvedValue({ data: [{ capsule_id: 1 }], error: null })
    maybeSingle.mockResolvedValue({ data: { id: 1 }, error: null })

    const result = await findByAccessCode('123456', 'a'.repeat(64))

    expect(result.row).toEqual({ id: 1 })
    expect(rpc).toHaveBeenCalledWith('consume_time_capsule_access_code', {
      input_code_hash: expect.any(String),
      input_attempt_bucket: expect.stringMatching(/^[a-f0-9]{64}$/),
    })
    expect(query.eq).toHaveBeenCalledWith('id', 1)
  })

  it('rejects an access code when the RPC returns no access row', async () => {
    rpc.mockResolvedValue({ data: [], error: null })

    await expect(findByAccessCode('123456', 'a'.repeat(64))).rejects.toMatchObject({ code: 'access_not_found', status: 404 })
    expect(maybeSingle).not.toHaveBeenCalled()
  })

  it('rejects an access code when its capsule row is missing', async () => {
    rpc.mockResolvedValue({ data: [{ capsule_id: 1 }], error: null })
    maybeSingle.mockResolvedValue({ data: null, error: null })

    await expect(findByAccessCode('123456', 'a'.repeat(64))).rejects.toMatchObject({ code: 'access_not_found', status: 404 })
  })

  it('records first open once for an unlocked capsule', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 1 }, error: null })
    const select = vi.fn(() => ({ maybeSingle }))
    const is = vi.fn(() => ({ select }))
    const eq = vi.fn(() => ({ is }))
    const update = vi.fn(() => ({ eq }))
    const client = { from: vi.fn(() => ({ update })) } as never

    const recorded = await recordFirstOpen(client, {
      id: 1,
      owner_id: 'owner-1',
      sender: 'A',
      recipient: null,
      message: 'secret',
      photo_url: null,
      photo_object_path: null,
      unlock_date: '2026-08-26',
      created_at: '2026-01-01T00:00:00.000Z',
      invite_token_hash: null,
      invite_token_expires_at: null,
      invite_revoked_at: null,
    }, '2026-08-26T10:00:00.000Z')

    expect(recorded).toBe(true)
    expect(update).toHaveBeenCalledWith({ opened_at: '2026-08-26T10:00:00.000Z' })
    expect(eq).toHaveBeenCalledWith('id', 1)
    expect(is).toHaveBeenCalledWith('opened_at', null)
  })

  it('does not record a sealed capsule', async () => {
    const from = vi.fn()
    const client = { from } as never

    const recorded = await recordFirstOpen(client, {
      id: 1,
      owner_id: 'owner-1',
      sender: 'A',
      recipient: null,
      message: 'secret',
      photo_url: null,
      photo_object_path: null,
      unlock_date: '2999-01-01',
      created_at: '2026-01-01T00:00:00.000Z',
      invite_token_hash: null,
      invite_token_expires_at: null,
      invite_revoked_at: null,
    }, '2026-08-26T10:00:00.000Z')

    expect(recorded).toBe(false)
    expect(from).not.toHaveBeenCalled()
  })
})
