'use client'

import { useRef, useCallback, TouchEvent } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

interface SwipeConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipe?: (direction: SwipeDirection) => void
  threshold?: number // スワイプの最小距離
  preventScroll?: boolean
}

interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onSwipe,
  threshold = 50,
  preventScroll = false,
}: SwipeConfig): SwipeHandlers {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    touchMoveRef.current = null
  }, [])

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      touchMoveRef.current = { x: touch.clientX, y: touch.clientY }

      if (preventScroll) {
        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

        // 横方向のスワイプが検出された場合、スクロールを防止
        if (deltaX > deltaY && deltaX > 10) {
          e.preventDefault()
        }
      }
    },
    [preventScroll]
  )

  const onTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null
      return
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x
    const deltaY = touchMoveRef.current.y - touchStartRef.current.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // スワイプ方向を判定
    if (absX > threshold || absY > threshold) {
      let direction: SwipeDirection

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      // 特定のハンドラーを呼び出し
      switch (direction) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }

      // 汎用ハンドラーを呼び出し
      onSwipe?.(direction)
    }

    touchStartRef.current = null
    touchMoveRef.current = null
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

// ギャラリー/カルーセル用のスワイプフック
export function useGallerySwipe({
  onNext,
  onPrev,
  enabled = true,
}: {
  onNext: () => void
  onPrev: () => void
  enabled?: boolean
}) {
  return useSwipeGesture({
    onSwipeLeft: enabled ? onNext : undefined,
    onSwipeRight: enabled ? onPrev : undefined,
    threshold: 50,
    preventScroll: true,
  })
}
