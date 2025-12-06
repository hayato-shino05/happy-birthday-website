'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FallingSnowProps {
  count?: number
  active?: boolean
}

interface Snowflake {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  opacity: number
}

// 雪のエフェクト
export function FallingSnow({ count = 50, active = true }: FallingSnowProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    if (!active) {
      setSnowflakes([])
      return
    }

    const createSnowflakes = () => {
      const newSnowflakes: Snowflake[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 5,
        duration: 8 + Math.random() * 10,
        opacity: 0.4 + Math.random() * 0.4,
      }))
      setSnowflakes(newSnowflakes)
    }

    createSnowflakes()

    const interval = setInterval(createSnowflakes, 18000)
    return () => clearInterval(interval)
  }, [active, count])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {snowflakes.map((flake) => (
          <motion.div
            key={flake.id}
            initial={{
              x: `${flake.x}vw`,
              y: '-5vh',
              opacity: flake.opacity,
            }}
            animate={{
              y: '110vh',
              x: `${flake.x + (Math.random() - 0.5) * 20}vw`,
            }}
            transition={{
              duration: flake.duration,
              delay: flake.delay,
              ease: 'linear',
            }}
            className="absolute rounded-full bg-white"
            style={{
              width: flake.size,
              height: flake.size,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
