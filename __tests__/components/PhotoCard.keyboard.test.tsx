import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PhotoCard } from '@/components/features/PhotoCard'
import type { MediaFile } from '@/types'

const media: MediaFile = {
  id: 1,
  file_name: 'a.png',
  file_path: '/a.png',
  file_type: 'image',
  file_size: 1,
  created_at: '2026-01-01T00:00:00Z',
}

describe('PhotoCard keyboard interaction', () => {
  it('activates onClick via Enter and Space keys', () => {
    const onClick = vi.fn()
    render(<PhotoCard media={media} onClick={onClick} />)

    const card = screen.getByRole('button', { name: 'a.png' })
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
