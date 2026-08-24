import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TimeCapsule, { parseLocalCapsules, parseRemoteCapsule } from '@/components/community/TimeCapsule'
import { createTimeCapsule, listTimeCapsules } from '@/lib/time-capsule-client'

const languageMock = vi.hoisted(() => ({ value: 'ja' as 'ja' | 'en' }))
const listMock = vi.hoisted(() => vi.fn())
const createMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/time-capsule-client', () => ({
  listTimeCapsules: listMock,
  createTimeCapsule: createMock,
}))

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    language: languageMock.value,
    t: (key: string, params?: { date?: string }) => `${key}${params?.date ? `:${params.date}` : ''}`,
  }),
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

const futureDate = '2999-12-31'
const pastDate = '2000-01-01'

type CapsuleRow = {
  id: number
  sender: string
  recipient: string | null
  message: string | null
  photo_url: string | null
  unlock_date: string
  created_at: string
}

function row(overrides: Partial<CapsuleRow> = {}): CapsuleRow {
  return {
    id: 1,
    sender: 'テスト送信者',
    recipient: null,
    message: 'private capsule message',
    photo_url: 'https://example.test/private.jpg',
    unlock_date: futureDate,
    created_at: '2026-08-23T00:00:00.000Z',
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  listMock.mockReset()
  createMock.mockReset()
  languageMock.value = 'ja'
  vi.spyOn(globalThis, 'setInterval').mockImplementation(() => 0 as unknown as ReturnType<typeof setInterval>)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Time Capsule parsers', () => {
  const now = new Date('2026-08-23T12:00:00.000Z')

  it('parses a remote capsule and hides locked content', () => {
    expect(parseRemoteCapsule(row(), now)).toMatchObject({
      id: 1,
      unlockDate: futureDate,
      isUnlocked: false,
      message: '',
      photoUrl: undefined,
    })
  })

  it('keeps opened content and filters malformed records', () => {
    expect(parseRemoteCapsule(row({ unlock_date: pastDate }), now)).toMatchObject({
      isUnlocked: true,
      message: 'private capsule message',
      photoUrl: 'https://example.test/private.jpg',
    })
    expect(parseRemoteCapsule({ ...row(), unlock_date: '2026-02-30' }, now)).toBeNull()
    expect(parseLocalCapsules({ invalid: true }, now)).toEqual([])
  })
})

describe('TimeCapsule', () => {
  it('loads capsules through the API adapter and hides unopened content', async () => {
    listMock.mockResolvedValue({ data: [row()] })
    render(<TimeCapsule />)

    expect(await screen.findByText(/^timeCapsuleLockedNotice:/)).toBeTruthy()
    expect(listTimeCapsules).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('private capsule message')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('shows opened remote content', async () => {
    listMock.mockResolvedValue({ data: [row({ unlock_date: pastDate })] })
    render(<TimeCapsule />)

    expect(await screen.findByText(/private capsule message/)).toBeTruthy()
  })

  it('keeps valid local fallback data when API fetch fails', async () => {
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1',
      sender: 'ローカル送信者',
      message: 'local message',
      unlockDate: pastDate,
      createdAt: '2026-08-23T00:00:00.000Z',
    }]))
    listMock.mockRejectedValue(new Error('offline'))
    render(<TimeCapsule />)

    expect(await screen.findByText('ローカル送信者')).toBeTruthy()
    expect(screen.getByText((content) => content.includes('local message'))).toBeTruthy()
  })

  it('does not report success when remote create fails, and queues the same idempotency key', async () => {
    listMock.mockResolvedValue({ data: [] })
    createMock.mockRejectedValue(new Error('remote failed'))
    const { container } = render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')
      fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
      fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
      fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })
      await act(async () => {
        fireEvent.submit(container.querySelector('form') as HTMLFormElement)
        await Promise.resolve()
      })

      expect(screen.queryByText('sealedSuccess')).toBeNull()
      expect(screen.getByText('genericError')).toBeTruthy()
      const saved = JSON.parse(localStorage.getItem('local_time_capsules') || '[]')
      expect(saved[0]).toMatchObject({ sender: '投稿者', message: '保存する本文', pendingKey: expect.any(String) })
      expect(createMock).toHaveBeenCalledTimes(1)
  })

  it('syncs pending capsules using the persisted idempotency key', async () => {
    const pendingKey = 'same-key'
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1',
      sender: '保留送信者',
      message: '保留本文',
      unlockDate: futureDate,
      createdAt: '2026-08-23T00:00:00.000Z',
      pendingKey,
    }]))
    createMock.mockResolvedValue({ data: row() })
    listMock.mockResolvedValue({ data: [] })

    render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')

    expect(createTimeCapsule).toHaveBeenCalledWith({
      sender: '保留送信者',
      message: '保留本文',
      unlockDate: futureDate,
    }, pendingKey)
    expect(localStorage.getItem('local_time_capsules')).toBe('[]')
  })

  it('reports attachment failure without submitting a capsule', async () => {
    listMock.mockResolvedValue({ data: [] })
    const { container } = render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(await screen.findByText('uploadFileFailed')).toBeTruthy()
    expect(createTimeCapsule).not.toHaveBeenCalled()
  })
})
