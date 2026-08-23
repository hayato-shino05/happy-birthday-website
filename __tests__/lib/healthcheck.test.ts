import { afterEach, describe, expect, it, vi } from 'vitest'

const OK_RESPONSE = { ok: true, status: 200 } as Response

describe('checkSupabaseReadonly', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('performs a read-only GET with apikey headers and reports reachable', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    vi.resetModules()

    const fetchMock = vi.fn().mockResolvedValue(OK_RESPONSE)
    vi.stubGlobal('fetch', fetchMock)

    const { checkSupabaseReadonly } = await import('@/lib/healthcheck')
    const result = await checkSupabaseReadonly(1000, fetchMock as unknown as typeof fetch)

    expect(result).toEqual({ ok: true, status: 200, detail: 'reachable' })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://example.supabase.co/rest/v1/')
    expect(init.method).toBe('GET')
    expect((init.headers as Record<string, string>).apikey).toBe('anon-key')
  })

  it('reports timeout when the endpoint does not respond in time', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    vi.resetModules()

    const fetchMock = vi.fn().mockImplementation(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { checkSupabaseReadonly } = await import('@/lib/healthcheck')
    const result = await checkSupabaseReadonly(20, fetchMock as unknown as typeof fetch)

    expect(result.ok).toBe(false)
    expect(result.detail).toBe('timeout')
  })

  it('reports unhealthy for a non-2xx response without throwing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
    vi.resetModules()

    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 })
    vi.stubGlobal('fetch', fetchMock)

    const { checkSupabaseReadonly } = await import('@/lib/healthcheck')
    const result = await checkSupabaseReadonly(1000, fetchMock as unknown as typeof fetch)

    expect(result).toEqual({ ok: false, status: 503, detail: 'unhealthy' })
  })
})
