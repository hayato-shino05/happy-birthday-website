import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button, { IconButton } from '@/components/ui/Button'

describe('Button Component', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByText('Primary')).toBeInTheDocument()

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()

    rerender(<Button variant="danger">Danger</Button>)
    expect(screen.getByText('Danger')).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toBeInTheDocument()
  })

  it('should render with left icon', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">←</span>}>
        With Icon
      </Button>
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('should render with right icon', () => {
    render(
      <Button rightIcon={<span data-testid="right-icon">→</span>}>
        With Icon
      </Button>
    )
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })
})

describe('IconButton Component', () => {
  it('should render with icon', () => {
    render(
      <IconButton
        icon={<span data-testid="icon">★</span>}
        aria-label="Star button"
      />
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('should have aria-label', () => {
    render(
      <IconButton
        icon={<span>★</span>}
        aria-label="Star button"
      />
    )
    expect(screen.getByLabelText('Star button')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(
      <IconButton
        icon={<span>★</span>}
        aria-label="Star"
        onClick={handleClick}
      />
    )

    fireEvent.click(screen.getByLabelText('Star'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
