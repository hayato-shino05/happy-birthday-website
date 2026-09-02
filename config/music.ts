export interface MusicTrack {
  id: string
  name: string
  url: string
  duration?: number
  category: string
}

export const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'happy-birthday-classic',
    name: 'Happy Birthday (Classic)',
    url: '/audio/happy-birthday.mp3',
    category: 'Birthday',
  },
]

export const MUSIC_CATEGORIES = ['Birthday']

export function getCuratedMusicTrack(trackId: string): MusicTrack | null {
  return DEFAULT_MUSIC_TRACKS.find((track) => track.id === trackId) ?? null
}
