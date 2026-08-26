import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260826000000_add_time_capsule_access_attempt_buckets.sql'),
  'utf8'
)

describe('time capsule access attempt migration', () => {
  it('locks and updates the aggregate attempt bucket atomically', () => {
    expect(migration).toContain('time_capsule_access_attempt_buckets')
    expect(migration).toContain('for update')
    expect(migration).toContain('on conflict (bucket_fingerprint) do nothing')
    expect(migration).toContain('failed_attempts + 1')
    expect(migration).toContain("interval '15 minutes'")
  })

  it('keeps all unsuccessful access outcomes empty', () => {
    expect(migration.match(/return;/g)?.length).toBeGreaterThanOrEqual(2)
    expect(migration).toContain('ac.revoked_at is null')
    expect(migration).toContain('tc.invite_revoked_at is null')
  })
})
