'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePrefersReducedMotion } from '@/lib/hooks/useMediaQuery'

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
  rotateX: number
  rotateY: number
  rotateZ: number
  swayAmount: number
  colorScheme: LeafColor
  leafType: 'maple' | 'oak' | 'ginkgo' | 'simple'
  flipSpeed: number
}

interface LeafColor {
  main: string
  secondary: string
  vein: string
  shadow: string
}

// Màu lá mùa thu thực tế
const LEAF_COLORS: LeafColor[] = [
  // Đỏ cam rực (Momiji - lá phong đỏ)
  { main: '#DC2626', secondary: '#EA580C', vein: '#991B1B', shadow: '#7F1D1D' },
  // Cam vàng (lá phong cam)
  { main: '#EA580C', secondary: '#F59E0B', vein: '#C2410C', shadow: '#9A3412' },
  // Vàng rực (Ichou - lá bạch quả)
  { main: '#EAB308', secondary: '#FACC15', vein: '#A16207', shadow: '#854D0E' },
  // Nâu đỏ (lá sồi)
  { main: '#92400E', secondary: '#B45309', vein: '#78350F', shadow: '#451A03' },
  // Đỏ tía
  { main: '#BE123C', secondary: '#E11D48', vein: '#9F1239', shadow: '#881337' },
  // Cam đất
  { main: '#C2410C', secondary: '#EA580C', vein: '#9A3412', shadow: '#7C2D12' },
  // Vàng nâu
  { main: '#CA8A04', secondary: '#EAB308', vein: '#A16207', shadow: '#713F12' },
]

