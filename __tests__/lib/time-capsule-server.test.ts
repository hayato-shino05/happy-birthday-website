import { beforeEach, describe, expect, it, vi } from 'vitest'

const { maybeSingle, query, createClient } = vi.hoisted(() => {
  const maybeSingle = vi.fn()
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    gt: vi.fn(() => query),
    maybeSingle,
  }
  return {
    maybeSingle,
    query,
    createClient: vi.fn(() => ({
      from: vi.fn(() => query),
      storage: { from: vi.fn() },
    })),
  }
})

vi.mock('@supabase/supabase-js', () => ({ createClient }))

import {
  createInviteToken,
  findByInviteToken,
  hashInviteToken,
  parseInviteToken,
  serializeCapsule,
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
    expect(() => parseInviteToken('short')).toThrowError(TimeCapsuleError)
    expect(createClient).not.toHaveBeenCalled()
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
})
