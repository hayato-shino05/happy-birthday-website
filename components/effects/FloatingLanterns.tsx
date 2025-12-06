'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingLanternsProps {
  count?: number
  active?: boolean
}

interface Lantern {
  id: number
  x: number
  size: number
  delay: number
  duration: number
  color: string
}

const LANTERN_COLORS = ['#FF4500', '#FFD700', '#FF6347', '#FFA500', '#FF8C00']

// 提灯エフェクト
export function FloatingLanterns({ count = 15, active = true }: FloatingLanternsProps) {
  const [lanterns, setLanterns] = useState<Lantern[]>([])

  useEffect(() => {
    if (!active) {
      setLanterns([])
      return
    }

    const createLanterns = () => {
      const newLanterns: Lantern[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 90 + 5,
        size: 20 + Math.random() * 15,
        delay: Math.random() * 3,
        duration: 15 + Math.random() * 10,
        color: LANTERN_COLORS[Math.floor(Math.random() * LANTERN_COLORS.length)],
      }))
      setLanterns(newLanterns)
    }

    createLanterns()

    const interval = setInterval(createLanterns, 25000)
    return () => clearInterval(interval)
  }, [active, count])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {lanterns.map((lantern) => (
          <motion.div
            key={lantern.id}
            initial={{
              x: `${lantern.x}vw`,
              y: '110vh',
              opacity: 0.8,
            }}
            animate={{
              y: '-20vh',
              x: `${lantern.x + (Math.random() - 0.5) * 20}vw`,
            }}
            transition={{
              duration: lantern.duration,
              delay: lantern.delay,
              ease: 'easeOut',
            }}
            className="absolute"
          >
            {/* 提灯本体 */}
            <div
              className="rounded-lg relative"
              style={{
                width: lantern.size,
                height: lantern.size * 1.3,
                backgroundColor: lantern.color,
                boxShadow: `0 0 20px ${lantern.color}80, 0 0 40px ${lantern.color}40`,
              }}
            >
              {/* 光のエフェクト */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-2 rounded bg-yellow-200/50"
              />
            </div>
            {/* 紐 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-600"
              style={{ top: lantern.size * 1.3 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
