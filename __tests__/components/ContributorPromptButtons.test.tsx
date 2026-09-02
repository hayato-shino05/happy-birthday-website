import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useId } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageForm } from '@/components/community/MessageForm'
import PostForm from '@/components/community/PostForm'

const sendMessage = vi.fn()
const uploadCommunityMedia = vi.hoisted(() => vi.fn())

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/lib/hooks/useMessages', () => ({
  useMessages: () => ({ sendMessage }),
}))

vi.mock('@/components/community/CameraCapture', () => ({
  CameraCapture: ({ onCapture }: { onCapture: (file: File) => void }) => {
    const instance = useId()
    return (
      <>
        <span data-testid="camera-instance">{instance}</span>
        <button type="button" onClick={() => onCapture(new File(['image'], 'capture.png', { type: 'image/png' }))}>
          mockValidCapture
        </button>
        <button type="button" onClick={() => onCapture(new File(['audio'], 'capture.mp3', { type: 'audio/mpeg' }))}>
          mockInvalidCapture
        </button>
      </>
    )
  },
}))

vi.mock('@/components/ui/Icon', () => ({
  Icon: () => null,
}))

vi.mock('@/lib/supabase/communityMedia', () => ({
  uploadCommunityMedia,
}))

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: vi.fn(),
}))

beforeEach(() => {
  sendMessage.mockReset()
  uploadCommunityMedia.mockReset()
  localStorage.clear()
})

