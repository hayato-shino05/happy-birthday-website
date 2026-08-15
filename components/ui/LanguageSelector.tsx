'use client'

import { locales } from '@/data/generated/locales'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import type { Locale } from '@/lib/i18n/types'

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function LanguageSelector() {
  const { locale, setLanguage, t } = useLanguage()

  return (
    <div className="language-selector">
      <select
        value={locale}
        onChange={(event) => {
          const nextLocale = event.target.value
          if (isLocale(nextLocale)) setLanguage(nextLocale)
        }}
        className="lang-select"
        title={t('language')}
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
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = 'translate(-1px, -1px)'
          event.currentTarget.style.boxShadow = '3px 3px 0 var(--color-secondary, #D4B08C)'
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = 'translate(0, 0)'
          event.currentTarget.style.boxShadow = '2px 2px 0 var(--color-secondary, #D4B08C)'
        }}
      >
        {locales.map((availableLocale) => {
          const languageCode = availableLocale.split('-')[0]
          const label = new Intl.DisplayNames([availableLocale], { type: 'language' }).of(languageCode) ?? availableLocale
          return (
            <option key={availableLocale} value={availableLocale}>
              {label}
            </option>
          )
        })}
      </select>
    </div>
  )
}
