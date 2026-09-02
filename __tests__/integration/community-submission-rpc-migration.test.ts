import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migration = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20260901000000_add_community_submission_rpc.sql'), 'utf8')

describe('community submission RPC migration', () => {
  it('keeps the transaction RPC fixed, constrained, and service-only', () => {
    expect(migration).toContain('create or replace function public.create_community_submission(')
    expect(migration).toContain('security definer')
    expect(migration).toContain('set search_path = pg_catalog, public')
    expect(migration).toContain("p_kind is null or p_kind not in ('message', 'post')")
    expect(migration).toContain("p_media_kind is null or p_media_kind not in ('image', 'video', 'audio')")
    expect(migration).toContain("p_media_kind = 'image' and (p_mime_type not like 'image/%' or p_object_path !~ '^images/')")
    expect(migration).toContain("p_media_kind = 'video' and (p_mime_type not like 'video/%' or p_object_path !~ '^videos/')")
    expect(migration).toContain("p_media_kind = 'audio' and (p_mime_type not like 'audio/%' or p_object_path !~ '^audios/')")
    expect(migration).toContain("p_object_path !~ '^(images|videos|audios)/[0-9a-f-]+\\.[a-z0-9]+$'")
    expect(migration).toMatch(/if p_object_path is null then[\s\S]*if p_description is not null[\s\S]*incomplete media metadata/)
    expect(migration).toContain('revoke execute on function public.create_community_submission')
    expect(migration).toContain('from public, anon, authenticated;')
    expect(migration).toContain('to service_role;')
    expect(migration).not.toMatch(/grant .*delete .*community/i)
    expect(migration).not.toContain("or (p_media_kind = 'video' and p_object_path !~ '^videos/')")
    expect(migration).not.toContain("or (p_media_kind = 'audio' and p_object_path !~ '^audios/')")
  })
})
