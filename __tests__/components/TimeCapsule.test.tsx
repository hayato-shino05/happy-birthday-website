import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TimeCapsule, {
  parseLocalCapsules,
  parseRemoteCapsule,
} from '@/components/community/TimeCapsule'

const getSupabaseMock = vi.fn()
const languageMock = vi.hoisted(() => ({ value: 'ja' as 'ja' | 'en' }))

type CapsuleRow = {
  id: number
  sender: string
  recipient: string | null
  message: string
  photo_url: string | null
  unlock_date: string
  created_at: string
}

type QueryResult = { data: CapsuleRow[]; error: Error | null }

type SupabaseStub = {
  from: (table: string) => {
    select: (columns: string) => {
      lte: () => { order: () => Promise<QueryResult> }
      gt: () => { order: () => Promise<QueryResult> }
    }
    insert: (payload: Record<string, unknown>) => Promise<{ error: Error | null }>
  }
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: File) => Promise<{
        data: { path: string } | null
        error: Error | null
      }>
      getPublicUrl: (path: string) => { data: { publicUrl: string } }
    }
  }
}

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    language: languageMock.value,
    t: (key: string, params?: { date?: string }) => `${key}${params?.date ? `:${params.date}` : ''}`,
  }),
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => getSupabaseMock(),
}))

function createSupabaseStub({
  openedRows = [],
  sealedRows = [],
  selectError = null,
  openedError = selectError,
  sealedError = selectError,
  insertError = null,
  uploadError = null,
  selectCalls = [],
}: {
  openedRows?: CapsuleRow[]
  sealedRows?: CapsuleRow[]
  selectError?: Error | null
  openedError?: Error | null
  sealedError?: Error | null
  insertError?: Error | null
  uploadError?: Error | null
  selectCalls?: string[]
} = {}): SupabaseStub {
  const from = (table: string) => {
    const query = {
      lte: () => ({ order: async () => ({ data: openedRows, error: openedError }) }),
      gt: () => ({ order: async () => ({ data: sealedRows, error: sealedError }) }),
    }

    return {
      select: (columns: string) => {
        if (table === 'time_capsules') selectCalls.push(columns)
        return query
      },
      insert: async () => ({ error: table === 'time_capsules' ? insertError : null }),
    }
  }

  return {
    from,
    storage: {
      from: () => ({
        upload: async () => ({
          data: uploadError ? null : { path: 'capsule/photo.jpg' },
          error: uploadError,
        }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.test/photo.jpg' } }),
      }),
    },
  }
}

const futureDate = '2999-12-31'
const pastDate = '2000-01-01'

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
  getSupabaseMock.mockReset()
  languageMock.value = 'ja'
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
    expect(parseLocalCapsules([{
      id: 'local-date',
      sender: '日付送信者',
      message: '日付本文',
      unlockDate: '2026-08-23',
      createdAt: '2026-08-23T00:00:00.000Z',
    }], now)[0]).toMatchObject({ isUnlocked: true, message: '日付本文' })
  })
})

describe('TimeCapsule', () => {
  it('hides unopened remote content and requests metadata only', async () => {
    const selectCalls: string[] = []
    getSupabaseMock.mockReturnValue(createSupabaseStub({ sealedRows: [row()], selectCalls }))
    render(<TimeCapsule />)

    expect(await screen.findByText(/^timeCapsuleLockedNotice:/)).toBeTruthy()
    expect(selectCalls).toEqual([
      'id,sender,recipient,message,photo_url,unlock_date,created_at',
      'id,sender,recipient,unlock_date,created_at',
    ])
    expect(screen.queryByText('private capsule message')).toBeNull()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('shows opened remote content', async () => {
    getSupabaseMock.mockReturnValue(createSupabaseStub({ openedRows: [row({ unlock_date: pastDate })] }))
    render(<TimeCapsule />)

    expect(await screen.findByText(/private capsule message/)).toBeTruthy()
  })

  it('shows degraded retry feedback when one query fails', async () => {
    const selectCalls: string[] = []
    getSupabaseMock.mockReturnValue(createSupabaseStub({
      openedRows: [row({ unlock_date: pastDate })],
      sealedError: new Error('sealed query failed'),
      selectCalls,
    }))
    render(<TimeCapsule />)

    expect(await screen.findByText(/private capsule message/)).toBeTruthy()
    expect(screen.getByText('genericError')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'retry' })).toBeTruthy()
  })

  it('formats locked dates for English users', async () => {
    languageMock.value = 'en'
    getSupabaseMock.mockReturnValue(createSupabaseStub({ sealedRows: [row()] }))
    render(<TimeCapsule />)

    const expectedDate = new Date(2999, 11, 31).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    expect(await screen.findByText(`timeCapsuleLockedNotice:${expectedDate}`)).toBeTruthy()
  })

  it('uses valid local fallback data when remote fetch fails', async () => {
    localStorage.setItem(
      'local_time_capsules',
      JSON.stringify([{
        id: 'local-1',
        sender: 'ローカル送信者',
        message: 'local message',
        unlockDate: pastDate,
        createdAt: '2026-08-23T00:00:00.000Z',
      }])
    )
    getSupabaseMock.mockReturnValue(createSupabaseStub({ selectError: new Error('offline') }))
    render(<TimeCapsule />)

    await screen.findByText('ローカル送信者')
    expect(screen.getByText((content) => content.includes('local message'))).toBeTruthy()
  })

  it('ignores malformed local JSON without crashing', async () => {
    localStorage.setItem('local_time_capsules', '{not-json')
    getSupabaseMock.mockReturnValue(createSupabaseStub())
    render(<TimeCapsule />)

    expect(await screen.findByText('timeCapsuleEmptyDesc')).toBeTruthy()
  })

  it('falls back to local storage when insert fails', async () => {
    vi.useFakeTimers()
    try {
      getSupabaseMock.mockReturnValue(createSupabaseStub({ insertError: new Error('insert failed') }))
      const { container } = render(<TimeCapsule />)
      fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
      fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
      fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '保存する本文' } })

      fireEvent.submit(container.querySelector('form') as HTMLFormElement)
      await vi.waitFor(() => {
        expect(screen.getByText('sealedSuccess')).toBeTruthy()
      })

      const saved = JSON.parse(localStorage.getItem('local_time_capsules') || '[]') as Array<{ sender: string; message: string }>
      expect(saved[0]).toMatchObject({ sender: '投稿者', message: '保存する本文' })
      act(() => {
        vi.advanceTimersByTime(1200)
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('reports upload failure without local fallback write', async () => {
    getSupabaseMock.mockReturnValue(createSupabaseStub({ uploadError: new Error('upload failed') }))
    const { container } = render(<TimeCapsule />)
    fireEvent.click(screen.getByRole('button', { name: 'sealNewCapsule' }))
    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '投稿者' } })
    fireEvent.change(screen.getByPlaceholderText('capsuleMessagePlaceholder'), { target: { value: '本文' } })
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })
    fireEvent.submit(container.querySelector('form') as HTMLFormElement)

    expect(await screen.findByText('uploadFileFailed')).toBeTruthy()
    expect(localStorage.getItem('local_time_capsules')).toBeNull()
  })

  it('cleans up the refresh interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    getSupabaseMock.mockReturnValue(createSupabaseStub())
    const { unmount } = render(<TimeCapsule />)
    await screen.findByText('timeCapsuleEmptyDesc')
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
  })
})
