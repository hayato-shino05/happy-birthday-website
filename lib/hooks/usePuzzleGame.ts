'use client'

import { useState, useCallback, useEffect } from 'react'

interface PuzzlePiece {
  id: number
  currentPos: number
  correctPos: number
}

interface UsePuzzleGameReturn {
  pieces: PuzzlePiece[]
  moves: number
  isComplete: boolean
  isPlaying: boolean
  timeElapsed: number
  movePiece: (pieceId: number) => void
  startGame: (gridSize?: number) => void
  resetGame: () => void
}

function shufflePuzzle(size: number): PuzzlePiece[] {
  const total = size * size
  const positions = Array.from({ length: total }, (_, i) => i)
  
  // Fisher-Yatesシャッフル
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[positions[i], positions[j]] = [positions[j], positions[i]]
  }

  return positions.map((pos, index) => ({
    id: index,
    currentPos: pos,
    correctPos: index,
  }))
}

function canMove(piecePos: number, emptyPos: number, gridSize: number): boolean {
  const pieceRow = Math.floor(piecePos / gridSize)
  const pieceCol = piecePos % gridSize
  const emptyRow = Math.floor(emptyPos / gridSize)
  const emptyCol = emptyPos % gridSize

  // 隣接している場合のみ移動可能（斜めは不可）
  return (
    (Math.abs(pieceRow - emptyRow) === 1 && pieceCol === emptyCol) ||
    (Math.abs(pieceCol - emptyCol) === 1 && pieceRow === emptyRow)
  )
}

export function usePuzzleGame(): UsePuzzleGameReturn {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [gridSize, setGridSize] = useState(3)
  const [moves, setMoves] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  const emptyPiece = pieces.find((p) => p.id === gridSize * gridSize - 1)
  const isComplete =
    isPlaying &&
    pieces.length > 0 &&
    pieces.every((p) => p.currentPos === p.correctPos)

  // タイマー
  useEffect(() => {
    if (!isPlaying || isComplete) return

    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, isComplete])

  const startGame = useCallback((size: number = 3) => {
    setGridSize(size)
    setPieces(shufflePuzzle(size))
    setMoves(0)
    setTimeElapsed(0)
    setIsPlaying(true)
  }, [])

  const resetGame = useCallback(() => {
    setPieces([])
    setMoves(0)
    setTimeElapsed(0)
    setIsPlaying(false)
  }, [])

  const movePiece = useCallback(
    (pieceId: number) => {
      if (!isPlaying || !emptyPiece) return

      const piece = pieces.find((p) => p.id === pieceId)
      if (!piece || piece.id === emptyPiece.id) return

      if (canMove(piece.currentPos, emptyPiece.currentPos, gridSize)) {
        setPieces((prev) =>
          prev.map((p) => {
            if (p.id === pieceId) {
              return { ...p, currentPos: emptyPiece.currentPos }
            }
            if (p.id === emptyPiece.id) {
              return { ...p, currentPos: piece.currentPos }
            }
            return p
          })
        )
        setMoves((prev) => prev + 1)
      }
    },
    [pieces, emptyPiece, gridSize, isPlaying]
  )

  return {
    pieces,
    moves,
    isComplete,
    isPlaying,
    timeElapsed,
    movePiece,
    startGame,
    resetGame,
  }
}
