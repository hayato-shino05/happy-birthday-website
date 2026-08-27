'use client'

import { forwardRef, HTMLAttributes, useState } from 'react'
import { Icon } from './Icon'

type CardVariant = 'default' | 'glass' | 'solid' | 'gradient' | 'outline'
type CardSize = 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  hover?: boolean
  glow?: boolean
  animated?: boolean
  as?: 'div' | 'article' | 'section'
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white/10 backdrop-blur-md border border-white/20',
  glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
  solid: 'bg-slate-800/90 border border-slate-700',
  gradient: 'bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-md border border-white/20',
  outline: 'bg-transparent border-2 border-white/20',
}

const sizeClasses: Record<CardSize, string> = {
  sm: 'p-4 rounded-xl',
  md: 'p-5 rounded-2xl',
  lg: 'p-6 rounded-3xl',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hover = false,
      glow = false,
      animated = false,
      as: Component = 'div',
      className = '',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!glow) return
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    return (
      <Component
        ref={ref}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative overflow-hidden
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''}
          ${animated ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : ''}
          ${className}
        `}
        {...props}
      >
        {/* グローエフェクト */}
        {glow && isHovered && (
          <div
            className="absolute pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(236, 72, 153, 0.15), transparent 40%)`,
              inset: 0,
            }}
          />
        )}

        {/* コンテンツ */}
        <div className="relative z-10">{children}</div>

        {/* ホバー時の光沢エフェクト */}
        {hover && (
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full transition-transform duration-700 ${
              isHovered ? 'translate-x-full' : ''
            }`}
          />
        )}
      </Component>
    )
  }
)

Card.displayName = 'Card'

export default Card

// カードヘッダー
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode
}

export function CardHeader({ children, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`} {...props}>
      <div className="flex-1">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// カードタイトル
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  icon?: React.ReactNode
}

export function CardTitle({ children, as: Component = 'h3', icon, className = '', ...props }: CardTitleProps) {
  return (
    <Component className={`text-lg font-bold text-white flex items-center gap-2 ${className}`} {...props}>
      {icon && <span className="w-6 h-6 text-pink-400">{icon}</span>}
      {children}
    </Component>
  )
}

// カードの説明文
export function CardDescription({ children, className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-white/60 mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
}

// カードコンテンツ
export function CardContent({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-white/80 ${className}`} {...props}>
      {children}
    </div>
  )
}

// カードフッター
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'center' | 'between'
}

export function CardFooter({ children, justify = 'end', className = '', ...props }: CardFooterProps) {
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
  }

  return (
    <div
      className={`flex items-center gap-3 mt-4 pt-4 border-t border-white/10 ${justifyClasses[justify]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

// カード画像
interface CardImageProps {
  src: string
  alt: string
  aspectRatio?: 'video' | 'square' | 'portrait'
  overlay?: boolean
}

export function CardImage({ src, alt, aspectRatio = 'video', overlay = false }: CardImageProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  }

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl`}>
      {/* src is caller-provided and may be private or signed; no remote allowlist is available. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {overlay && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />}
    </div>
  )
}

// 統計情報カード
interface StatsCardProps {
  title: string
  value: string | number
  change?: { value: number; label?: string }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-white/60',
  }

  return (
    <Card variant="glass" hover glow>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trendColors[trend || 'neutral']}`}>
              {trend === 'up' && (
                <Icon name="ArrowUp" size={16} className="text-emerald-300" aria-hidden="true" />
              )}
              {trend === 'down' && (
                <Icon name="ArrowDown" size={16} className="text-rose-300" aria-hidden="true" />
              )}
              {change.value > 0 ? '+' : ''}{change.value}%
              {change.label && <span className="text-white/40 ml-1">{change.label}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
