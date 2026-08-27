import { beforeEach, describe, expect, it, vi } from 'vitest'

const getSupabaseMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/client', () => ({ getSupabase: getSupabaseMock }))

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
    getSupabaseMock.mockReset()
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
    getSupabaseMock.mockReturnValue({ auth: { getSession, signInAnonymously } })

    await listTimeCapsules()

    expect(getSupabaseMock).toHaveBeenCalledTimes(1)
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

  it('shares an in-flight anonymous sign-in across concurrent requests', async () => {
    let resolveSignIn: ((value: { data: { session: { access_token: string } }; error: null }) => void) | undefined
    const getSession = vi.fn().mockReturnValue({ data: { session: null }, error: null })
    const signInAnonymously = vi.fn().mockImplementation(() => new Promise((resolve) => {
      resolveSignIn = resolve
    }))
    getSupabaseMock.mockReturnValue({ auth: { getSession, signInAnonymously } })
    vi.mocked(fetch).mockImplementation(() => Promise.resolve(
      new Response(JSON.stringify({ data: [capsule], count: 1 }), { status: 200 })
    ))

    const firstRequest = listTimeCapsules()
    const secondRequest = listTimeCapsules()
    await Promise.resolve()
    expect(signInAnonymously).toHaveBeenCalledTimes(1)

    resolveSignIn?.({ data: { session: { access_token: 'shared-token' } }, error: null })
    await expect(Promise.all([firstRequest, secondRequest])).resolves.toHaveLength(2)
  })

  it('redeems a capsule with its invite token without anonymous auth', async () => {
    getSupabaseMock.mockReturnValue({ auth: { getSession: vi.fn(), signInAnonymously: vi.fn() } })
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
