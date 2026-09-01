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
  it('ignores invalid pagination and escapes PostgREST search syntax', async () => {
    query.or.mockClear()
    query.limit.mockClear()
    query.range.mockClear()

    const request = new NextRequest('http://localhost/api/media?search=a,b%22%5C&limit=Infinity&offset=-1')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(query.limit).not.toHaveBeenCalled()
    expect(query.range).not.toHaveBeenCalled()
    expect(query.or).toHaveBeenCalledWith(expect.stringContaining('a,b\\"\\\\'))
  })
})
