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
  {
    id: 'happy-birthday-jazz',
    name: 'Happy Birthday (Jazz)',
    url: '/audio/happy-birthday-jazz.mp3',
    category: 'Birthday',
  },
  {
    id: 'celebration',
    name: 'Celebration',
    url: '/audio/celebration.mp3',
    category: 'Party',
  },
  {
    id: 'party-time',
    name: 'Party Time',
    url: '/audio/party-time.mp3',
    category: 'Party',
  },
  {
    id: 'romantic-birthday',
    name: 'Romantic Birthday',
    url: '/audio/romantic-birthday.mp3',
    category: 'Romantic',
  },
  {
    id: 'kids-birthday',
    name: 'Kids Birthday Song',
    url: '/audio/kids-birthday.mp3',
    category: 'Kids',
  },
]

export const MUSIC_CATEGORIES = [
  'Birthday',
  'Party',
  'Romantic',
  'Kids',
  'Custom',
]
