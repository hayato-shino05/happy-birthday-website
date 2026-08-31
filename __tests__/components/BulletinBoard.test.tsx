import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import BulletinBoard from '@/components/community/BulletinBoard'
import { usePosts } from '@/lib/hooks/usePosts'

vi.mock('@/lib/hooks/usePosts', () => ({
  usePosts: vi.fn(),
}))

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    locale: 'en-US',
    t: (key: string) => ({
      bulletinMessagesCount: 'Messages (1)',
      bulletinKeepsakeExportAction: 'Print bulletin keepsake',
      bulletinKeepsakeExportError: 'We could not open the keepsake view. Allow pop-ups and try again.',
      bulletinKeepsakeTitle: 'Bulletin board keepsake',
      mediaAlt: 'Shared media',
      videoMediaLabel: 'Video attachment',
      noBulletinMessages: 'No messages yet.',
      loading: 'Loading',
      retry: 'Retry',
    }[key] ?? key),
  }),
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: () => <span aria-hidden="true" />,
}))

vi.mock('@/components/community/BulletinPost', () => ({
  default: ({ post }: { post: { message: string } }) => <p>{post.message}</p>,
}))

vi.mock('@/components/community/PostDetail', () => ({
  default: () => <div />,
}))

const mockedUsePosts = vi.mocked(usePosts)
const post = {
  id: 'post-1',
  sender: 'Alice',
  message: 'Happy birthday',
  media_object_path: null,
  media_url: 'https://example.com/photo.jpg',
  birthday_person: null,
  created_at: '2026-09-01T00:00:00.000Z',
  likes: 0,
  replies_count: 0,
}

describe('BulletinBoard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(HTMLImageElement.prototype, 'decode')
  })

  it('prints only the displayed post fields after images load', async () => {
    mockedUsePosts.mockReturnValue({
      posts: [post],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })
    const print = vi.fn()
    const printDocument = window.document.implementation.createHTMLDocument()
    vi.spyOn(window, 'open').mockReturnValue({
      document: printDocument,
      focus: vi.fn(),
      print,
      opener: window,
      closed: false,
    } as unknown as Window)

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))
    printDocument.querySelector('img')?.dispatchEvent(new Event('load'))

    await waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(printDocument.body.textContent).toContain('Happy birthday')
    expect(printDocument.body.textContent).toContain('Alice')
    expect(printDocument.querySelector('img')?.src).toBe('https://example.com/photo.jpg')
    expect(print).toHaveBeenCalledOnce()
  })

  it('waits for decoding when an image is already complete', async () => {
    mockedUsePosts.mockReturnValue({
      posts: [post],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })
    const print = vi.fn()
    const decode = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: decode })
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(1)
    const printDocument = window.document.implementation.createHTMLDocument()
    vi.spyOn(window, 'open').mockReturnValue({
      document: printDocument,
      focus: vi.fn(),
      print,
      opener: window,
      closed: false,
    } as unknown as Window)

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))

    await waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(decode).toHaveBeenCalledOnce()
  })

  it('represents video attachments without using an image element', async () => {
    mockedUsePosts.mockReturnValue({
      posts: [{ ...post, media_url: 'https://example.com/video.mp4' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })
    const print = vi.fn()
    const printDocument = window.document.implementation.createHTMLDocument()
    vi.spyOn(window, 'open').mockReturnValue({
      document: printDocument,
      focus: vi.fn(),
      print,
      opener: window,
      closed: false,
    } as unknown as Window)

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))

    await waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(printDocument.querySelector('img')).toBeNull()
    expect(printDocument.body.textContent).toContain('Video attachment')
  })

  it('prints a generic media label for extensionless media URLs', async () => {
    mockedUsePosts.mockReturnValue({
      posts: [{ ...post, media_url: 'https://example.com/media.bin' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })
    const print = vi.fn()
    const printDocument = window.document.implementation.createHTMLDocument()
    vi.spyOn(window, 'open').mockReturnValue({
      document: printDocument,
      focus: vi.fn(),
      print,
      opener: window,
      closed: false,
    } as unknown as Window)

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))

    await waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(printDocument.querySelector('img')).toBeNull()
    expect(printDocument.body.textContent).toContain('Shared media')
  })

  it('shows feedback when the print window is blocked', () => {
    mockedUsePosts.mockReturnValue({
      posts: [post],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })
    vi.spyOn(window, 'open').mockReturnValue(null)

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))

    expect(screen.getByRole('alert')).toHaveTextContent('We could not open the keepsake view')
  })

  it('shows feedback when the board is empty', () => {
    mockedUsePosts.mockReturnValue({
      posts: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      createPost: vi.fn(),
      likePost: vi.fn(),
    })

    render(<BulletinBoard />)
    fireEvent.click(screen.getByRole('button', { name: 'Print bulletin keepsake' }))

    expect(screen.getByRole('alert')).toHaveTextContent('We could not open the keepsake view')
  })
})
