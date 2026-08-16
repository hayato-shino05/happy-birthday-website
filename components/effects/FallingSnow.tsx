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
  drift: number
  size: number
  delay: number
  duration: number
  opacity: number
}

export function FallingSnow({ count = 50, active = true }: FallingSnowProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    if (!active) return

    const createSingleSnowflake = (): Snowflake => ({
      id: Date.now() + Math.random() * 10000,
      x: Math.random() * 100,
      drift: (Math.random() - 0.5) * 20,
      size: 3 + Math.random() * 6,
      delay: 0,
      duration: 8 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.4,
    })

    const initialSnow: Snowflake[] = Array.from({ length: Math.floor(count * 0.7) }, () => ({
      ...createSingleSnowflake(),
      delay: Math.random() * 3,
    }))
    const initializationTimeout = setTimeout(() => setSnowflakes(initialSnow), 0)

    const spawnInterval = setInterval(() => {
      setSnowflakes((previous) => {
        if (previous.length >= count * 1.8) return previous
        const newCount = 2 + Math.floor(Math.random() * 3)
        return [...previous, ...Array.from({ length: newCount }, createSingleSnowflake)]
      })
    }, 500)

    const cleanupInterval = setInterval(() => {
      setSnowflakes((previous) => {
        const now = Date.now()
        return previous.filter((snowflake) => (
          now - snowflake.id < (snowflake.duration + snowflake.delay) * 1000 + 2000
        ))
      })
    }, 3000)

    return () => {
      clearTimeout(initializationTimeout)
      clearInterval(spawnInterval)
      clearInterval(cleanupInterval)
    }
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
              x: `${flake.x + flake.drift}vw`,
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
