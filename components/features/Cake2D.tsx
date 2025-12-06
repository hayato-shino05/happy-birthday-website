'use client'

import { motion } from 'framer-motion'
import { Candle } from './Candle'

interface Cake2DProps {
  candlesBlown: boolean[]
  onCandleBlown?: (index: number) => void
}

// 2Dケーキコンポーネント
export function Cake2D({ candlesBlown, onCandleBlown }: Cake2DProps) {
  const candleCount = 5

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* ケーキ本体 */}
      <div className="relative">
        {/* 第3層（一番上） */}
        <CakeTier
          width="w-40"
          height="h-16"
          gradient="from-yellow-400 via-yellow-500 to-yellow-600"
          delay={0.2}
        >
          {/* ろうそく配置 */}
          <div className="absolute -top-8 left-0 right-0 flex justify-around px-4">
            {Array.from({ length: candleCount }).map((_, index) => (
              <Candle
                key={index}
                isBlown={candlesBlown[index]}
                delay={0.6 + index * 0.1}
                onBlown={() => onCandleBlown?.(index)}
              />
            ))}
          </div>
        </CakeTier>

        {/* 第2層 */}
        <CakeTier
          width="w-56"
          height="h-20"
          gradient="from-blue-400 via-blue-500 to-blue-600"
          delay={0.4}
        />

        {/* 第1層（一番下） */}
        <CakeTier
          width="w-72"
          height="h-24"
          gradient="from-pink-400 via-pink-500 to-pink-600"
          delay={0.6}
        >
          {/* デコレーション */}
          <div className="absolute top-2 left-0 right-0 flex justify-around px-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                className="w-4 h-4 rounded-full bg-white shadow-lg"
                style={{
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                }}
              />
            ))}
          </div>
        </CakeTier>
      </div>

      {/* フロートアニメーション */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 pointer-events-none"
      />
    </motion.div>
  )
}

interface CakeTierProps {
  width: string
  height: string
  gradient: string
  delay: number
  children?: React.ReactNode
}

function CakeTier({ width, height, gradient, delay, children }: CakeTierProps) {
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`relative ${width} ${height} mx-auto rounded-2xl bg-gradient-to-r ${gradient} shadow-2xl mb-1`}
      style={{
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3), inset 0 -5px 10px rgba(0, 0, 0, 0.3), inset 0 5px 10px rgba(255, 255, 255, 0.5)',
      }}
    >
      {children}
    </motion.div>
  )
}
