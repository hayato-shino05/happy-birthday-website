'use client'

import { forwardRef, TextareaHTMLAttributes, useId } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const autoId = useId()
    const textareaId = id || autoId

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-white/80 mb-1.5">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
            transition-colors resize-none
            ${error ? 'border-red-400' : 'border-white/20'}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-white/50">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
