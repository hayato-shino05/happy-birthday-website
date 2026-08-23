import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

// 匿名フローを API ハンドラレベルで再現するローカル統合テスト。
// Supabase をメモリ内モックに置き換え、本番データ・本番環境には一切触れない。

type MessageRow = {
  id: number
  sender: string
  message: string
  birthday_person: string | null
  media_object_path: string | null
  created_at: string
}

let rows: MessageRow[]
let nextId: number

function makeBuilder() {
  let filteredRows = [...rows]
  let hasRange = false

  const builder: Record<string, unknown> = {
    from: () => builder,
    select: () => builder,
    insert: (payload: Partial<MessageRow> | Partial<MessageRow>[]) => {
      const list = Array.isArray(payload) ? payload : [payload]
      for (const partial of list) {
        rows.push({
          id: nextId++,
          created_at: new Date().toISOString(),
          birthday_person: null,
          media_object_path: null,
          ...partial,
        } as MessageRow)
      }
      return builder
    },
    single: () => Promise.resolve({ data: rows[rows.length - 1] ?? null, error: null }),
    order: (column: string, { ascending = true }: { ascending?: boolean } = {}) => {
      filteredRows.sort((a, b) => {
        const valA = String(a[column as keyof MessageRow] ?? '')
        const valB = String(b[column as keyof MessageRow] ?? '')
        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
      return builder
    },
    eq: (column: string, value: unknown) => {
      filteredRows = filteredRows.filter((r) => r[column as keyof MessageRow] === value)
      return builder
    },
    limit: (count: number) => {
      if (!hasRange) {
        filteredRows = filteredRows.slice(0, count)
      }
      return builder
    },
    range: (from: number, to: number) => {
      hasRange = true
      filteredRows = filteredRows.slice(from, to + 1)
      return builder
    },
    then: (onFulfilled: (r: { data: MessageRow[]; error: null; count: number }) => void) =>
      onFulfilled({ data: filteredRows, count: filteredRows.length, error: null }),
  }
  return builder
}

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => makeBuilder(),
}))

import { GET as getMessages, POST as postMessage } from '@/app/api/messages/route'

describe('anonymous community flow (local, mocked)', () => {
  beforeEach(() => {
    rows = []
    nextId = 1
  })

  it('anonymous POST is reflected in the anonymous GET list', async () => {
    const postRes = await postMessage(
      new NextRequest('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ sender: '匿名さん', message: 'おめでとう！' }),
      }),
    )
    expect(postRes.status).toBe(201)

    const getRes = await getMessages(new NextRequest('http://localhost/api/messages'))
    expect(getRes.status).toBe(200)
    const body = await getRes.json()
    expect(body.data).toHaveLength(1)
    expect(body.data[0].message).toBe('おめでとう！')
  })

  it('rejects invalid sender/message without persisting', async () => {
    const res = await postMessage(
      new NextRequest('http://localhost/api/messages', {
        method: 'POST',
        body: JSON.stringify({ sender: '', message: '' }),
      }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(typeof body.error).toBe('string')
    expect(rows).toHaveLength(0)
  })

  it('upload route stays a non-mutating stub', async () => {
    const { POST } = await import('@/app/api/upload/route')
    const stub = await POST()
    expect(stub.status).toBe(405)
  })
})
