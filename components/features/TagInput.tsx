'use client'

import { useState, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder }: TagInputProps) {
  const { t } = useLanguage()
  const effectivePlaceholder = placeholder ?? t('addTag')
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault()
        const newTag = inputValue.trim().toLowerCase()
        if (!tags.includes(newTag)) {
          onChange([...tags, newTag])
        }
        setInputValue('')
      } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        onChange(tags.slice(0, -1))
      }
    },
    [inputValue, tags, onChange]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(tags.filter((tag) => tag !== tagToRemove))
    },
    [tags, onChange]
  )

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px',
        border: '2px solid #D4B08C',
        borderRadius: 0,
        background: '#FFF9F3',
        minHeight: '50px',
        alignItems: 'center',
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: '#854D27',
            color: '#FFF9F3',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFF9F3',
              cursor: 'pointer',
              padding: 0,
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? effectivePlaceholder : ''}
        style={{
          flex: 1,
          minWidth: '100px',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#2C1810',
        }}
      />
    </div>
  )
}
