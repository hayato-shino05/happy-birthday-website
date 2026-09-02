import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({
  errorResponse: vi.fn(),
  findByAccessCode: vi.fn(),
  getAccessAttemptBucketFingerprint: vi.fn(),
  parseAccessCode: vi.fn(),
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

import { POST } from '@/app/api/time-capsules/access/route'

function request(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/time-capsules/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

function malformedRequest(): NextRequest {
  return new NextRequest('http://localhost/api/time-capsules/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  server.parseAccessCode.mockReturnValue('123456')
  server.getAccessAttemptBucketFingerprint.mockReturnValue('a'.repeat(64))
  server.findByAccessCode.mockResolvedValue({ client: {}, row: { id: 1 } })
  server.recordFirstOpen.mockResolvedValue(true)
  server.serializeCapsule.mockResolvedValue({ id: 1, isUnlocked: false })
  server.errorResponse.mockImplementation((error: { code?: string; status?: number }) =>
    Response.json({ error: { code: error.code ?? 'internal_error' } }, { status: error.status ?? 500 })
  )
})

describe('POST /api/time-capsules/access', () => {
  it('redeems a capsule by six-digit access code without authentication', async () => {
    const response = await POST(request({ accessCode: '123 456' }))

    expect(response.status).toBe(200)
    expect(server.parseAccessCode).toHaveBeenCalledWith('123 456')
    expect(server.findByAccessCode).toHaveBeenCalledWith('123456', 'a'.repeat(64))
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ data: { id: 1, isUnlocked: false } })
  })

  it('records the first open for an unlocked access-code access', async () => {
    const data = { id: 1, isUnlocked: true, message: '本文' }
    server.serializeCapsule.mockResolvedValue(data)

    const response = await POST(request({ accessCode: '123456' }))

    expect(response.status).toBe(200)
    expect(server.recordFirstOpen).toHaveBeenCalledWith({}, { id: 1 })
    expect(await response.json()).toEqual({ data })
  })

  it('rejects a request without an access code', async () => {
    const response = await POST(request({}))

    expect(response.status).toBe(401)
    expect(server.findByAccessCode).not.toHaveBeenCalled()
  })

  it('derives a bucket fingerprint from the user agent without trusting proxy headers', async () => {
    await POST(request({ accessCode: '123456' }, { 'user-agent': 'test-browser', 'x-forwarded-for': '203.0.113.10' }))

    const firstRequest = request({ accessCode: '123456' }, { 'user-agent': 'test-browser', 'x-forwarded-for': '203.0.113.10' })
    await POST(firstRequest)

    expect(server.getAccessAttemptBucketFingerprint).toHaveBeenCalledWith(firstRequest)
    expect(server.findByAccessCode).toHaveBeenCalledWith('123456', 'a'.repeat(64))
  })

  it('returns the unlocked capsule when first-open persistence fails', async () => {
    const data = { id: 1, isUnlocked: true, message: '本文' }
    server.serializeCapsule.mockResolvedValue(data)
    server.recordFirstOpen.mockRejectedValue(new Error('database unavailable'))

    const response = await POST(request({ accessCode: '123456' }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data })
  })

  it('returns invalid_input for malformed JSON', async () => {
    const response = await POST(malformedRequest())

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: { code: 'invalid_input' } })
    expect(server.findByAccessCode).not.toHaveBeenCalled()
  })
})
