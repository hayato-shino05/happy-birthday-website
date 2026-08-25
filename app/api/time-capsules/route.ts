import { NextRequest } from 'next/server'
import {
  TIME_CAPSULE_SELECT,
  TimeCapsuleError,
  createAccessCode,
  createInviteToken,
  errorResponse,
  hashAccessCode,
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
    const inviteToken = createInviteToken(user.id, idempotencyKey)
    let accessCode = createAccessCode(user.id, idempotencyKey, 0)
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
      if (existing.data.invite_token_hash !== hashInviteToken(inviteToken)) {
        throw new TimeCapsuleError('idempotency_replay_unavailable', 409, 'Time Capsuleの再送結果を復元できません')
      }
      let existingAccess: { data: { derivation_attempt: number } | null; error: unknown } = { data: null, error: null }
      for (let attempt = 0; attempt < 3; attempt += 1) {
        existingAccess = await client
          .from('time_capsule_access_codes')
          .select('derivation_attempt')
          .eq('capsule_id', existing.data.id)
          .maybeSingle()
        if (!existingAccess.error && existingAccess.data) break
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)))
      }
      if (existingAccess.error || !existingAccess.data) {
        throw new TimeCapsuleError('idempotency_replay_unavailable', 409, 'Time Capsuleの再送結果を復元できません')
      }
      accessCode = createAccessCode(user.id, idempotencyKey, existingAccess.data.derivation_attempt)
      const capsule = await serializeCapsule(client, existing.data)
      const inviteTokenActive =
        existing.data.invite_revoked_at === null &&
        typeof existing.data.invite_token_expires_at === 'string' &&
        existing.data.invite_token_expires_at > new Date().toISOString()
      return Response.json({
        data: capsule,
        ...(inviteTokenActive
          ? { inviteToken, inviteTokenExpiresAt: existing.data.invite_token_expires_at }
          : {}),
        accessCode,
        idempotent: true,
      })
    }
    if (error || !data) throw new TimeCapsuleError('write_failed', 500, 'Time Capsuleを作成できません')

    let accessCodeCreated = false
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = createAccessCode(user.id, idempotencyKey, attempt)
      const result = await client
        .from('time_capsule_access_codes')
        .insert({ capsule_id: data.id, code_hash: hashAccessCode(candidate), derivation_attempt: attempt })
        .select('id')
        .single()
      if (!result.error) {
        accessCode = candidate
        accessCodeCreated = true
        break
      }
      if (result.error.code !== '23505') break
    }
    if (!accessCodeCreated) {
      await client.from('time_capsules').delete().eq('id', data.id)
      throw new TimeCapsuleError('write_failed', 500, 'Time Capsuleを作成できません')
    }

    return Response.json(
      {
        data: await serializeCapsule(client, data),
        inviteToken,
        inviteTokenExpiresAt,
        accessCode,
        idempotent: false,
      },
      { status: 201 }
    )
  } catch (error) {
    return errorResponse(error)
  }
}
