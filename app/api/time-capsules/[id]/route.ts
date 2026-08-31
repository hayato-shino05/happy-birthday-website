import { NextRequest } from 'next/server'
import {
  TIME_CAPSULE_SELECT,
  TimeCapsuleError,
  errorResponse,
  findByInviteToken,
  parseId,
  parseInviteToken,
  recordFirstOpen,
  requireUser,
  serializeCapsule,
  createServiceClient,
} from '@/lib/time-capsule/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseId((await params).id)
    const inviteToken = request.headers.get('x-time-capsule-invite-token')
    if (inviteToken) {
      const { client, row } = await findByInviteToken(parseInviteToken(inviteToken), id)
      const data = await serializeCapsule(client, row)
      if (data.isUnlocked === true) {
        try {
          await recordFirstOpen(client, row)
        } catch (error) {
          console.warn('[TimeCapsule] first-open tracking failed', {
            error: error instanceof Error ? error.name : 'unknown_error',
          })
        }
      }
      return Response.json(
        { data },
        { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } }
      )
    }

    const { user } = await requireUser(request)
    const client = createServiceClient()
    const { data, error } = await client
      .from('time_capsules')
      .select(TIME_CAPSULE_SELECT)
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle()
    if (error) throw new TimeCapsuleError('read_failed', 500, 'Time Capsuleを読み込めません')
    if (!data) throw new TimeCapsuleError('not_found', 404, 'Time Capsuleが見つかりません')
    return Response.json({ data: await serializeCapsule(client, data) })
  } catch (error) {
    return errorResponse(error)
  }
}