export function FallingLeaves({ count = 40, active = true }: FallingLeavesProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!active || prefersReducedMotion) return

    const leafTypes: Leaf['leafType'][] = ['maple', 'oak', 'ginkgo', 'simple']

    const createSingleLeaf = (): Leaf => ({
      id: Date.now() + Math.random() * 10000,
      x: Math.random() * 100,
      size: 25 + Math.random() * 20,
      delay: 0,
      duration: 14 + Math.random() * 10, // Rơi chậm hơn
      rotateX: Math.random() * 360,
      rotateY: Math.random() * 360,
      rotateZ: Math.random() * 360,
      swayAmount: 25 + Math.random() * 35, // Lắc lư nhiều hơn
      colorScheme: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      leafType: leafTypes[Math.floor(Math.random() * leafTypes.length)],
      flipSpeed: 3 + Math.random() * 2.5,
    })

    // Bắt đầu với ít lá hơn
    const initialLeaves: Leaf[] = Array.from({ length: Math.floor(count * 0.2) }, () => ({
      ...createSingleLeaf(),
      delay: Math.random() * 5,
    }))
    const initialTimeout = setTimeout(() => setLeaves(initialLeaves), 0)

    // Biến để theo dõi "đợt gió"
    let isWindGust = false
    let windGustTimeout: NodeJS.Timeout | null = null

    // Spawn lá theo kiểu tự nhiên - có đợt gió
    const spawnLeaf = () => {
      setLeaves(prev => {
        // Giới hạn số lượng tối đa dựa trên count
        const maxLeaves = Math.floor(count * 0.8)
        if (prev.length >= maxLeaves) return prev

        // Trong đợt gió, spawn nhiều hơn
        if (isWindGust) {
          const gustCount = 1 + Math.floor(Math.random() * 2) // 1-2 lá
          const newLeaves = Array.from({ length: gustCount }, () => createSingleLeaf())
          return [...prev, ...newLeaves]
        }

        // Bình thường chỉ spawn 1 lá, và có 40% chance không spawn gì
        if (Math.random() < 0.4) return prev
        return [...prev, createSingleLeaf()]
      })

      // Lên lịch spawn tiếp theo
      // Khoảng cách spawn ngẫu nhiên: 1.5-4 giây bình thường, 0.5-1.5 giây khi có gió
      const nextSpawnTime = isWindGust
        ? 500 + Math.random() * 1000
        : 1500 + Math.random() * 2500

      spawnTimeout = setTimeout(spawnLeaf, nextSpawnTime)
    }

    let spawnTimeout = setTimeout(spawnLeaf, 1000)

    // Tạo "đợt gió" ngẫu nhiên
    const triggerWindGust = () => {
      // 30% chance có đợt gió
      if (Math.random() < 0.3) {
        isWindGust = true
        // Đợt gió kéo dài 2-4 giây
        windGustTimeout = setTimeout(() => {
          isWindGust = false
        }, 2000 + Math.random() * 2000)
      }

      // Lên lịch check đợt gió tiếp theo sau 5-12 giây
      gustCheckTimeout = setTimeout(triggerWindGust, 5000 + Math.random() * 7000)
    }

    let gustCheckTimeout = setTimeout(triggerWindGust, 3000)

    // Cleanup lá đã rơi xong
    const cleanupInterval = setInterval(() => {
      setLeaves(prev => {
        const now = Date.now()
        return prev.filter(l => now - l.id < (l.duration + l.delay) * 1000 + 2000)
      })
    }, 4000)

    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(spawnTimeout)
      clearTimeout(gustCheckTimeout)
      if (windGustTimeout) clearTimeout(windGustTimeout)
      clearInterval(cleanupInterval)
    }
  }, [active, count, prefersReducedMotion])

  if (!active || prefersReducedMotion) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {leaves.map((leaf) => (
          <LeafElement key={leaf.id} leaf={leaf} />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface LeafElementProps {
  leaf: Leaf
}

function LeafElement({ leaf }: LeafElementProps) {
  const id = useId().replaceAll(':', '')

  const swayKeyframes = useMemo(() => {
    const baseX = leaf.x
    return [
      `${baseX}vw`,
      `${baseX + leaf.swayAmount * 0.5}vw`,
      `${baseX - leaf.swayAmount * 0.3}vw`,
      `${baseX + leaf.swayAmount * 0.6}vw`,
      `${baseX - leaf.swayAmount * 0.4}vw`,
      `${baseX + leaf.swayAmount * 0.3}vw`,
      `${baseX - leaf.swayAmount * 0.5}vw`,
      `${baseX + leaf.swayAmount * 0.2}vw`,
    ]
  }, [leaf.x, leaf.swayAmount])

  return (
    <motion.div
      initial={{
        x: `${leaf.x}vw`,
        y: '-5vh',
        opacity: 0,
        rotateX: leaf.rotateX,
        rotateY: leaf.rotateY,
        rotateZ: leaf.rotateZ,
      }}
      animate={{
        y: '110vh',
        opacity: [0, 0.95, 0.95, 0.9, 0.85, 0],
        x: swayKeyframes,
        rotateX: [leaf.rotateX, leaf.rotateX + 540],
        rotateY: [leaf.rotateY, leaf.rotateY + 720],
        rotateZ: [leaf.rotateZ, leaf.rotateZ + 480],
      }}
      transition={{
        duration: leaf.duration,
        delay: leaf.delay,
        ease: 'linear',
        x: {
          duration: leaf.duration,
          ease: 'easeInOut',
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
        },
        rotateX: {
          duration: leaf.flipSpeed,
          repeat: Math.floor(leaf.duration / leaf.flipSpeed),
          ease: 'linear',
        },
        rotateY: {
          duration: leaf.flipSpeed * 1.2,
          repeat: Math.floor(leaf.duration / (leaf.flipSpeed * 1.2)),
          ease: 'linear',
        },
        rotateZ: {
          duration: leaf.flipSpeed * 0.9,
          repeat: Math.floor(leaf.duration / (leaf.flipSpeed * 0.9)),
          ease: 'linear',
        },
      }}
      className="absolute"
      style={{
        width: leaf.size,
        height: leaf.size,
        transformStyle: 'preserve-3d',
        filter: `drop-shadow(2px 3px 3px rgba(0, 0, 0, 0.25))`,
      }}
    >
      {leaf.leafType === 'maple' && (
        <MapleLeaf size={leaf.size} colors={leaf.colorScheme} id={id} />
      )}
      {leaf.leafType === 'oak' && (
        <OakLeaf size={leaf.size} colors={leaf.colorScheme} id={id} />
      )}
      {leaf.leafType === 'ginkgo' && (
        <GinkgoLeaf size={leaf.size} colors={leaf.colorScheme} id={id} />
      )}
      {leaf.leafType === 'simple' && (
        <SimpleLeaf size={leaf.size} colors={leaf.colorScheme} id={id} />
      )}
    </motion.div>
  )
}

interface LeafSVGProps {
  size: number
  colors: LeafColor
  id: string
}

// 紅葉 (Momiji) - Lá phong Nhật Bản
function MapleLeaf({ size, colors, id }: LeafSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`maple-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.main} />
          <stop offset="50%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.main} />
        </linearGradient>
      </defs>

      {/* Lá phong 5 thùy */}
      <path
        d="M30 5
           L33 12 L40 8 L38 16 L48 14 L42 22 L52 25 L42 28
           L48 36 L38 34 L40 42 L33 38 L30 48
           L27 38 L20 42 L22 34 L12 36 L18 28
           L8 25 L18 22 L12 14 L22 16 L20 8 L27 12 Z"
        fill={`url(#maple-grad-${id})`}
      />

      {/* Gân lá chính */}
      <path
        d="M30 48 L30 25"
        stroke={colors.vein}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Gân phụ */}
      <path d="M30 25 L20 12" stroke={colors.vein} strokeWidth="1" opacity="0.5" />
      <path d="M30 25 L40 12" stroke={colors.vein} strokeWidth="1" opacity="0.5" />
      <path d="M30 25 L12 25" stroke={colors.vein} strokeWidth="1" opacity="0.5" />
      <path d="M30 25 L48 25" stroke={colors.vein} strokeWidth="1" opacity="0.5" />
      <path d="M30 25 L18 38" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M30 25 L42 38" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />

      {/* Cuống lá */}
      <path
        d="M30 48 L30 58"
        stroke={colors.shadow}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Highlight */}
      <ellipse cx="25" cy="20" rx="5" ry="8" fill="white" opacity="0.12" />
    </svg>
  )
}

// Lá sồi
function OakLeaf({ size, colors, id }: LeafSVGProps) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 50 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`oak-grad-${id}`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.shadow} />
        </linearGradient>
      </defs>

      {/* Lá sồi với các thùy tròn */}
      <path
        d="M25 5
           Q30 5 32 10 Q38 8 38 14 Q44 14 42 20
           Q48 22 45 28 Q50 32 45 36
           Q48 42 42 44 Q44 50 38 50
           Q38 55 32 54 Q30 58 25 55
           Q20 58 18 54 Q12 55 12 50
           Q6 50 8 44 Q2 42 5 36
           Q0 32 5 28 Q2 22 8 20
           Q6 14 12 14 Q12 8 18 10 Q20 5 25 5 Z"
        fill={`url(#oak-grad-${id})`}
      />

      {/* Gân lá chính */}
      <path
        d="M25 55 L25 15"
        stroke={colors.vein}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Gân phụ */}
      <path d="M25 20 L12 18" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M25 20 L38 18" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M25 30 L8 28" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M25 30 L42 28" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M25 40 L10 42" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />
      <path d="M25 40 L40 42" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" />

      {/* Cuống lá */}
      <path
        d="M25 55 L25 63"
        stroke={colors.shadow}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Highlight */}
      <ellipse cx="20" cy="25" rx="6" ry="10" fill="white" opacity="0.1" />
    </svg>
  )
}

