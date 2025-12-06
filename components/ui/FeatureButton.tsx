'use client'

interface FeatureButtonProps {
  icon: React.ReactNode
  label: string
  description?: string
  onClick?: () => void
  variant?: 'default' | 'gradient' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const variantClasses = {
  default: 'bg-white/10 hover:bg-white/20 border-white/20',
  gradient: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border-white/20',
  outline: 'bg-transparent hover:bg-white/10 border-white/30',
}

const sizeClasses = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const iconSizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
}

export default function FeatureButton({
  icon,
  label,
  description,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
}: FeatureButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full rounded-2xl border backdrop-blur-sm
        transition-all duration-200 text-left
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02] hover:shadow-lg
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`${iconSizeClasses[size]} rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{label}</p>
          {description && (
            <p className="text-sm text-white/60 truncate">{description}</p>
          )}
        </div>
        <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}
