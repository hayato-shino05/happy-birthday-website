import { NextRequest } from 'next/server'
import {
  TimeCapsuleError,
  errorResponse,
  findByAccessCode,
  parseAccessCode,
  serializeCapsule,
} from '@/lib/time-capsule/server'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new TimeCapsuleError('invalid_input', 400, '入力内容が無効です')
    }
    const accessCode = (body as Record<string, unknown>).accessCode
    if (typeof accessCode !== 'string') {
      throw new TimeCapsuleError('invalid_access_code', 401, 'アクセスコードが無効です')
    }
    const { client, row } = await findByAccessCode(parseAccessCode(accessCode))
    return Response.json(
      { data: await serializeCapsule(client, row) },
      { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }
    )
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(new TimeCapsuleError('invalid_input', 400, '入力内容が無効です'))
    }
    return errorResponse(error)
  }
}
