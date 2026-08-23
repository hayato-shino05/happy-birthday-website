import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

type QueryResult = { data: unknown[]; error: { message: string } | null }

type Builder = Record<string, unknown> & {
  then: (onFulfilled: (result: QueryResult) => void) => void
}

function makeBuilder(result: QueryResult): Builder {
  const builder: Record<string, unknown> = {
    from: () => builder,
    select: () => builder,
    order: () => builder,
    eq: vi.fn(() => builder),
    limit: vi.fn(() => builder),
  }
  return Object.assign(builder, {
    then: (onFulfilled: (r: QueryResult) => void) => onFulfilled(result),
  }) as Builder
}

let builder: Builder

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => builder,
}))

import { GET as getBirthdays } from '@/app/api/birthdays/route'

function call(url: string): Promise<Response> {
  return getBirthdays(new NextRequest(url))
}

describe('GET /api/birthdays query handling', () => {
  beforeEach(() => {
    builder = makeBuilder({ data: [], error: null })
  })

  it('filters by a valid month via eq(month)', async () => {
    const response = await call('http://localhost/api/birthdays?month=10')
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('count')
    expect(builder.eq).toHaveBeenCalledWith('month', 10)
  })

  it('ignores an out-of-range month instead of erroring', async () => {
    const response = await call('http://localhost/api/birthdays?month=13')
    expect(response.status).toBe(200)
    expect(builder.eq).not.toHaveBeenCalled()
  })

  it('ignores a non-numeric month instead of erroring', async () => {
    const response = await call('http://localhost/api/birthdays?month=abc')
    expect(response.status).toBe(200)
    expect(builder.eq).not.toHaveBeenCalled()
  })

  it('returns the 500 envelope when the data source errors', async () => {
    builder = makeBuilder({ data: [], error: { message: 'boom' } })

    const response = await call('http://localhost/api/birthdays')
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(typeof body.error).toBe('string')
  })
})

describe('birthday management boundary', () => {
  it('exposes no anonymous mutating handlers', async () => {
    const mod = await import('@/app/api/birthdays/route')
    // anon は読み取り専用。作成・更新・削除の API 経路を設けない
    expect(mod.GET).toBeTypeOf('function')
    expect((mod as Record<string, unknown>).POST).toBeUndefined()
    expect((mod as Record<string, unknown>).PUT).toBeUndefined()
    expect((mod as Record<string, unknown>).DELETE).toBeUndefined()
  })
})
