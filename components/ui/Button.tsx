'use client'

import { forwardRef, ButtonHTMLAttributes, useState } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gradient'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  rounded?: 'default' | 'full' | 'none'
  ripple?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40',
  ghost: 'bg-transparent hover:bg-white/10 text-white',
  danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg shadow-red-500/25',
  success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25',
  gradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2',
  xl: 'px-8 py-4 text-xl gap-3',
}

const roundedClasses = {
  default: 'rounded-lg',
  full: 'rounded-full',
  none: 'rounded-none',
}

const iconSizeClasses: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = 'default',
      ripple = true,
      children,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !isLoading) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()

        setRipples((prev) => [...prev, { x, y, id }])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id))
        }, 600)
      }

      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={`
          relative inline-flex items-center justify-center font-medium
          transition-all duration-300 ease-out
          transform hover:scale-[1.02] active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
          overflow-hidden cursor-pointer
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${roundedClasses[rounded]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {/* リップルエフェクト */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}

        {/* ローディングスピナー */}
        {isLoading && (
          <svg
            className={`animate-spin ${iconSizeClasses[size]}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* 左側のアイコン */}
        {!isLoading && leftIcon && (
          <span className={iconSizeClasses[size]}>{leftIcon}</span>
        )}

        {/* ボタンテキスト */}
        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className={`animate-spin ${iconSizeClasses[size]}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* 右側のアイコン */}
        {!isLoading && rightIcon && (
          <span className={iconSizeClasses[size]}>{rightIcon}</span>
        )}

        {/* ホバー時の光沢エフェクト */}
        <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

// アイコンボタン用バリアント
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const iconButtonSizes: Record<ButtonSize, string> = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
    }

    return (
      <Button
        ref={ref}
        size={size}
        rounded="full"
        className={`${iconButtonSizes[size]} !p-0 ${className}`}
        {...props}
      >
        <span className={iconSizeClasses[size]}>{icon}</span>
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'
