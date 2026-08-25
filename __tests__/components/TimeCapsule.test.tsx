import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TimeCapsule, { parseLocalCapsules, parseRemoteCapsule } from '@/components/community/TimeCapsule'
import { createTimeCapsule, listTimeCapsules } from '@/lib/time-capsule-client'

const languageMock = vi.hoisted(() => ({ value: 'ja' as 'ja' | 'en' }))
const listMock = vi.hoisted(() => vi.fn())
const createMock = vi.hoisted(() => vi.fn())
const redeemMock = vi.hoisted(() => vi.fn())
const uploadMock = vi.hoisted(() => vi.fn())
const deletePhotoMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/time-capsule-client', () => ({
  listTimeCapsules: listMock,
  createTimeCapsule: createMock,
  redeemTimeCapsule: redeemMock,
  uploadTimeCapsulePhoto: uploadMock,
  deleteTimeCapsulePhoto: deletePhotoMock,
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
  redeemMock.mockReset()
  uploadMock.mockReset()
  deletePhotoMock.mockReset()
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

  it('shows unlocked content after redeeming an invite token', async () => {
    listMock.mockResolvedValue({ data: [] })
    redeemMock.mockResolvedValue({ data: row({ unlock_date: pastDate }) })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.change(screen.getByLabelText('timeCapsuleIdLabel'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('timeCapsuleInviteTokenLabel'), { target: { value: 'invite-token' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    expect(redeemMock).toHaveBeenCalledWith('1', 'invite-token')
    expect(screen.getByText('private capsule message')).toBeTruthy()
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

  it('shows the invite token details after sealing a capsule', async () => {
    const expiresAt = '2030-01-02T00:00:00.000Z'
    listMock.mockResolvedValue({ data: [] })
    createMock.mockResolvedValue({
      data: row(),
      inviteToken: 'invite-token-for-test',
      inviteTokenExpiresAt: expiresAt,
    })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    const inviteToken = screen.getByText('invite-token-for-test')
    const invitePanel = inviteToken.parentElement?.parentElement
    expect(invitePanel).toHaveTextContent('timeCapsuleInviteTitle')
    expect(invitePanel).toHaveTextContent('invite-token-for-test')
    expect(invitePanel).toHaveTextContent('timeCapsuleInviteDescription')
    expect(invitePanel).toHaveTextContent('timeCapsuleIdLabel')
    expect(invitePanel).toHaveTextContent('1')
    expect(invitePanel).toHaveTextContent(`timeCapsuleInviteExpires:${new Date(expiresAt).toLocaleDateString('ja-JP')}`)
  })

  it('keeps the first invite token and does not create a second capsule after repeated submits', async () => {
    let resolveCreate: ((value: { data: CapsuleRow; inviteToken: string; inviteTokenExpiresAt: string }) => void) | undefined
    listMock.mockResolvedValue({ data: [] })
    createMock.mockImplementation(() => new Promise<{ data: CapsuleRow; inviteToken: string; inviteTokenExpiresAt: string }>((resolve) => {
      resolveCreate = resolve
    }))
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(createMock).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveCreate?.({
        data: row(),
        inviteToken: 'invite-token-for-test',
        inviteTokenExpiresAt: '2030-01-02T00:00:00.000Z',
      })
      await Promise.resolve()
    })

    expect(screen.getByText('invite-token-for-test')).toBeTruthy()
  })

  it('keeps a synced pending capsule when remote refresh fails', async () => {
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
    listMock.mockRejectedValue(new Error('offline'))

    render(<TimeCapsule />)
    expect(await screen.findByText('保留送信者')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem('local_time_capsules') || '[]')).toHaveLength(1)
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

  it('shows the invite token returned while synchronizing a pending capsule', async () => {
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1',
      sender: '保留送信者',
      message: '保留本文',
      unlockDate: futureDate,
      createdAt: '2026-08-23T00:00:00.000Z',
      pendingKey: 'same-key',
    }]))
    createMock.mockResolvedValue({
      data: row(),
      inviteToken: 'synced-invite-token',
      inviteTokenExpiresAt: '2030-01-02T00:00:00.000Z',
    })
    listMock.mockResolvedValue({ data: [] })

    render(<TimeCapsule />)

    expect(await screen.findByText('synced-invite-token')).toBeTruthy()
    expect(localStorage.getItem('local_time_capsules')).toBe('[]')
  })

  it('uploads an attachment before creating a capsule', async () => {
    listMock.mockResolvedValue({ data: [] })
    uploadMock.mockResolvedValue('owner/photo.jpg')
    createMock.mockResolvedValue({ data: row() })
    const { container } = render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    expect(uploadMock).toHaveBeenCalledTimes(1)
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ photoObjectPath: 'owner/photo.jpg' }), expect.any(String))
  })

  it('reports attachment upload failure without creating a capsule', async () => {
    listMock.mockResolvedValue({ data: [] })
    uploadMock.mockRejectedValue(new Error('upload failed'))
    const { container } = render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(await screen.findByText('genericError')).toBeTruthy()
    expect(createTimeCapsule).not.toHaveBeenCalled()
  })
})
