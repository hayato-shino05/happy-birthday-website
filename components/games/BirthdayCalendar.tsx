'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useBirthdays } from '@/lib/hooks/useBirthdays'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface BirthdayCalendarProps {
  onClose: () => void
}

const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
]

export function BirthdayCalendar({ onClose }: BirthdayCalendarProps) {
  const { data: birthdays = [] } = useBirthdays()
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const birthdaysInMonth = birthdays.filter((b) => b.month === selectedMonth + 1)
    .sort((a, b) => a.day - b.day)

  const prevMonth = () => setSelectedMonth((prev) => (prev - 1 + 12) % 12)
  const nextMonth = () => setSelectedMonth((prev) => (prev + 1) % 12)

  return (
    <div>
      {/* 月の切り替えナビゲーション */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px',
          background: 'rgba(212, 176, 140, 0.2)',
          borderRadius: '8px',
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: '#854D27',
            color: '#FFF9F3',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ‹
        </button>
        <h3 style={{ color: '#854D27', margin: 0, fontSize: '1.3rem' }}>
          {MONTHS[selectedMonth]}
        </h3>
        <button
          onClick={nextMonth}
          style={{
            background: '#854D27',
            color: '#FFF9F3',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ›
        </button>
      </div>

      {/* 選択中の月の誕生日リスト */}
      {birthdaysInMonth.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#854D27' }}>
          <p>今月は誕生日が登録されていません</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {birthdaysInMonth.map((birthday) => (
            <motion.div
              key={birthday.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                background: '#FFF9F3',
                border: '2px solid #D4B08C',
                borderRadius: '8px',
                boxShadow: '2px 2px 0 #D4B08C',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: '#854D27',
                  color: '#FFF9F3',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{birthday.day}</span>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ color: '#854D27', margin: 0, fontSize: '1.1rem' }}>
                  🎂 {birthday.name}
                </h4>
                {birthday.message && (
                  <p style={{ color: '#854D27', opacity: 0.7, margin: '4px 0 0', fontSize: '0.85rem' }}>
                    {birthday.message}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 全ての月の概要 */}
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ color: '#854D27', marginBottom: '15px' }}>1年の誕生日一覧</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {MONTHS.map((month, index) => {
            const count = birthdays.filter((b) => b.month === index + 1).length
            const isCurrentMonth = index === selectedMonth
            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(index)}
                style={{
                  padding: '10px 5px',
                  background: isCurrentMonth ? '#854D27' : count > 0 ? 'rgba(212, 176, 140, 0.3)' : '#FFF9F3',
                  color: isCurrentMonth ? '#FFF9F3' : '#854D27',
                  border: '1px solid #D4B08C',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div>{month}</div>
                {count > 0 && <div style={{ fontWeight: 'bold' }}>({count})</div>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
