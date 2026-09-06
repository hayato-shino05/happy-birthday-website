import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const server = vi.hoisted(() => ({ createServiceClient: vi.fn() }))
vi.mock('@/lib/time-capsule/server', () => server)

const birthday = vi.hoisted(() => ({ listTodaysBirthdayThreads: vi.fn() }))
vi.mock('@/lib/birthday/thread', () => birthday)

import { POST } from '@/app/api/internal/birthday-scheduler/route'

const secret = 'scheduler-secret-value'

function request(value?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (value !== undefined) headers['x-birthday-scheduler-secret'] = value
  return new NextRequest('http://localhost/api/internal/birthday-scheduler', {
    method: 'POST',
    headers,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  process.env.BIRTHDAY_SCHEDULER_SECRET = secret
  server.createServiceClient.mockReturnValue({})
  birthday.listTodaysBirthdayThreads.mockResolvedValue([{ id: 1 }, { id: 2 }])
})

describe('POST /api/internal/birthday-scheduler', () => {
  it.each([undefined, 'wrong-secret'])('rejects a request with secret %s', async (value) => {
    const response = await POST(request(value))

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: '認証が必要です' })
    expect(server.createServiceClient).not.toHaveBeenCalled()
  })

  it('runs the shared birthday service and returns the processed count', async () => {
    const response = await POST(request(` ${secret} `))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: { processed: 2 } })
    expect(server.createServiceClient).toHaveBeenCalledOnce()
    expect(birthday.listTodaysBirthdayThreads).toHaveBeenCalledOnce()
    expect(birthday.listTodaysBirthdayThreads).toHaveBeenCalledWith({})
  })

  it('maps service failures to a safe 500 response', async () => {
    birthday.listTodaysBirthdayThreads.mockRejectedValue(new Error(`secret=${secret}`))

    const response = await POST(request(secret))
    const body = await response.text()

    expect(response.status).toBe(500)
    expect(body).toBe('{"error":"誕生日スレッドを生成できません"}')
    expect(body).not.toContain(secret)
    expect(body).not.toContain('stack')
  })

  it('can be invoked repeatedly without changing the shared idempotent path', async () => {
    await POST(request(secret))
    await POST(request(secret))

    expect(birthday.listTodaysBirthdayThreads).toHaveBeenCalledTimes(2)
  })
})