// 銀杏 (Ichou) - Lá bạch quả
function GinkgoLeaf({ size, colors, id }: LeafSVGProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 55 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`ginkgo-grad-${id}`} cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="60%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.shadow} />
        </radialGradient>
      </defs>

      {/* Lá bạch quả hình quạt */}
      <path
        d="M27.5 50
           Q27.5 35 15 25
           Q5 18 5 10
           Q5 5 15 5
           Q22 5 27.5 12
           Q33 5 40 5
           Q50 5 50 10
           Q50 18 40 25
           Q27.5 35 27.5 50 Z"
        fill={`url(#ginkgo-grad-${id})`}
      />

      {/* Khuyết giữa lá */}
      <path
        d="M27.5 50 Q27.5 30 27.5 18"
        stroke={colors.vein}
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />

      {/* Gân lá tỏa ra hình quạt */}
      <path d="M27.5 50 Q20 35 10 15" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" fill="none" />
      <path d="M27.5 50 Q35 35 45 15" stroke={colors.vein} strokeWidth="0.8" opacity="0.4" fill="none" />
      <path d="M27.5 50 Q15 38 8 20" stroke={colors.vein} strokeWidth="0.6" opacity="0.3" fill="none" />
      <path d="M27.5 50 Q40 38 47 20" stroke={colors.vein} strokeWidth="0.6" opacity="0.3" fill="none" />
      <path d="M27.5 50 Q23 40 18 25" stroke={colors.vein} strokeWidth="0.5" opacity="0.25" fill="none" />
      <path d="M27.5 50 Q32 40 37 25" stroke={colors.vein} strokeWidth="0.5" opacity="0.25" fill="none" />

      {/* Cuống lá */}
      <path
        d="M27.5 50 L27.5 54"
        stroke={colors.shadow}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Highlight */}
      <ellipse cx="20" cy="18" rx="8" ry="6" fill="white" opacity="0.15" />
    </svg>
  )
}

