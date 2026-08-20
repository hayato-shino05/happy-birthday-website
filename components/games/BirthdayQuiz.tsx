'use client'

import { useQuiz } from '@/lib/hooks/useQuiz'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Icon } from '@/components/ui/Icon'
import { useBirthdays } from '@/lib/hooks/useBirthdays'

interface BirthdayQuizProps {
  onClose: () => void
}

export function BirthdayQuiz({ onClose }: BirthdayQuizProps) {
  const { language, t } = useLanguage()
  const {
    questions,
    currentQuestion,
    score,
    isComplete,
    isPlaying,
    selectedAnswer,
    answerQuestion,
    nextQuestion,
    startQuiz,
  } = useQuiz(language)
  const { data: birthdays = [] } = useBirthdays()

  const question = questions[currentQuestion]

  if (!isPlaying) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#854D27', marginBottom: '20px', fontSize: '1rem' }}>
          {t('quizInstructions')}
        </p>
        {birthdays.length < 4 ? (
          <p style={{ color: '#dc3545' }}>{t('quizMinimumPlayers')}</p>
        ) : (
          <button
            onClick={() => startQuiz(birthdays, language)}
            style={{
              padding: '12px 30px',
              background: '#854D27',
              color: '#FFF9F3',
              border: '2px solid #D4B08C',
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '4px 4px 0 #D4B08C',
            }}
          >
            {t('gameStart')}
          </button>
        )}
      </div>
    )
  }

  if (isComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h3 style={{ color: '#854D27', fontSize: '1.5rem', marginBottom: '10px' }}>
          <Icon name="Party" size={22} aria-hidden="true" /> {t('quizComplete')}
        </h3>
        <p style={{ color: '#854D27', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>
          {t('gameScore')}: {score}/100
        </p>
        <button
          onClick={() => startQuiz(birthdays, language)}
          style={{
            padding: '12px 30px',
            background: '#854D27',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '4px 4px 0 #D4B08C',
          }}
        >
          {t('gameRestart')}
        </button>
      </div>
    )
  }

  if (!question) return null

  return (
    <div>
      {/* 進捗 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#854D27', fontSize: '0.9rem' }}>
            {t('questionProgress', { current: currentQuestion + 1, total: questions.length })}
          </span>
          <span style={{ color: '#854D27', fontSize: '0.9rem' }}>
            {t('gameScore')}: {score}
          </span>
        </div>
        <div style={{ background: '#D4B08C', height: '8px', borderRadius: '4px' }}>
          <div
            style={{
              background: '#854D27',
              height: '100%',
              borderRadius: '4px',
              width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>
      </div>

      {/* 質問 */}
      <h3 style={{ color: '#854D27', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>
        {question.question}
      </h3>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index
          const isCorrect = index === question.correctAnswer
          const showResult = selectedAnswer !== null

          let bgColor = '#FFF9F3'
          if (showResult) {
            if (isCorrect) bgColor = 'rgba(76, 175, 80, 0.3)'
            else if (isSelected) bgColor = 'rgba(244, 67, 54, 0.3)'
          }

          return (
            <button
              key={index}
              onClick={() => answerQuestion(index)}
              disabled={selectedAnswer !== null}
              style={{
                padding: '15px 20px',
                background: bgColor,
                color: '#854D27',
                border: `2px solid ${showResult && isCorrect ? '#4CAF50' : '#D4B08C'}`,
                borderRadius: '8px',
                cursor: selectedAnswer !== null ? 'default' : 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                textAlign: 'left',
                transition: 'all 0.3s',
              }}
            >
              {option}
            </button>
          )
        })}
      </div>

      {/* 次へボタン */}
      {selectedAnswer !== null && (
        <button
          onClick={nextQuestion}
          style={{
            marginTop: '20px',
            padding: '12px 30px',
            background: '#854D27',
            color: '#FFF9F3',
            border: '2px solid #D4B08C',
            borderRadius: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '4px 4px 0 #D4B08C',
            width: '100%',
          }}
        >
          {currentQuestion < questions.length - 1 ? t('nextQuestion') : t('viewResult')}
        </button>
      )}
    </div>
  )
}
