'use client'

import { forwardRef, SelectHTMLAttributes, useId } from 'react'
import { Icon } from '@/components/ui/Icon'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const autoId = useId()
    const selectId = id || autoId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-2 bg-white/10 border rounded-lg text-white
              focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
              transition-colors appearance-none cursor-pointer
              ${error ? 'border-red-400' : 'border-white/20'}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-slate-800">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-800">
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
            <Icon name="ChevronDown" size={16} />
          </div>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
