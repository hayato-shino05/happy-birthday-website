import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260827000000_add_time_capsule_open_tracking.sql'),
  'utf8'
)

describe('time capsule open tracking migration', () => {
  it('adds nullable first-open tracking without public exposure', () => {
    expect(migration).toContain('add column if not exists opened_at timestamptz')
    expect(migration).toContain('time_capsules_opened_at_idx')
    expect(migration).not.toContain('grant select')
    expect(migration).not.toContain('create policy')
  })
})
