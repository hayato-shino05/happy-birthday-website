import { NextRequest } from 'next/server'
import {
  TIME_CAPSULE_SELECT,
  TimeCapsuleError,
  createInviteToken,
  errorResponse,
  hashInviteToken,
  parseCapsuleInput,
  parseIdempotencyKey,
  requireUser,
  serializeCapsule,
  createServiceClient,
} from '@/lib/time-capsule/server'

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser(request)
    const client = createServiceClient()
    const { data, error } = await client
      .from('time_capsules')
      .select(TIME_CAPSULE_SELECT)
      .eq('owner_id', user.id)
      .order('unlock_date', { ascending: true })
    if (error) throw new TimeCapsuleError('read_failed', 500, 'Time Capsuleを読み込めません')

    const capsules = await Promise.all(
      (data as unknown[] | null | undefined ?? []).map((row) => serializeCapsule(client, row as Parameters<typeof serializeCapsule>[1]))
    )
    return Response.json({ data: capsules, count: capsules.length })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireUser(request)
    const client = createServiceClient()
    const idempotencyKey = parseIdempotencyKey(request)
    const input = parseCapsuleInput(await request.json(), user.id)
    const inviteToken = createInviteToken()
    const inviteTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await client
      .from('time_capsules')
      .insert({
        owner_id: user.id,
        idempotency_key: idempotencyKey,
        sender: input.sender,
        recipient: input.recipient,
        message: input.message,
        unlock_date: input.unlockDate,
        photo_object_path: input.photoObjectPath,
        invite_token_hash: hashInviteToken(inviteToken),
        invite_token_expires_at: inviteTokenExpiresAt,
      })
      .select(TIME_CAPSULE_SELECT)
      .single()

    if (
      error?.code === '23505' &&
      (error.message?.includes('time_capsules_owner_idempotency_key_uidx') ||
        error.details?.includes('time_capsules_owner_idempotency_key_uidx'))
    ) {
      const existing = await client
        .from('time_capsules')
        .select(TIME_CAPSULE_SELECT)
        .eq('owner_id', user.id)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()
      if (existing.error || !existing.data) throw new TimeCapsuleError('write_failed', 500, 'Time Capsuleを作成できません')
      const capsule = await serializeCapsule(client, existing.data)
      return Response.json({ data: capsule, idempotent: true })
    }
    if (error || !data) throw new TimeCapsuleError('write_failed', 500, 'Time Capsuleを作成できません')

    return Response.json(
      {
        data: await serializeCapsule(client, data),
        inviteToken,
        inviteTokenExpiresAt,
        idempotent: false,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorResponse(error)
  }
}
