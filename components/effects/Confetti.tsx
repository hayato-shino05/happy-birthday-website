'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePrefersReducedMotion } from '@/lib/hooks/useMediaQuery'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  size: number
  velocityX: number
  velocityY: number
  rotationSpeed: number
  shape: 'square' | 'circle' | 'triangle' | 'star'
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  particleCount?: number
  colors?: string[]
  onComplete?: () => void
}

const defaultColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#FF69B4',
]

interface ConfettiAnimationConfig {
  isActive: boolean
  duration: number
  onComplete?: () => void
  createInitialPieces: () => ConfettiPiece[]
  updatePieces: (pieces: ConfettiPiece[], deltaTime: number) => ConfettiPiece[]
}

function useConfettiAnimation({
  isActive,
  duration,
  onComplete,
  createInitialPieces,
  updatePieces,
}: ConfettiAnimationConfig) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isActive) {
      completedRef.current = false
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) {
      const raf = requestAnimationFrame(() => setPieces([]))
      return () => cancelAnimationFrame(raf)
    }

    if (prefersReducedMotion) {
      const raf = requestAnimationFrame(() => setPieces([]))
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
      return () => cancelAnimationFrame(raf)
    }

    if (completedRef.current) {
      return
    }

    let initialRaf: number | null = null
    let animationId: number | null = null
    let currentPieces: ConfettiPiece[] = []
    let lastTime = performance.now()
    let isRunning = true

    initialRaf = requestAnimationFrame(() => {
      if (!isRunning) return
      currentPieces = createInitialPieces()
      setPieces(currentPieces)

      const step = (currentTime: number) => {
        if (!isRunning) return
        if (currentPieces.length === 0) return

        const deltaTime = (currentTime - lastTime) / 16.67
        lastTime = currentTime

        currentPieces = updatePieces(currentPieces, deltaTime)
        setPieces(currentPieces)

        if (isRunning && currentPieces.length > 0) {
          animationId = requestAnimationFrame(step)
        }
      }

      lastTime = performance.now()
      if (isRunning && currentPieces.length > 0) {
        animationId = requestAnimationFrame(step)
      }
    })

    const timeout = setTimeout(() => {
      isRunning = false
      if (initialRaf !== null) cancelAnimationFrame(initialRaf)
      if (animationId !== null) cancelAnimationFrame(animationId)
      setPieces([])
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
    }, duration)

    return () => {
      isRunning = false
      if (initialRaf !== null) cancelAnimationFrame(initialRaf)
      if (animationId !== null) cancelAnimationFrame(animationId)
      clearTimeout(timeout)
    }
  }, [isActive, duration, createInitialPieces, updatePieces, prefersReducedMotion])

  return { pieces, prefersReducedMotion }
}

export default function Confetti({
  isActive,
  duration = 5000,
  particleCount = 150,
  colors = defaultColors,
  onComplete,
}: ConfettiProps) {
  const createPiece = useCallback((id: number): ConfettiPiece => {
    const shapes: ConfettiPiece['shape'][] = ['square', 'circle', 'triangle', 'star']
    return {
      id,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 8 + Math.random() * 8,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 2 + Math.random() * 3,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }
  }, [colors])

  const createInitialPieces = useCallback(() => {
    return Array.from({ length: particleCount }, (_, i) => createPiece(i))
  }, [particleCount, createPiece])

  const updatePieces = useCallback((current: ConfettiPiece[], deltaTime: number) => {
    return current
      .map((piece) => ({
        ...piece,
        x: piece.x + piece.velocityX * deltaTime * 0.5,
        y: piece.y + piece.velocityY * deltaTime * 0.5,
        rotation: piece.rotation + piece.rotationSpeed * deltaTime,
        velocityY: piece.velocityY + 0.1 * deltaTime,
      }))
      .filter((piece) => piece.y < 120)
  }, [])

  const { pieces, prefersReducedMotion } = useConfettiAnimation({
    isActive,
    duration,
    onComplete,
    createInitialPieces,
    updatePieces,
  })

  // reduced-motion 時は描画もループも停止
  if (prefersReducedMotion) return null

  if (!isActive && pieces.length === 0) return null

  const renderShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
          />
        )
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
            }}
          />
        )
      case 'star':
        return (
          <svg width={piece.size} height={piece.size} viewBox="0 0 24 24" fill={piece.color}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )
      default:
        return (
          <div
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: Math.max(0, 1 - piece.y / 100),
          }}
        >
          {renderShape(piece)}
        </div>
      ))}
    </div>
  )
}

// 指定した位置からのバーストコンフェッティ
interface ConfettiBurstProps {
  x: number
  y: number
  isActive: boolean
  onComplete?: () => void
}

export function ConfettiBurst({ x, y, isActive, onComplete }: ConfettiBurstProps) {
  const createInitialPieces = useCallback(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const angle = (i / 50) * Math.PI * 2
      const velocity = 5 + Math.random() * 10
      return {
        id: i,
        x,
        y,
        rotation: Math.random() * 360,
        color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
        size: 6 + Math.random() * 6,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 5,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: 'square' as const,
      }
    })
  }, [x, y])

  const updatePieces = useCallback((current: ConfettiPiece[]) => {
    return current
      .map((piece) => ({
        ...piece,
        x: piece.x + piece.velocityX,
        y: piece.y + piece.velocityY,
        rotation: piece.rotation + piece.rotationSpeed,
        velocityY: piece.velocityY + 0.5,
        velocityX: piece.velocityX * 0.98,
      }))
      .filter((piece) => piece.y < window.innerHeight + 50)
  }, [])

  const { pieces, prefersReducedMotion } = useConfettiAnimation({
    isActive,
    duration: 3000,
    onComplete,
    createInitialPieces,
    updatePieces,
  })

  if (prefersReducedMotion || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: Math.max(0, 1 - piece.y / window.innerHeight),
          }}
        />
      ))}
    </div>
  )
}
