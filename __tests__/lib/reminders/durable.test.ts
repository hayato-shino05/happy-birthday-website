import { describe, expect, it, vi } from 'vitest'
import {
  createReminderService,
  createReminderScheduler,
  type ReminderDeliveryRecord,
  type ReminderRepository,
} from '@/lib/reminders/durable'
import type { ReminderProvider } from '@/lib/reminders/engine'

const record = (overrides: Partial<ReminderDeliveryRecord> = {}): ReminderDeliveryRecord => ({
  id: 'log-1',
  eventId: 'birthday:2026-08-26',
  eventType: 'birthday',
  recipientRef: 'opaque-recipient',
  channel: 'in_app',
  scheduledAt: '2026-08-26T09:00:00.000Z',
  timezone: 'Asia/Tokyo',
  idempotencyKey: 'birthday:2026-08-26:opaque-recipient:in_app',
  optedIn: true,
  attemptCount: 0,
  status: 'pending',
  ...overrides,
})

const repository = (overrides: Partial<ReminderRepository> = {}): ReminderRepository => ({
  claimDue: vi.fn().mockResolvedValue([]),
  markSent: vi.fn().mockResolvedValue(undefined),
  markRetryable: vi.fn().mockResolvedValue(undefined),
  markFailed: vi.fn().mockResolvedValue(undefined),
  markCancelled: vi.fn().mockResolvedValue(undefined),
  markExpired: vi.fn().mockResolvedValue(undefined),
  ...overrides,
})

const provider = (send: ReminderProvider['send'] = vi.fn().mockResolvedValue(undefined)): ReminderProvider => ({ send })

const now = new Date('2026-08-26T10:00:00.000Z')

describe('ReminderService', () => {
  it('claims durable records and marks a successful delivery', async () => {
    const store = repository({ claimDue: vi.fn().mockResolvedValue([record()]) })
    const send = vi.fn().mockResolvedValue(undefined)
    const service = createReminderService({ repository: store, provider: provider(send), now: () => now })

    const result = await service.deliverDue('worker-a')

    expect(result).toEqual({ claimed: 1, sent: 1, retryable: 0, failed: 0, skipped: 0 })
    expect(store.claimDue).toHaveBeenCalledWith('worker-a', now, 50)
    expect(store.markSent).toHaveBeenCalledWith('log-1', now)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('leaves transient failures retryable and does not retry permanently', async () => {
    const store = repository({ claimDue: vi.fn().mockResolvedValue([record()]) })
    const send = vi.fn().mockRejectedValue({ code: 'timeout', transient: true })
    const service = createReminderService({ repository: store, provider: provider(send), now: () => now, maxAttempts: 3 })

    const result = await service.deliverDue('worker-a')

    expect(result).toMatchObject({ claimed: 1, sent: 0, retryable: 1, failed: 0 })
    expect(store.markRetryable).toHaveBeenCalledWith('log-1', 1, 'timeout', expect.any(Date))
    expect(store.markFailed).not.toHaveBeenCalled()
  })

  it('does not send opted-out or expired records', async () => {
    const store = repository({ claimDue: vi.fn().mockResolvedValue([
      record({ id: 'opted-out', optedIn: false }),
      record({ id: 'expired', expiresAt: '2026-08-26T09:00:00.000Z' }),
    ]) })
    const send = vi.fn().mockResolvedValue(undefined)
    const service = createReminderService({ repository: store, provider: provider(send), now: () => now })

    const result = await service.deliverDue('worker-a')

    expect(result).toEqual({ claimed: 2, sent: 0, retryable: 0, failed: 0, skipped: 2 })
    expect(store.markCancelled).toHaveBeenCalledWith('opted-out', now)
    expect(store.markExpired).toHaveBeenCalledWith('expired', now)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('ReminderScheduler', () => {
  it('delegates one scheduler tick to the service', async () => {
    const deliverDue = vi.fn().mockResolvedValue({ claimed: 0, sent: 0, retryable: 0, failed: 0, skipped: 0 })
    const scheduler = createReminderScheduler({ service: { deliverDue }, workerId: 'worker-a', batchSize: 10 })

    await scheduler.runOnce()

    expect(deliverDue).toHaveBeenCalledWith('worker-a', 10)
  })
})