// Lá đơn giản (lá oval)
function SimpleLeaf({ size, colors, id }: LeafSVGProps) {
  return (
    <svg
      width={size * 0.7}
      height={size}
      viewBox="0 0 35 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`simple-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="40%" stopColor={colors.main} />
          <stop offset="100%" stopColor={colors.shadow} />
        </linearGradient>
      </defs>

      {/* Lá oval với đầu nhọn */}
      <path
        d="M17.5 5
           Q30 10 32 25
           Q32 40 17.5 50
           Q3 40 3 25
           Q5 10 17.5 5 Z"
        fill={`url(#simple-grad-${id})`}
      />

      {/* Gân lá chính */}
      <path
        d="M17.5 8 L17.5 48"
        stroke={colors.vein}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Gân phụ */}
      <path d="M17.5 15 L8 20" stroke={colors.vein} strokeWidth="0.7" opacity="0.4" />
      <path d="M17.5 15 L27 20" stroke={colors.vein} strokeWidth="0.7" opacity="0.4" />
      <path d="M17.5 25 L6 28" stroke={colors.vein} strokeWidth="0.7" opacity="0.4" />
      <path d="M17.5 25 L29 28" stroke={colors.vein} strokeWidth="0.7" opacity="0.4" />
      <path d="M17.5 35 L8 36" stroke={colors.vein} strokeWidth="0.6" opacity="0.35" />
      <path d="M17.5 35 L27 36" stroke={colors.vein} strokeWidth="0.6" opacity="0.35" />

      {/* Cuống lá */}
      <path
        d="M17.5 48 L17.5 54"
        stroke={colors.shadow}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Highlight */}
      <ellipse cx="12" cy="22" rx="5" ry="10" fill="white" opacity="0.12" />

      {/* Mép lá hơi cong */}
      <path
        d="M17.5 5 Q30 10 32 25"
        stroke={colors.shadow}
        strokeWidth="0.5"
        opacity="0.3"
        fill="none"
      />
    </svg>
  )
}
