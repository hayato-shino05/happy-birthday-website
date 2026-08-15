import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('anonymous community contract', () => {
  it('keeps the public tables read/create-only for anon', () => {
    const migration = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20260812163000_reset_and_create_anonymous_community.sql'), 'utf8')
    const tables = ['birthdays', 'messages', 'media_submissions', 'virtual_gifts', 'chat_messages', 'bulletin_posts']

    for (const table of tables) {
      expect(migration).toContain(`create table public.${table}`)
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toMatch(new RegExp(`grant select on public\\.[^;]*\\b${table}\\b`))
      expect(migration).not.toMatch(new RegExp(`grant (?:update|delete) on public\\.[^;]*\\b${table}\\b`))
    }

    expect(migration).toContain('grant insert on public.messages, public.media_submissions, public.virtual_gifts, public.chat_messages, public.bulletin_posts, public.post_replies to anon')
    expect(migration).not.toMatch(/for (?:update|delete) to anon/)
  })
})
