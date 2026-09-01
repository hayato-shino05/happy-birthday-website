import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageForm } from '@/components/community/MessageForm'

const sendMessage = vi.hoisted(() => vi.fn())
const uploadCommunityMedia = vi.hoisted(() => vi.fn())
const fetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/lib/hooks/useMessages', () => ({
  useMessages: () => ({ sendMessage }),
}))

vi.mock('@/components/community/CameraCapture', () => ({
  CameraCapture: () => null,
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: () => null,
}))

vi.mock('@/lib/supabase/communityMedia', () => ({
  uploadCommunityMedia,
}))

beforeEach(() => {
  sendMessage.mockReset()
  uploadCommunityMedia.mockReset()
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  localStorage.clear()
})

describe('MessageForm', () => {
  it('submits media through /api/community with FormData without using the browser upload helper', async () => {
    fetchMock.mockResolvedValue({ ok: true })
    render(<MessageForm birthdayPerson="太郎" />)

    fireEvent.change(screen.getByRole('textbox', { name: 'yourName' }), { target: { value: '花子' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'messagePlaceholder' }), { target: { value: 'おめでとう！' } })
    const file = new File(['image'], 'message.png', { type: 'image/png' })
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'sendWish' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/community', expect.objectContaining({ method: 'POST' })))
    const [, request] = fetchMock.mock.calls[0]
    const body = request.body as FormData
    expect(body.get('kind')).toBe('message')
    expect(body.get('sender')).toBe('花子')
    expect(body.get('content')).toBe('おめでとう！')
    expect(body.get('birthdayPerson')).toBe('太郎')
    expect(body.get('media')).toBeInstanceOf(File)
    expect((body.get('media') as File).name).toBe('message.png')
    expect(uploadCommunityMedia).not.toHaveBeenCalled()
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('keeps the text-only path on sendMessage', async () => {
    sendMessage.mockResolvedValue(true)
    render(<MessageForm />)

    fireEvent.change(screen.getByRole('textbox', { name: 'yourName' }), { target: { value: '花子' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'messagePlaceholder' }), { target: { value: 'おめでとう！' } })
    fireEvent.click(screen.getByRole('button', { name: 'sendWish' }))

    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith('花子', 'おめでとう！', undefined, undefined))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(uploadCommunityMedia).not.toHaveBeenCalled()
  })
})
