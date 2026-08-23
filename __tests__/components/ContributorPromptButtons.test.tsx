import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageForm } from '@/components/community/MessageForm'
import PostForm from '@/components/community/PostForm'

const sendMessage = vi.fn()

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
  uploadCommunityMedia: vi.fn(),
}))

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: vi.fn(),
}))

beforeEach(() => {
  sendMessage.mockReset()
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
})
