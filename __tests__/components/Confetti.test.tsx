import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import Confetti, { ConfettiBurst } from '@/components/effects/Confetti'
import * as mediaQueryHooks from '@/lib/hooks/useMediaQuery'

describe('Confetti and ConfettiBurst reduced-motion lifecycle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls onComplete exactly once when prefersReducedMotion is true initially', () => {
    vi.spyOn(mediaQueryHooks, 'usePrefersReducedMotion').mockReturnValue(true)
    const onComplete = vi.fn()

    const { rerender } = render(<Confetti isActive={true} onComplete={onComplete} />)
    expect(onComplete).toHaveBeenCalledTimes(1)

    // 再レンダリングしても isActive が true の間は多重発火しないこと
    rerender(<Confetti isActive={true} onComplete={onComplete} />)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('completes exactly once when prefersReducedMotion transitions to true mid-flight', () => {
    const prefersReducedMotionSpy = vi.spyOn(mediaQueryHooks, 'usePrefersReducedMotion').mockReturnValue(false)
    const onComplete = vi.fn()

    const { rerender } = render(<Confetti isActive={true} duration={5000} onComplete={onComplete} />)
    expect(onComplete).not.toHaveBeenCalled()

    // アニメーション途中で reduced-motion が有効化された場合
    prefersReducedMotionSpy.mockReturnValue(true)
    rerender(<Confetti isActive={true} duration={5000} onComplete={onComplete} />)

    expect(onComplete).toHaveBeenCalledTimes(1)

    // その後の再レンダリングで重複発火しないこと
    rerender(<Confetti isActive={true} duration={5000} onComplete={onComplete} />)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('ConfettiBurst completes exactly once when prefersReducedMotion is true', () => {
    vi.spyOn(mediaQueryHooks, 'usePrefersReducedMotion').mockReturnValue(true)
    const onComplete = vi.fn()

    const { rerender } = render(<ConfettiBurst x={100} y={100} isActive={true} onComplete={onComplete} />)
    expect(onComplete).toHaveBeenCalledTimes(1)

    rerender(<ConfettiBurst x={100} y={100} isActive={true} onComplete={onComplete} />)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('does not restart or duplicate onComplete when onComplete reference changes after timeout', () => {
    vi.useFakeTimers()
    try {
      vi.spyOn(mediaQueryHooks, 'usePrefersReducedMotion').mockReturnValue(false)
      const onComplete1 = vi.fn()
      const { rerender } = render(<Confetti isActive={true} duration={1000} onComplete={onComplete1} />)

      expect(onComplete1).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1000)
      expect(onComplete1).toHaveBeenCalledTimes(1)

      // 完了後に親が新しい onComplete 参照を渡して再レンダリング
      const onComplete2 = vi.fn()
      rerender(<Confetti isActive={true} duration={1000} onComplete={onComplete2} />)

      // 新しいタイマーが進んでも onComplete2 は呼ばれず、再開しない
      vi.advanceTimersByTime(1000)
      expect(onComplete2).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })
})
