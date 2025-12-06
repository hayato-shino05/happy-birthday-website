'use client'

import { useThemeContext } from '@/lib/providers/ThemeProvider'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { getThemeDisplayName } from '@/lib/utils/theme'

export function ThemeIndicator() {
  const { currentTheme, isAutoDetect } = useThemeContext()
  const { language } = useLanguage()

  const displayName = getThemeDisplayName(currentTheme, language)

  return (
    <div
      className="theme-indicator"
      style={{
        background: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'var(--font-body)',
        marginTop: '10px',
      }}
    >
      <span style={{ opacity: 0.7 }}>Theme: </span>
      <span style={{ fontWeight: 500 }}>{displayName}</span>
    </div>
  )
}
