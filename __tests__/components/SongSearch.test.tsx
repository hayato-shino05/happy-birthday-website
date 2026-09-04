import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SongSearch from '@/components/ui/SongSearch'

vi.mock('@/lib/i18n/LanguageContext', () => ({
  useLanguage: () => ({ locale: 'ja-JP', t: (key: string) => key }),
}))

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 200 })))
})

describe('SongSearch listbox keyboard', () => {
  it('exposes role=listbox with options and supports ArrowDown/ArrowUp + Enter', () => {
    const onChange = vi.fn()
    render(<SongSearch value="" onChange={onChange} />)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(listbox).toHaveAttribute('tabindex', '0')
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)

    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(listbox).toHaveAttribute('aria-activedescendant', options[0].id)

    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    expect(listbox).toHaveAttribute('aria-activedescendant', options[1].id)

    fireEvent.keyDown(listbox, { key: 'ArrowUp' })
    expect(listbox).toHaveAttribute('aria-activedescendant', options[0].id)

    fireEvent.keyDown(listbox, { key: 'Enter' })
    expect(onChange).toHaveBeenCalled()
  })

  it('supports Home / End jumping to first and last option', () => {
    render(<SongSearch value="" onChange={() => undefined} />)
    const listbox = screen.getByRole('listbox')
    const options = screen.getAllByRole('option')

    fireEvent.keyDown(listbox, { key: 'End' })
    expect(listbox).toHaveAttribute('aria-activedescendant', options[options.length - 1].id)

    fireEvent.keyDown(listbox, { key: 'Home' })
    expect(listbox).toHaveAttribute('aria-activedescendant', options[0].id)
  })
})
