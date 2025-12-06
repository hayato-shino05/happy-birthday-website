'use client'

import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Language } from '@/lib/i18n/translations'

const languages: { code: Language; label: string; shortLabel: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'ja', label: '日本語', shortLabel: 'JP' },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="lang-select"
        title="Select Language"
        style={{
          padding: '6px 12px',
          border: '2px solid var(--color-secondary, #D4B08C)',
          borderRadius: 0,
          background: 'var(--color-primary, #854D27)',
          color: 'var(--color-surface, #FFF9F3)',
          cursor: 'pointer',
          fontFamily: 'var(--font-accent)',
          fontSize: '0.8em',
          boxShadow: '2px 2px 0 var(--color-secondary, #D4B08C)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translate(-1px, -1px)'
          e.currentTarget.style.boxShadow = '3px 3px 0 var(--color-secondary, #D4B08C)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translate(0, 0)'
          e.currentTarget.style.boxShadow = '2px 2px 0 var(--color-secondary, #D4B08C)'
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}
