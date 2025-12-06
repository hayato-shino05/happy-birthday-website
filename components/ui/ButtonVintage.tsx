'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonVintageProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'feature' | 'game'
  size?: 'sm' | 'md' | 'lg'
}

export function ButtonVintage({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonVintageProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    border: '2px solid var(--color-secondary, #D4B08C)',
    borderRadius: 0,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontWeight: 600,
    transition: 'transform 0.3s, box-shadow 0.3s',
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--color-primary, #854D27)',
      color: 'var(--color-surface, #FFF9F3)',
      boxShadow: '4px 4px 0 var(--color-secondary, #D4B08C)',
    },
    secondary: {
      background: 'var(--color-surface, #FFF9F3)',
      color: 'var(--color-primary, #854D27)',
      boxShadow: '4px 4px 0 var(--color-secondary, #D4B08C)',
    },
    feature: {
      background: 'var(--color-primary, #854D27)',
      color: 'var(--color-surface, #FFF9F3)',
      boxShadow: '4px 4px 0 var(--color-secondary, #D4B08C)',
    },
    game: {
      background: 'var(--color-primary, #854D27)',
      color: 'var(--color-surface, #FFF9F3)',
      boxShadow: '4px 4px 0 var(--color-secondary, #D4B08C)',
    },
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 12px', fontSize: '0.85em' },
    md: { padding: '12px 25px', fontSize: '1em' },
    lg: { padding: '15px 30px', fontSize: '1.1em' },
  }

  const combinedStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(-2px, -2px)'
    e.currentTarget.style.boxShadow = '6px 6px 0 var(--color-secondary, #D4B08C)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)'
    e.currentTarget.style.boxShadow = '4px 4px 0 var(--color-secondary, #D4B08C)'
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translate(0, 0)'
    e.currentTarget.style.boxShadow = '2px 2px 0 var(--color-secondary, #D4B08C)'
  }

  return (
    <button
      style={combinedStyles}
      className={`btn-vintage ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </button>
  )
}
