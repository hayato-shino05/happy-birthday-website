import type { SupabaseClient } from '@supabase/supabase-js'
import {
  createReminderEngine,
  type ReminderChannel,
  type ReminderEventType,
  type ReminderProvider,
  type ReminderStatus,
} from '@/lib/reminders/engine'

export interface ReminderDeliveryRecord {
  id: string
  eventId: string
  eventType: ReminderEventType
  recipientRef: string
  channel: ReminderChannel
  scheduledAt: string
  timezone: string
  idempotencyKey: string
  optedIn: boolean
  attemptCount: number
  status: ReminderStatus
  expiresAt?: string | null
}

export interface ReminderRepository {
  claimDue(workerId: string, now: Date, limit?: number): Promise<ReminderDeliveryRecord[]>
  markSent(id: string, sentAt: Date): Promise<void>
  markRetryable(id: string, attemptCount: number, errorCode: string, nextAttemptAt: Date): Promise<void>
  markFailed(id: string, attemptCount: number, errorCode: string, failedAt: Date): Promise<void>
  markCancelled(id: string, cancelledAt: Date): Promise<void>
  markExpired(id: string, expiredAt: Date): Promise<void>
}

export interface ReminderDeliverySummary {
  claimed: number
  sent: number
  retryable: number
  failed: number
  skipped: number
}

export interface ReminderServiceOptions {
  repository: ReminderRepository
  provider: ReminderProvider
  now: () => Date
  maxAttempts?: number
  batchSize?: number
}

function parseFailure(error: unknown): { code: string; transient: boolean } {
  if (typeof error !== 'object' || error === null) return { code: 'provider_failure', transient: false }
  const value = error as Record<string, unknown>
  return {
    code: typeof value.code === 'string' ? value.code : 'provider_failure',
    transient: value.transient === true,
  }
}

function isExpired(record: ReminderDeliveryRecord, now: Date): boolean {
  return Boolean(record.expiresAt && now >= new Date(record.expiresAt))
}

export function createReminderService(options: ReminderServiceOptions) {
  const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? 3))
  const batchSize = Math.max(1, Math.floor(options.batchSize ?? 50))

  const deliverDue = async (workerId: string, requestedBatchSize = batchSize): Promise<ReminderDeliverySummary> => {
    const now = options.now()
    const records = await options.repository.claimDue(workerId, now, requestedBatchSize)
    const summary: ReminderDeliverySummary = { claimed: records.length, sent: 0, retryable: 0, failed: 0, skipped: 0 }
    const engine = createReminderEngine({ now: options.now, provider: options.provider, maxAttempts: 1 })

    for (const record of records) {
      if (!record.optedIn) {
        await options.repository.markCancelled(record.id, now)
        summary.skipped += 1
        continue
      }
      if (isExpired(record, now)) {
        await options.repository.markExpired(record.id, now)
        summary.skipped += 1
        continue
      }

      try {
        const job = { ...record, expiresAt: record.expiresAt ?? undefined }
        engine.validate(job)
        await options.provider.send(job)
        await options.repository.markSent(record.id, now)
        summary.sent += 1
      } catch (error) {
        const failure = parseFailure(error)
        const attemptCount = record.attemptCount + 1
        if (failure.transient && attemptCount < maxAttempts) {
          const nextAttemptAt = new Date(now.getTime() + 2 ** (attemptCount - 1) * 1000)
          await options.repository.markRetryable(record.id, attemptCount, failure.code, nextAttemptAt)
          summary.retryable += 1
        } else {
          await options.repository.markFailed(record.id, attemptCount, failure.code, now)
          summary.failed += 1
        }
      }
    }

    return summary
  }

  return { deliverDue }
}

export interface ReminderSchedulerService {
  deliverDue(workerId: string, batchSize?: number): Promise<ReminderDeliverySummary>
}

export interface ReminderSchedulerOptions {
  service: ReminderSchedulerService
  workerId: string
  batchSize?: number
}

export function createReminderScheduler(options: ReminderSchedulerOptions) {
  return {
    runOnce: () => options.service.deliverDue(options.workerId, options.batchSize),
  }
}

export function createSupabaseReminderRepository(client: SupabaseClient): ReminderRepository {
  const update = async (id: string, values: Record<string, unknown>): Promise<void> => {
    const { error } = await client.from('notification_logs').update(values).eq('id', id)
    if (error) throw error
  }

  return {
    async claimDue(workerId, now, limit = 50) {
      const { data, error } = await client.rpc('claim_notification_logs', {
        input_worker_id: workerId,
        input_now: now.toISOString(),
        input_limit: limit,
      })
      if (error) throw error
      if (!Array.isArray(data)) return []
      return data as ReminderDeliveryRecord[]
    },
    markSent: (id, sentAt) => update(id, { status: 'sent', sent_at: sentAt.toISOString(), updated_at: sentAt.toISOString(), lease_until: null, leased_by: null }),
    markRetryable: (id, attemptCount, errorCode, nextAttemptAt) => update(id, {
      status: 'retryable', attempt_count: attemptCount, last_error_code: errorCode, next_attempt_at: nextAttemptAt.toISOString(), updated_at: new Date().toISOString(), lease_until: null, leased_by: null,
    }),
    markFailed: (id, attemptCount, errorCode, failedAt) => update(id, {
      status: 'failed', attempt_count: attemptCount, last_error_code: errorCode, updated_at: failedAt.toISOString(), lease_until: null, leased_by: null,
    }),
    markCancelled: (id, cancelledAt) => update(id, { status: 'cancelled', updated_at: cancelledAt.toISOString(), lease_until: null, leased_by: null }),
    markExpired: (id, expiredAt) => update(id, { status: 'expired', updated_at: expiredAt.toISOString(), lease_until: null, leased_by: null }),
  }
}
