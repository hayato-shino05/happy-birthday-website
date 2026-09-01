import { describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const query = {
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  then: (resolve: (value: { data: never[]; error: null; count: number }) => unknown) =>
    Promise.resolve(resolve({ data: [], error: null, count: 0 })),
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({
    from: () => ({
      select: () => ({
        order: () => query,
      }),
    }),
  }),
}))

import { GET } from '@/app/api/media/route'

describe('GET /api/media', () => {
  it('always applies a bounded limit when the requested limit is invalid or too large', async () => {
    query.limit.mockClear()
    query.range.mockClear()

    const response = await GET(new NextRequest('http://localhost/api/media?limit=101&offset=-1'))

    expect(response.status).toBe(200)
    expect(query.limit).toHaveBeenCalledWith(100)
    expect(query.range).not.toHaveBeenCalled()
  })

  it('uses the bounded default when no limit is provided', async () => {
    query.limit.mockClear()

    await GET(new NextRequest('http://localhost/api/media'))

    expect(query.limit).toHaveBeenCalledWith(20)
  })
})
