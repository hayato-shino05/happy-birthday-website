import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
  CameraCapture: () => null,
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
})
