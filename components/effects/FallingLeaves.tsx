'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FallingLeavesProps {
  count?: number
  active?: boolean
}

interface Leaf {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  rotation: number
  color: string
}

const LEAF_COLORS = ['#E2571E', '#D4A574', '#C17817', '#8B4513', '#CD853F', '#DEB887']

// 落ち葉エフェクト
export function FallingLeaves({ count = 40, active = true }: FallingLeavesProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([])

  useEffect(() => {
    if (!active) {
      setLeaves([])
      return
    }

    const createLeaves = () => {
      const newLeaves: Leaf[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        size: 15 + Math.random() * 20,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 8,
        rotation: Math.random() * 720,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      }))
      setLeaves(newLeaves)
    }

    createLeaves()

    const interval = setInterval(createLeaves, 18000)
    return () => clearInterval(interval)
  }, [active, count])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            initial={{
              x: `${leaf.x}vw`,
              y: '-5vh',
              rotate: 0,
              opacity: 0.9,
            }}
            animate={{
              y: '110vh',
              rotate: leaf.rotation,
              x: `${leaf.x + (Math.random() - 0.5) * 40}vw`,
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              ease: 'linear',
            }}
            className="absolute"
            style={{
              width: leaf.size,
              height: leaf.size * 0.8,
              backgroundColor: leaf.color,
              borderRadius: '0 50% 50% 50%',
              transform: 'rotate(45deg)',
              boxShadow: `0 2px 4px rgba(0, 0, 0, 0.2)`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
