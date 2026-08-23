'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface GiftAnimationProps {
  emoji: string
  giftName: string
  sender: string
  onComplete?: () => void
}

// きらめきの表示位置（決定論的：レンダー毎の乱数呼び出しを避けるため固定値）
const SPARKLE_POSITIONS = [
  { top: '24%', left: '30%' },
  { top: '30%', left: '72%' },
  { top: '38%', left: '22%' },
  { top: '45%', left: '55%' },
  { top: '52%', left: '35%' },
  { top: '60%', left: '76%' },
  { top: '66%', left: '25%' },
  { top: '74%', left: '64%' },
]

// 浮遊パーティクル（決定論的配置：x は均等分散、delay は 0〜0.45 秒）
const GIFT_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 37) % 100,
  delay: ((i * 7) % 10) * 0.05,
}))

export default function GiftAnimation({ emoji, giftName, sender, onComplete }: GiftAnimationProps) {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // アニメーション終了後に自動で非表示にする
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" />

      {/* パーティクル */}
      {GIFT_PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-float-up"
          style={{
            left: `${particle.x}%`,
            bottom: '20%',
            animationDelay: `${particle.delay}s`,
          }}
        >
          {emoji}
        </div>
      ))}

      {/* メインのギフト表示 */}
      <div className="relative z-10 flex flex-col items-center animate-bounce-in">
        <div className="text-8xl mb-4 animate-pulse-scale">
          {emoji}
        </div>

        {/* ギフト情報 */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 text-center">
          <p className="text-2xl font-bold text-white mb-1">{giftName}</p>
          <p className="text-white/80">
            <span className="font-semibold">{sender}</span> {t('giftFrom')}
          </p>
        </div>

        {/* きらめきエフェクト */}
        <div className="absolute -inset-8">
          {SPARKLE_POSITIONS.map((sparkle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-sparkle"
              style={{
                top: sparkle.top,
                left: sparkle.left,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-300px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
        
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
        
        .animate-sparkle {
          animation: sparkle 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
