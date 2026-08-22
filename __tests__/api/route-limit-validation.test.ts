import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

type Builder = Record<string, unknown> & {
  then: (onFulfilled: (result: { data: unknown[]; error: null; count: number }) => void) => void
}

const makeBuilder = (): Builder => {
  const result = { data: [], error: null, count: 0 }
  const builder: Record<string, unknown> = {
    from: () => builder,
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    range: () => builder,
  }
  return Object.assign(builder, {
    then: (onFulfilled: (r: typeof result) => void) => onFulfilled(result),
  }) as Builder
}

let builder: Builder

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => builder,
}))

import { GET as getMessages } from '@/app/api/messages/route'
import { GET as getGifts } from '@/app/api/gifts/route'

describe('route limit validation boundary', () => {
  beforeEach(() => {
    builder = makeBuilder()
    vi.restoreAllMocks()
  })

  it('messages: negative limit does not crash with 500', async () => {
    const response = await getMessages(new NextRequest('http://localhost/api/messages?limit=-1'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('data')
  })

  it('messages: valid limit+offset still returns 200', async () => {
    const response = await getMessages(new NextRequest('http://localhost/api/messages?limit=3&offset=0'))
    expect(response.status).toBe(200)
  })

  it('gifts: negative limit does not crash with 500', async () => {
    const response = await getGifts(new NextRequest('http://localhost/api/gifts?limit=-1'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('data')
  })

  it('gifts: non-numeric limit falls back gracefully', async () => {
    const response = await getGifts(new NextRequest('http://localhost/api/gifts?limit=abc'))
    expect(response.status).toBe(200)
  })
})
