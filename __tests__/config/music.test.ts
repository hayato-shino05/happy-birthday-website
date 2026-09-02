import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MUSIC_TRACKS,
  getCuratedMusicTrack,
  MUSIC_CATEGORIES,
} from '@/config/music'

describe('curated music catalog', () => {
  it('contains only the bundled track that is available for playback', () => {
    expect(DEFAULT_MUSIC_TRACKS).toEqual([
      {
        id: 'happy-birthday-classic',
        name: 'Happy Birthday (Classic)',
        url: '/audio/happy-birthday.mp3',
        category: 'Birthday',
      },
    ])
  })

  it('does not expose a custom upload category', () => {
    expect(MUSIC_CATEGORIES).not.toContain('Custom')
  })

  it('resolves only catalog track IDs', () => {
    expect(getCuratedMusicTrack('happy-birthday-classic')?.url).toBe('/audio/happy-birthday.mp3')
    expect(getCuratedMusicTrack('user-upload')).toBeNull()
  })
})
