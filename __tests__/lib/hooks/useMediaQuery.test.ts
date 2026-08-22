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

    const mediaQueryList = {
      matches: true,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_type: string, cb: EventListener) => {
        listeners.push(cb as (e: MediaQueryListEvent) => void)
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList

    vi.spyOn(window, 'matchMedia').mockImplementation(() => mediaQueryList)

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)

    act(() => {
      ;(mediaQueryList as unknown as { matches: boolean }).matches = false
      listeners.forEach((cb) => cb({ matches: false } as MediaQueryListEvent))
    })
    expect(result.current).toBe(false)
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

  it('should reflect prefers-reduced-motion from matchMedia', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
    )

    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })
})
