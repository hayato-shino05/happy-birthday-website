import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TimeCapsule, { parseLocalCapsules, parseRemoteCapsule } from '@/components/community/TimeCapsule'
import { createTimeCapsule, listTimeCapsules } from '@/lib/time-capsule-client'

const languageMock = vi.hoisted(() => ({ value: 'ja' as 'ja' | 'en' }))
const listMock = vi.hoisted(() => vi.fn())
const createMock = vi.hoisted(() => vi.fn())
const redeemByCodeMock = vi.hoisted(() => vi.fn())
const uploadMock = vi.hoisted(() => vi.fn())
const deletePhotoMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/time-capsule-client', () => ({
  listTimeCapsules: listMock,
  createTimeCapsule: createMock,
  redeemTimeCapsuleByCode: redeemByCodeMock,
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

type CreateResult = { data: CapsuleRow; accessCode?: string }

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
  redeemByCodeMock.mockReset()
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

  it('keeps the empty-state seal action keyboard and touch accessible', async () => {
    listMock.mockResolvedValue({ data: [] })
    render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    const sealButton = screen.getByRole('button', { name: 'timeCapsuleSeal' })

    expect(sealButton).toHaveClass('min-h-[44px]')
    expect(sealButton).toHaveAttribute('type', 'button')
  })

  it('associates the unlock date label with its input', async () => {
    listMock.mockResolvedValue({ data: [] })
    render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))

    expect(screen.getByLabelText(/timeCapsuleUnlockDate/)).toHaveAttribute('id', 'time-capsule-unlock-date')
  })

  it('names and associates the photo selector controls', async () => {
    listMock.mockResolvedValue({ data: [] })
    render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))

    expect(screen.getByLabelText('attachPhotoOptional')).toHaveAttribute('id', 'time-capsule-photo')
    expect(screen.getByRole('button', { name: 'selectPhoto' })).toBeTruthy()
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

  it('normalizes and redeems a six-digit access code', async () => {
    listMock.mockResolvedValue({ data: [] })
    redeemByCodeMock.mockResolvedValue({ data: row({ unlock_date: pastDate }) })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.change(screen.getByLabelText('timeCapsuleAccessCodeLabel'), { target: { value: '482 913' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    expect(redeemByCodeMock).toHaveBeenCalledWith('482913')
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

  it('does not show retry when local fallback storage fails', async () => {
    listMock.mockResolvedValue({ data: [] })
    createMock.mockRejectedValue(new Error('remote failed'))
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    expect(screen.getByText('genericError')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'retry' })).toBeNull()
    expect(setItem).toHaveBeenCalled()
  })

  it('persists uploaded photo path for retry after create failure', async () => {
    listMock.mockResolvedValue({ data: [] })
    uploadMock.mockResolvedValue('owner/photo.jpg')
    createMock
      .mockRejectedValueOnce(new Error('remote failed'))
      .mockResolvedValueOnce({ data: row() })
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

    const saved = JSON.parse(localStorage.getItem('local_time_capsules') || '[]')
    expect(saved[0]).toMatchObject({ photoObjectPath: 'owner/photo.jpg', pendingKey: expect.any(String) })
    expect(deletePhotoMock).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'retry' })).toBeTruthy()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'retry' }))
      await Promise.resolve()
    })
    expect(createMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ photoObjectPath: 'owner/photo.jpg' }), expect.any(String))
    expect(screen.queryByRole('button', { name: 'retry' })).toBeNull()
  })

  it('clears retry state after a pending capsule syncs', async () => {
    const pendingKey = 'same-key'
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1', sender: '保留送信者', message: '保留本文', unlockDate: futureDate,
      createdAt: '2026-08-23T00:00:00.000Z', pendingKey,
    }]))
    createMock.mockResolvedValue({ data: row() })
    listMock.mockResolvedValue({ data: [] })
    render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    expect(screen.queryByRole('button', { name: 'retry' })).toBeNull()
  })

  it('shows the access code after sealing a capsule', async () => {
    listMock.mockResolvedValue({ data: [] })
    createMock.mockResolvedValue({
      data: row(),
      accessCode: '482913',
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

    const accessCode = screen.getByText('482913')
    const accessPanel = accessCode.parentElement?.parentElement
    expect(accessPanel).toHaveTextContent('timeCapsuleInviteTitle')
    expect(accessPanel).toHaveTextContent('482913')
    expect(accessPanel).toHaveTextContent('timeCapsuleInviteDescription')
    expect(accessPanel).not.toHaveTextContent('timeCapsuleIdLabel')
    expect(accessPanel).not.toHaveTextContent('invite-token-for-test')
  })

  it('copies the displayed access code with an accessible action name', async () => {
    listMock.mockResolvedValue({ data: [] })
    createMock.mockResolvedValue({ data: row(), accessCode: '482913' })
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    const copyButton = screen.getByRole('button', { name: 'copyLink timeCapsuleAccessCodeLabel' })
    expect(copyButton).toHaveTextContent('copyLink')
    await act(async () => {
      fireEvent.click(copyButton)
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith('482913')
    expect(copyButton).toHaveTextContent('copied')
  })

  it('keeps the first access code and does not create a second capsule after repeated submits', async () => {
    let resolveCreate: ((value: CreateResult | PromiseLike<CreateResult>) => void) | undefined
    listMock.mockResolvedValue({ data: [] })
    createMock.mockImplementation(() => new Promise<CreateResult>((resolve) => {
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
        accessCode: '482913',
      })
      await Promise.resolve()
    })

    expect(screen.getByText('482913')).toBeTruthy()
  })

  it('blocks a submit during success feedback and allows one after the delayed reset', async () => {
    const resetCallbacks: Array<() => void> = []
    listMock.mockResolvedValue({ data: [] })
    createMock
      .mockResolvedValueOnce({ data: row(), accessCode: '482913' })
      .mockResolvedValueOnce({ data: row({ id: 2 }), accessCode: '731604' })
    const { container } = render(<TimeCapsule />)

    await screen.findByText('timeCapsuleEmptyDesc')
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((callback: TimerHandler) => {
      if (typeof callback === 'function') resetCallbacks.push(callback as () => void)
      return 0
    }) as typeof setTimeout)
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })
    expect(screen.getByText('482913')).toBeTruthy()

    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '二人目' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '二つ目の本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })
    expect(createMock).toHaveBeenCalledTimes(1)

    await act(async () => {
      resetCallbacks[0]?.()
      await Promise.resolve()
    })
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '二人目' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '二つ目の本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    expect(createMock).toHaveBeenCalledTimes(2)
    expect(screen.getByText('482913')).toBeTruthy()
    expect(screen.getByText('731604')).toBeTruthy()
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

  it('shows the access code returned while synchronizing a pending capsule', async () => {
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
      accessCode: '482913',
    })
    listMock.mockResolvedValue({ data: [] })

    render(<TimeCapsule />)

    expect(await screen.findByText('482913')).toBeTruthy()
    expect(localStorage.getItem('local_time_capsules')).toBe('[]')
  })

  it('keeps synchronized access codes when a direct create finishes later', async () => {
    let resolveSync: ((value: { data: CapsuleRow; accessCode: string }) => void) | undefined
    let resolveDirect: ((value: { data: CapsuleRow; accessCode: string }) => void) | undefined
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1', sender: '保留送信者', message: '保留本文', unlockDate: futureDate,
      createdAt: '2026-08-23T00:00:00.000Z', pendingKey: 'same-key',
    }]))
    createMock.mockImplementationOnce(() => new Promise((resolve) => { resolveSync = resolve }))
    createMock.mockImplementationOnce(() => new Promise((resolve) => { resolveDirect = resolve }))
    listMock.mockResolvedValue({ data: [] })
    const { container } = render(<TimeCapsule />)

    fireEvent.click(await screen.findByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)
    await act(async () => {
      resolveSync?.({ data: row({ id: 1 }), accessCode: '482913' })
      await Promise.resolve()
      resolveDirect?.({ data: row({ id: 2 }), accessCode: '731604' })
      await Promise.resolve()
    })

    expect(screen.getByText('482913')).toBeTruthy()
    expect(screen.getByText('731604')).toBeTruthy()
  })

  it('does not erase a newly queued fallback while synchronizing an older capsule', async () => {
    let resolveSync: ((value: { data: CapsuleRow; accessCode?: string }) => void) | undefined
    localStorage.setItem('local_time_capsules', JSON.stringify([{
      id: 'local-1', sender: '保留送信者', message: '保留本文', unlockDate: futureDate,
      createdAt: '2026-08-23T00:00:00.000Z', pendingKey: 'same-key',
    }]))
    createMock.mockImplementationOnce(() => new Promise((resolve) => { resolveSync = resolve }))
    createMock.mockRejectedValueOnce(new Error('remote failed'))
    listMock.mockResolvedValue({ data: [] })
    const { container } = render(<TimeCapsule />)

    fireEvent.click(await screen.findByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '新規送信者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '新規本文' } })
    await act(async () => {
      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await Promise.resolve()
    })

    await act(async () => {
      resolveSync?.({ data: row({ id: 1 }), accessCode: '482913' })
      await Promise.resolve()
    })

    const saved = JSON.parse(localStorage.getItem('local_time_capsules') || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ sender: '新規送信者', message: '新規本文', pendingKey: expect.any(String) })
    expect(screen.getByText('482913')).toBeTruthy()
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
