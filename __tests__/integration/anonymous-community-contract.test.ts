import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('anonymous community contract', () => {
  it('keeps the public tables read/create-only for anon', () => {
    const migration = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20260812163000_reset_and_create_anonymous_community.sql'), 'utf8')
    const tables = ['birthdays', 'messages', 'media_submissions', 'virtual_gifts', 'chat_messages', 'bulletin_posts', 'post_replies']
    const insertTables = ['messages', 'media_submissions', 'virtual_gifts', 'chat_messages', 'bulletin_posts', 'post_replies']

    for (const table of tables) {
      expect(migration).toContain(`create table public.${table}`)
      expect(migration).toContain(`alter table public.${table} enable row level security`)
      expect(migration).toMatch(new RegExp(`grant select on public\\.[^;]*\\b${table}\\b`))
      expect(migration).toMatch(new RegExp(`create policy .* on public\\.${table}.*for select to anon.*using \\(true\\)`, 's'))
      expect(migration).not.toMatch(new RegExp(`grant (?:update|delete) on public\\.[^;]*\\b${table}\\b`))
    }

    for (const table of insertTables) {
      expect(migration).toMatch(new RegExp(`create policy .* on public\\.${table}.*for insert to anon.*with check \\(true\\)`, 's'))
    }

    expect(migration).toContain('grant insert on public.messages, public.media_submissions, public.virtual_gifts, public.chat_messages, public.bulletin_posts, public.post_replies to anon')
    expect(migration).not.toMatch(/for (?:update|delete) to anon/)
  })

  it('exposes likes through an atomic, narrowly granted RPC', () => {
    const migration = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20260817000000_add_bulletin_post_likes.sql'), 'utf8')

    expect(migration).toContain('add column likes integer not null default 0')
    expect(migration).toContain('constraint bulletin_posts_likes_nonnegative check (likes >= 0)')
    expect(migration).toMatch(/update public\.bulletin_posts[\s\S]*set likes = public\.bulletin_posts\.likes \+ 1[\s\S]*returning public\.bulletin_posts\.likes into new_likes/)
    expect(migration).toContain('security definer')
    expect(migration).toContain("set search_path = ''")
    expect(migration).toContain('revoke execute on function public.increment_bulletin_post_likes(bigint) from public, anon, authenticated, service_role;')
    expect(migration).toContain('grant execute on function public.increment_bulletin_post_likes(bigint) to anon;')
  })
})
