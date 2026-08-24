import { useLanguage } from '@/lib/i18n/LanguageContext'

const promptKeys = [
  'contributorPromptBirthday',
  'contributorPromptMemory',
  'contributorPromptGratitude',
] as const

interface ContributorPromptButtonsProps {
  hasContent: boolean
  onSelect: (prompt: string) => void
}

export function ContributorPromptButtons({ hasContent, onSelect }: ContributorPromptButtonsProps) {
  const { t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('contributorPrompts')}
      style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}
    >
      {promptKeys.map((promptKey) => (
        <button
          key={promptKey}
          type="button"
          disabled={hasContent}
          onClick={() => onSelect(t(promptKey))}
          style={{
            minHeight: '44px',
            padding: '8px 12px',
            border: '1px solid #D4B08C',
            borderRadius: 0,
            background: '#FFF9F3',
            color: '#854D27',
            cursor: hasContent ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            opacity: hasContent ? 0.5 : 1,
          }}
        >
          {t(promptKey)}
        </button>
      ))}
    </div>
  )
}
