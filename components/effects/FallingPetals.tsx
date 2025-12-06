'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FallingPetalsProps {
  count?: number
  active?: boolean
}

interface Petal {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  rotation: number
}

// 桜の花びらエフェクト
export function FallingPetals({ count = 30, active = true }: FallingPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    if (!active) {
      setPetals([])
      return
    }

    const createPetals = () => {
      const newPetals: Petal[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        size: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 7,
        rotation: Math.random() * 360,
      }))
      setPetals(newPetals)
    }

    createPetals()

    // 継続的に花びらを生成
    const interval = setInterval(createPetals, 15000)
    return () => clearInterval(interval)
  }, [active, count])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{
              x: `${petal.x}vw`,
              y: '-5vh',
              rotate: 0,
              opacity: 0.8,
            }}
            animate={{
              y: '110vh',
              rotate: petal.rotation,
              x: `${petal.x + (Math.random() - 0.5) * 30}vw`,
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              ease: 'linear',
            }}
            className="absolute rounded-full"
            style={{
              width: petal.size,
              height: petal.size,
              background: 'linear-gradient(135deg, #FFB7C5 0%, #FF9EB5 50%, #FFC0CB 100%)',
              boxShadow: '0 2px 4px rgba(255, 182, 193, 0.3)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
