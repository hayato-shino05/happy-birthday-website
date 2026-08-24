import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface TimeCapsuleRow {
  id: string | number
  sender: string
  recipient: string | null
  message: string | null
  photo_url: string | null
  unlock_date: string
  created_at: string
}

export interface CreateTimeCapsuleInput {
  sender: string
  recipient?: string
  message: string
  unlockDate: string
  photoObjectPath?: string
}

interface ApiCapsule {
  id: string | number
  sender: string
  recipient?: string | null
  message?: string | null
  photoUrl?: string | null
  unlockDate: string
  createdAt: string
  isUnlocked: boolean
}

interface TimeCapsuleResponse {
  data: TimeCapsuleRow[]
}

export interface CreateTimeCapsuleResponse {
  data: TimeCapsuleRow
  inviteToken?: string
  inviteTokenExpiresAt?: string
  idempotent?: boolean
}

let browserClient: SupabaseClient | null = null

function getBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase anonymous authentication is unavailable')
  browserClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return browserClient
}

async function ensureAccessToken(): Promise<string> {
  const client = getBrowserClient()
  const current = await client.auth.getSession()
  if (current.error) throw new Error('Supabase session could not be read')
  if (current.data.session?.access_token) return current.data.session.access_token

  const anonymous = await client.auth.signInAnonymously()
  if (anonymous.error || !anonymous.data.session?.access_token) {
    throw new Error('Anonymous authentication is disabled')
  }
  return anonymous.data.session.access_token
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiCapsule(value: unknown): value is ApiCapsule {
  if (!isRecord(value)) return false
  return (
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.sender === 'string' &&
    (value.recipient === undefined || value.recipient === null || typeof value.recipient === 'string') &&
    (value.message === undefined || value.message === null || typeof value.message === 'string') &&
    (value.photoUrl === undefined || value.photoUrl === null || typeof value.photoUrl === 'string') &&
    typeof value.unlockDate === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.isUnlocked === 'boolean'
  )
}

function toRemoteRow(value: ApiCapsule): TimeCapsuleRow {
  return {
    id: value.id,
    sender: value.sender,
    recipient: value.recipient ?? null,
    message: value.message ?? null,
    photo_url: value.photoUrl ?? null,
    unlock_date: value.unlockDate,
    created_at: value.createdAt,
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function requestCapsules(init: RequestInit): Promise<TimeCapsuleResponse> {
  const accessToken = await ensureAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  const response = await fetch('/api/time-capsules', { ...init, headers })
  const body = await readJson(response)
  if (!response.ok || !isRecord(body) || !Array.isArray(body.data) || !body.data.every(isApiCapsule)) {
    throw new Error('タイムカプセルを処理できません')
  }
  return { data: body.data.map(toRemoteRow) }
}

export function listTimeCapsules(signal?: AbortSignal): Promise<TimeCapsuleResponse> {
  return requestCapsules({
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal,
  })
}

export async function createTimeCapsule(
  input: CreateTimeCapsuleInput,
  idempotencyKey: string,
  signal?: AbortSignal
): Promise<CreateTimeCapsuleResponse> {
  const accessToken = await ensureAccessToken()
  const response = await fetch('/api/time-capsules', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
    signal,
  })
  const body = await readJson(response)
  if (
    !response.ok ||
    !isRecord(body) ||
    !isApiCapsule(body.data) ||
    (body.inviteToken !== undefined && typeof body.inviteToken !== 'string') ||
    (body.inviteTokenExpiresAt !== undefined && typeof body.inviteTokenExpiresAt !== 'string') ||
    (body.idempotent !== undefined && typeof body.idempotent !== 'boolean')
  ) {
    throw new Error('タイムカプセルを保存できません')
  }
  return {
    data: toRemoteRow(body.data),
    inviteToken: body.inviteToken,
    inviteTokenExpiresAt: body.inviteTokenExpiresAt,
    idempotent: body.idempotent,
  }
}
