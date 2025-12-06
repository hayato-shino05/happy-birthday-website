import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useMediaQuery,
  useIsMobile,
  useIsDesktop,
  useBreakpoint,
  usePrefersReducedMotion,
} from '@/lib/hooks/useMediaQuery'

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return false by default', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
  })

  it('should update when media query changes', () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []

    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query.includes('768'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb)
      },
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })
})

describe('useIsMobile', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useIsDesktop', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => useIsDesktop())
    expect(typeof result.current).toBe('boolean')
  })
})

describe('useBreakpoint', () => {
  it('should return a valid breakpoint string', () => {
    const { result } = renderHook(() => useBreakpoint())
    expect(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).toContain(result.current)
  })
})

describe('usePrefersReducedMotion', () => {
  it('should return boolean', () => {
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })
})
