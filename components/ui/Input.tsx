'use client'

import { forwardRef, InputHTMLAttributes, useState, useId } from 'react'
import { useOptionalLanguage } from '@/lib/i18n/LanguageContext'
import { DEFAULT_LOCALE, translate } from '@/lib/i18n/resolveLocale'

type InputSize = 'sm' | 'md' | 'lg'
type InputVariant = 'default' | 'filled' | 'flushed'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  size?: InputSize
  variant?: InputVariant
  isRequired?: boolean
  showCharCount?: boolean
  onClear?: () => void
  showClearButton?: boolean
}

const sizeClasses: Record<InputSize, { input: string; icon: string; label: string }> = {
  sm: { input: 'px-3 py-1.5 text-sm', icon: 'w-4 h-4', label: 'text-xs' },
  md: { input: 'px-4 py-2.5 text-base', icon: 'w-5 h-5', label: 'text-sm' },
  lg: { input: 'px-5 py-3 text-lg', icon: 'w-6 h-6', label: 'text-base' },
}

const variantClasses: Record<InputVariant, { base: string; focus: string }> = {
  default: {
    base: 'bg-white/5 border border-white/20 rounded-xl',
    focus: 'focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20',
  },
  filled: {
    base: 'bg-white/10 border-2 border-transparent rounded-xl',
    focus: 'focus:bg-white/5 focus:border-pink-500/50',
  },
  flushed: {
    base: 'bg-transparent border-b-2 border-white/20 rounded-none px-0',
    focus: 'focus:border-pink-500',
  },
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      size = 'md',
      variant = 'default',
      isRequired,
      showCharCount,
      maxLength,
      onClear,
      showClearButton,
      className = '',
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const language = useOptionalLanguage()
    const clearLabel = language?.t('clear') ?? translate(DEFAULT_LOCALE, 'clear', DEFAULT_LOCALE)
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(String(value || '').length)
    const inputId = useId()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const sizeStyle = sizeClasses[size]
    const variantStyle = variantClasses[variant]

    return (
      <div className="w-full">

        {label && (
          <label
            htmlFor={inputId}
            className={`block font-medium text-white/80 mb-2 ${sizeStyle.label} transition-colors ${
              isFocused ? 'text-pink-400' : ''
            }`}
          >
            {label}
            {isRequired && <span className="text-pink-500 ml-1">*</span>}
          </label>
        )}


        <div className="relative flex">

          {leftAddon && (
            <div className="flex items-center px-4 bg-white/10 border border-r-0 border-white/20 rounded-l-xl text-white/60">
              {leftAddon}
            </div>
          )}


          <div className="relative flex-1">

            {leftIcon && (
              <div
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors ${
                  isFocused ? 'text-pink-400' : ''
                } ${sizeStyle.icon}`}
              >
                {leftIcon}
              </div>
            )}


            <input
              ref={ref}
              id={inputId}
              value={value}
              onChange={handleChange}
              maxLength={maxLength}
              disabled={disabled}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`
                w-full text-white placeholder-white/40
                transition-all duration-200 outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variantStyle.base}
                ${variantStyle.focus}
                ${sizeStyle.input}
                ${leftIcon ? 'pl-10' : ''}
                ${rightIcon || showClearButton ? 'pr-10' : ''}
                ${leftAddon ? 'rounded-l-none' : ''}
                ${rightAddon ? 'rounded-r-none' : ''}
                ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
                ${className}
              `}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
              {...props}
            />


            {(rightIcon || (showClearButton && value)) && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {showClearButton && value && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    aria-label={clearLabel}
                  >
                    <svg className={sizeStyle.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {rightIcon && (
                  <span className={`text-white/40 ${sizeStyle.icon}`}>{rightIcon}</span>
                )}
              </div>
            )}


            <div
              className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200 ${
                isFocused && !error ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.1)',
              }}
            />
          </div>


          {rightAddon && (
            <div className="flex items-center px-4 bg-white/10 border border-l-0 border-white/20 rounded-r-xl text-white/60">
              {rightAddon}
            </div>
          )}
        </div>


        <div className="flex items-center justify-between mt-1.5 min-h-[20px]">
          <div className="flex-1">
            {error && (
              <p
                id={`${inputId}-error`}
                className="text-sm text-red-400 flex items-center gap-1 animate-in slide-in-from-top-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${inputId}-helper`} className="text-sm text-white/50">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <span
              className={`text-xs ${
                charCount >= maxLength ? 'text-red-400' : 'text-white/40'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value)
      }
      onKeyDown?.(e)
    }

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={
          <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-white/40 hover:text-white transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
