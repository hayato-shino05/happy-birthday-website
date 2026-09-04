import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageList } from '@/components/community/MessageList'

const messages = [
  {
    id: 1,
    sender: '花子',
    message: 'おめでとう！',
    music_track_id: 'jamendo:1503376',
    created_at: '2026-09-05T12:00:00.000Z',
  },
]

vi.mock('@/lib/hooks/useMessages', () => ({
  useMessages: () => ({ messages, isLoading: false, error: null }),
}))

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({ locale: 'ja-JP', t: (key: string) => key }),
}))

vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div> },
}))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
    data: { streamUrl: 'https://resolver.example/stream', name: 'Birthday Song', artistName: 'Artist' },
  }), { status: 200 })))
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined)
})

describe('MessageList music playback', () => {
  it('resolves a provider-aware reference only after the user requests playback', async () => {
    render(<MessageList />)

    expect(fetch).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'play' }))

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/music/resolve?ref=jamendo%3A1503376'))
    expect(await screen.findByText('Birthday Song')).toBeInTheDocument()
    expect(document.querySelector('audio')).toHaveAttribute('src', 'https://resolver.example/stream')
  })
})
