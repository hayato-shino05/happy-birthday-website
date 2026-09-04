import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const music = vi.hoisted(() => ({ resolveMusicTrack: vi.fn() }))
vi.mock('@/lib/music/server', () => music)

import { GET } from '@/app/api/music/resolve/route'

beforeEach(() => vi.resetAllMocks())

describe('GET /api/music/resolve', () => {
  it('rejects an arbitrary URL before reaching a provider', async () => {
    const response = await GET(new NextRequest('http://localhost/api/music/resolve?ref=https%3A%2F%2Fevil.test%2Faudio.mp3'))

    expect(response.status).toBe(400)
    expect(music.resolveMusicTrack).not.toHaveBeenCalled()
  })

  it('normalizes legacy Jamendo IDs and returns only resolved playback data', async () => {
    music.resolveMusicTrack.mockResolvedValue({ reference: 'jamendo:1503376', provider: 'jamendo', trackId: '1503376', access: 'playable', name: 'Birthday', artistName: 'Artist', duration: 120, streamUrl: 'https://stream.example.test/temporary' })

    const response = await GET(new NextRequest('http://localhost/api/music/resolve?ref=1503376'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(music.resolveMusicTrack).toHaveBeenCalledWith('jamendo:1503376')
    expect(payload.data).toMatchObject({ reference: 'jamendo:1503376', streamUrl: 'https://stream.example.test/temporary' })
    expect(JSON.stringify(payload)).not.toContain('SOUNDCLOUD_CLIENT_SECRET')
  })
})
