'use client'

import { forwardRef, InputHTMLAttributes, useState, useId } from 'react'
import { Icon } from './Icon'
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
                    <span aria-hidden="true"><Icon name="Close" size={16} className="text-rose-300" /></span>
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
                <span aria-hidden="true"><Icon name="CircleAlert" size={16} className="text-rose-300" /></span>
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
        leftIcon={<Icon name="Search" size={20} className="text-sky-300" />}
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
              <Icon name="EyeOff" size={20} className="text-amber-300" />
            ) : (
              <Icon name="Eye" size={20} className="text-sky-300" />
            )}
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
