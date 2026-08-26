import { describe, expect, it, vi } from 'vitest'
import {
  createReminderEngine,
  type ReminderJob,
  type ReminderProvider,
} from '@/lib/reminders/engine'

const baseJob = (overrides: Partial<ReminderJob> = {}): ReminderJob => ({
  eventId: 'birthday:2026-08-26',
  eventType: 'birthday',
  recipientRef: 'recipient-opaque',
  channel: 'in_app',
  scheduledAt: '2026-08-26T09:00:00.000Z',
  timezone: 'Asia/Tokyo',
  idempotencyKey: 'birthday:2026-08-26:recipient-opaque:in_app',
  optedIn: true,
  ...overrides,
})

const provider = (send: ReminderProvider['send'] = vi.fn().mockResolvedValue(undefined)): ReminderProvider => ({
  send,
})

describe('ReminderEngine', () => {
  it('processes an idempotency key only once', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const first = await engine.process(baseJob())
    const second = await engine.process(baseJob())

    expect(first.status).toBe('sent')
    expect(second.status).toBe('sent')
    expect(second.duplicate).toBe(true)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('re-evaluates a pending job when its scheduled time arrives', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    let now = new Date('2026-08-26T08:00:00.000Z')
    const engine = createReminderEngine({ now: () => now, provider: provider(send) })

    const pending = await engine.process(baseJob())
    now = new Date('2026-08-26T10:00:00.000Z')
    const sent = await engine.process(baseJob())

    expect(pending.status).toBe('pending')
    expect(sent.status).toBe('sent')
    expect(sent.duplicate).toBeUndefined()
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('marks an expired job without calling the provider', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const result = await engine.process(baseJob({ expiresAt: '2026-08-26T09:00:00.000Z' }))

    expect(result.status).toBe('expired')
    expect(send).not.toHaveBeenCalled()
  })

  it('deduplicates an opted-out result without sending', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const first = await engine.process(baseJob({ optedIn: false }))
    const second = await engine.process(baseJob({ optedIn: false }))

    expect(first.status).toBe('cancelled')
    expect(second.status).toBe('cancelled')
    expect(second.duplicate).toBe(true)
    expect(send).not.toHaveBeenCalled()
  })

  it('does not expose private content or personal identifiers in results', async () => {
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T08:00:00.000Z'), provider: provider() })

    const result = await engine.process(baseJob({
      recipientRef: 'opaque-recipient',
      scheduledAt: '2026-08-26T12:00:00.000Z',
    }))

    expect(result).toEqual({ status: 'pending', attemptCount: 0 })
    expect(JSON.stringify(result)).not.toMatch(/message|photo|token|ip|fingerprint/i)
  })

  it('skips opted-out recipients without calling the provider', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const result = await engine.process(baseJob({ optedIn: false }))

    expect(result.status).toBe('cancelled')
    expect(send).not.toHaveBeenCalled()
  })

  it('retries transient failures up to the configured bound', async () => {
    const send = vi.fn()
      .mockRejectedValueOnce({ code: 'timeout', transient: true })
      .mockResolvedValueOnce(undefined)
    const engine = createReminderEngine({
      now: () => new Date('2026-08-26T10:00:00.000Z'),
      provider: provider(send),
      maxAttempts: 2,
    })

    const result = await engine.process(baseJob())

    expect(result.status).toBe('sent')
    expect(result.attemptCount).toBe(2)
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('does not retry permanent failures', async () => {
    const send = vi.fn().mockRejectedValue({ code: 'invalid_recipient', transient: false })
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const result = await engine.process(baseJob())

    expect(result.status).toBe('failed')
    expect(result.attemptCount).toBe(1)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('rejects jobs with invalid timezone or event/channel values', () => {
    expect(() => createReminderEngine({ now: () => new Date(), provider: provider() }).validate(baseJob({ timezone: 'Not/AZone' }))).toThrow()
    expect(() => createReminderEngine({ now: () => new Date(), provider: provider() }).validate(baseJob({ eventType: 'unknown' as never }))).toThrow()
    expect(() => createReminderEngine({ now: () => new Date(), provider: provider() }).validate(baseJob({ channel: 'sms' as never }))).toThrow()
  })

  it('sends a concurrent duplicate only once', async () => {
    let release!: () => void
    const send = vi.fn(() => new Promise<void>((resolve) => {
      release = resolve
    }))
    const engine = createReminderEngine({ now: () => new Date('2026-08-26T10:00:00.000Z'), provider: provider(send) })

    const first = engine.process(baseJob())
    const second = engine.process(baseJob())
    await Promise.resolve()
    expect(send).toHaveBeenCalledTimes(1)

    release()
    const results = await Promise.all([first, second])
    expect(results[0].status).toBe('sent')
    expect(results[1].status).toBe('sent')
  })

  it.each(['email', 'web_push', 'line'] as const)('rejects unapproved channel %s', (channel) => {
    const engine = createReminderEngine({ now: () => new Date(), provider: provider() })

    expect(() => engine.validate(baseJob({ channel }))).toThrow('Reminder channel is not approved')
  })
})
