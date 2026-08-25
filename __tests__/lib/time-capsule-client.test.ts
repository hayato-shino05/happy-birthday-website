import { beforeEach, describe, expect, it, vi } from 'vitest'

const createClientMock = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }))

import { createTimeCapsule, listTimeCapsules, redeemTimeCapsule, redeemTimeCapsuleByCode } from '@/lib/time-capsule-client'

const capsule = {
  id: 1,
  sender: '送信者',
  recipient: null,
  unlockDate: '2999-12-31',
  createdAt: '2026-08-24T00:00:00.000Z',
  isUnlocked: false,
}

describe('time-capsule auth bootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    createClientMock.mockReset()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [capsule], count: 1 }), { status: 200 })
    ))
  })

  it('signs in anonymously when no persisted session exists', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null })
    const signInAnonymously = vi.fn().mockResolvedValue({
      data: { session: { access_token: 'anonymous-token' } },
      error: null,
    })
    createClientMock.mockReturnValue({ auth: { getSession, signInAnonymously } })

    await listTimeCapsules()

    expect(signInAnonymously).toHaveBeenCalledTimes(1)
    const [, request] = vi.mocked(fetch).mock.calls[0]
    expect(new Headers(request?.headers).get('Authorization')).toBe('Bearer anonymous-token')

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
      data: capsule,
      accessCode: 'ABCD-EFGH',
      inviteToken: 'invite-token',
      inviteTokenExpiresAt: '2026-09-23T00:00:00.000Z',
      idempotent: false,
    }), { status: 201 }))
    await expect(createTimeCapsule({ sender: '送信者', message: '本文', unlockDate: '2999-12-31' }, 'key'))
      .resolves.toMatchObject({ accessCode: 'ABCD-EFGH', inviteToken: 'invite-token', inviteTokenExpiresAt: '2026-09-23T00:00:00.000Z' })
  })

  it('redeems a capsule with its invite token without anonymous auth', async () => {
    createClientMock.mockReturnValue({ auth: { getSession: vi.fn(), signInAnonymously: vi.fn() } })
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ data: capsule }), { status: 200 }))

    await expect(redeemTimeCapsule('123', 'invite-token')).resolves.toMatchObject({ data: { id: 1 } })

    expect(fetch).toHaveBeenCalledWith('/api/time-capsules/123/access', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ inviteToken: 'invite-token' }),
    }))
  })

  it('redeems a capsule with an access code', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ data: capsule }), { status: 200 }))

    await expect(redeemTimeCapsuleByCode('ABCD-EFGH')).resolves.toMatchObject({ data: { id: 1 } })

    expect(fetch).toHaveBeenCalledWith('/api/time-capsules/access', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ accessCode: 'ABCD-EFGH' }),
    }))
  })
})