describe('Contributor prompts', () => {
  it('fills an empty message form without submitting and protects existing text', () => {
    render(<MessageForm />)

    const textarea = screen.getByRole('textbox', { name: 'messagePlaceholder' })
    const prompt = screen.getByRole('button', { name: 'contributorPromptBirthday' })

    expect(prompt).toHaveAttribute('type', 'button')
    fireEvent.click(prompt)
    expect(textarea).toHaveValue('contributorPromptBirthday')
    expect(sendMessage).not.toHaveBeenCalled()

    fireEvent.change(textarea, { target: { value: '既存のメッセージ' } })
    expect(prompt).toBeDisabled()
    fireEvent.click(prompt)
    expect(textarea).toHaveValue('既存のメッセージ')
    expect(sendMessage).not.toHaveBeenCalled()
  })

  it('fills an empty post form without submitting and protects existing text', () => {
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<PostForm onSubmit={onSubmit} />)

    const textarea = screen.getByPlaceholderText('typeMessage')
    const prompt = screen.getByRole('button', { name: 'contributorPromptMemory' })

    expect(prompt).toHaveAttribute('type', 'button')
    fireEvent.click(prompt)
    expect(textarea).toHaveValue('contributorPromptMemory')
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.change(textarea, { target: { value: '既存の投稿' } })
    expect(prompt).toBeDisabled()
    fireEvent.click(prompt)
    expect(textarea).toHaveValue('既存の投稿')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('uploads post media through the canonical community media helper', async () => {
    uploadCommunityMedia.mockResolvedValue({ object_path: 'images/post.png' })
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<PostForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '花子' } })
    fireEvent.change(screen.getByPlaceholderText('typeMessage'), { target: { value: 'おめでとう！' } })
    const file = new File(['image'], 'post.png', { type: 'image/png' })
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'postMessage' }))

    await waitFor(() => expect(uploadCommunityMedia).toHaveBeenCalledWith({ file, sender: '花子' }))
    expect(onSubmit).toHaveBeenCalledWith('花子', 'おめでとう！', undefined, 'images/post.png')
  })

  it('normalizes codec-qualified post media MIME types before upload', async () => {
    uploadCommunityMedia.mockResolvedValue({ object_path: 'videos/post.webm' })
    const onSubmit = vi.fn().mockResolvedValue(true)
    render(<PostForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '花子' } })
    fireEvent.change(screen.getByPlaceholderText('typeMessage'), { target: { value: '動画です' } })
    const file = new File(['video'], 'post.webm', { type: 'video/webm;codecs=vp9' })
    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'postMessage' }))

    await waitFor(() => expect(uploadCommunityMedia).toHaveBeenCalled())
    const uploadedFile = uploadCommunityMedia.mock.calls[0][0].file as File
    expect(uploadedFile.type).toBe('video/webm')
  })

  it('closes the PostForm camera only after media validation succeeds', () => {
    render(<PostForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    fireEvent.click(screen.getByRole('button', { name: 'mockValidCapture' }))

    expect(screen.queryByRole('button', { name: 'mockValidCapture' })).not.toBeInTheDocument()
  })

  it('closes the PostForm camera and shows the validation error when capture is rejected', () => {
    render(<PostForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    fireEvent.click(screen.getByRole('button', { name: 'mockInvalidCapture' }))

    expect(screen.queryByRole('button', { name: 'mockInvalidCapture' })).not.toBeInTheDocument()
    expect(screen.getByText('fileTypeError')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    expect(screen.getByRole('button', { name: 'mockInvalidCapture' })).toBeInTheDocument()
  })

  it('closes the MessageForm camera and shows the validation error when capture is rejected', () => {
    render(<MessageForm />)

    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    fireEvent.click(screen.getByRole('button', { name: 'mockInvalidCapture' }))

    expect(screen.queryByRole('button', { name: 'mockInvalidCapture' })).not.toBeInTheDocument()
    expect(screen.getByText('fileTypeError')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    expect(screen.getByRole('button', { name: 'mockInvalidCapture' })).toBeInTheDocument()
  })

  it('closes the MessageForm camera after media validation succeeds', () => {
    render(<MessageForm />)

    fireEvent.click(screen.getByRole('button', { name: 'takePhoto' }))
    fireEvent.click(screen.getByRole('button', { name: 'mockValidCapture' }))

    expect(screen.queryByRole('button', { name: 'mockValidCapture' })).not.toBeInTheDocument()
  })

  it('shows an error when text-only message sending returns false', async () => {
    sendMessage.mockResolvedValue(false)
    render(<MessageForm />)

    fireEvent.change(screen.getByRole('textbox', { name: 'yourName' }), { target: { value: '花子' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'messagePlaceholder' }), { target: { value: 'おめでとう！' } })
    fireEvent.click(screen.getByRole('button', { name: 'sendWish' }))

    await waitFor(() => expect(screen.getByText('sendMessageFailed')).toBeInTheDocument())
  })

  it('keeps the MessageForm success path when saving the sender name fails', async () => {
    sendMessage.mockResolvedValue(true)
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('storage quota exceeded')
    })
    const onSuccess = vi.fn()
    render(<MessageForm onSuccess={onSuccess} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'yourName' }), { target: { value: '花子' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'messagePlaceholder' }), { target: { value: 'おめでとう！' } })
    fireEvent.click(screen.getByRole('button', { name: 'sendWish' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(screen.getByRole('textbox', { name: 'messagePlaceholder' })).toHaveValue('')
    expect(screen.queryByText('genericError')).not.toBeInTheDocument()
    setItemSpy.mockRestore()
  })

  it('shows a safe localized error when PostForm submission throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('database details'))
    render(<PostForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByPlaceholderText('yourName'), { target: { value: '花子' } })
    fireEvent.change(screen.getByPlaceholderText('typeMessage'), { target: { value: 'おめでとう！' } })
    fireEvent.click(screen.getByRole('button', { name: 'postMessage' }))

    await waitFor(() => expect(screen.getByText('genericError')).toBeInTheDocument())
    expect(screen.queryByText('database details')).not.toBeInTheDocument()
  })

  it('shows a safe localized error when MessageForm submission throws', async () => {
    sendMessage.mockRejectedValue(new Error('database details'))
    render(<MessageForm />)

    fireEvent.change(screen.getByRole('textbox', { name: 'yourName' }), { target: { value: '花子' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'messagePlaceholder' }), { target: { value: 'おめでとう！' } })
    fireEvent.click(screen.getByRole('button', { name: 'sendWish' }))

    await waitFor(() => expect(screen.getByText('genericError')).toBeInTheDocument())
    expect(screen.queryByText('database details')).not.toBeInTheDocument()
  })

  it('rejects unsupported post media before upload', () => {
    render(<PostForm onSubmit={vi.fn()} />)
    const file = new File(['audio'], 'post.mp3', { type: 'audio/mpeg' })

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })

    expect(screen.getByText('fileTypeError')).toBeInTheDocument()
  })

  it('rejects post media larger than the canonical 50MB limit', () => {
    render(<PostForm onSubmit={vi.fn()} />)
    const file = new File(['image'], 'post.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 50 * 1024 * 1024 + 1 })

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, { target: { files: [file] } })

    expect(screen.getByText('fileTooLargeWithLimit')).toBeInTheDocument()
  })
})
