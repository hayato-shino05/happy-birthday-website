import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input, { SearchInput, PasswordInput } from '@/components/ui/Input'

describe('Input Component', () => {
  it('should render with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should show required indicator', () => {
    render(<Input label="Email" isRequired />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should display error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should display helper text', () => {
    render(<Input helperText="Enter your email address" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should show character count when enabled', () => {
    render(<Input showCharCount maxLength={100} value="Hello" onChange={() => {}} />)
    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('should render with left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('should render with right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">✓</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })
})

describe('SearchInput Component', () => {
  it('should render search input', () => {
    render(<SearchInput placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('should call onSearch on Enter key', () => {
    const handleSearch = vi.fn()
    render(<SearchInput onSearch={handleSearch} />)

    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(handleSearch).toHaveBeenCalledWith('test query')
  })
})

describe('PasswordInput Component', () => {
  it('should render password input', () => {
    render(<PasswordInput placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should toggle password visibility', () => {
    render(<PasswordInput placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password')
    const toggleButton = screen.getByRole('button')

    expect(input).toHaveAttribute('type', 'password')

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })
})
