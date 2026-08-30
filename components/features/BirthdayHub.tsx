'use client'

import { useMemo, useState } from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
import { useBirthdays } from '@/lib/hooks/useBirthdays'
import { CountdownDisplay } from './CountdownDisplay'
import type { Birthday } from '@/types'
import { useLanguage } from '@/lib/i18n/LanguageContext'

function calendarDate(birthday: Birthday, year: number) {
  return new Date(year, birthday.month - 1, birthday.day)
}

export function BirthdayHub() {
  const { data: birthdays, isLoading, isError, refetch } = useBirthdays()
  const { language, t } = useLanguage()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const events = useMemo(() => {
    if (!birthdays) return []
    // now は useMemo 内でのみ生成するため、毎レンダでの参照変化を避けつつ
    // birthdays の更新時のみ現在時刻で再計算する
    const now = new Date()
    return birthdays
      .map((person) => {
        const thisYear = calendarDate(person, now.getFullYear())
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const dayDiff = Math.round((thisYear.getTime() - today.getTime()) / 86400000)
        const status = dayDiff === 0 ? 'today' : dayDiff > 0 ? 'upcoming' : 'past'
        const sortDate = dayDiff < 0 ? calendarDate(person, now.getFullYear() + 1) : thisYear
        return { person, status, sortDate }
      })
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
  }, [birthdays])

  const selected = events.find(({ person }) => person.id === selectedId)?.person ?? events[0]?.person

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm" role="status">{t('loading')}</div>
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
        <p className="font-semibold">{t('error')}</p>
        <button type="button" onClick={() => refetch()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--theme-primary)] px-4 py-2 font-semibold">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t('retry')}
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return <div className="flex min-h-[40vh] items-center justify-center px-4 text-center" role="status">{t('noBirthdayData')}</div>
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]" aria-labelledby="birthday-hub-title">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" aria-hidden="true" />
          <h1 id="birthday-hub-title" className="text-xl font-black sm:text-2xl">{t('birthdayCalendar')}</h1>
        </div>
        <ul className="grid gap-2" aria-label={t('birthdayCalendar')}>
          {events.map(({ person, status }) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => setSelectedId(person.id)}
                aria-pressed={selected?.id === person.id}
                className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-left shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span className="min-w-0 truncate font-semibold">{person.name}</span>
                <span className="shrink-0 text-xs font-bold uppercase opacity-75">
                  {status === 'today' ? (language === 'ja' ? '今日' : 'Today') : status === 'upcoming' ? (language === 'ja' ? 'これから' : 'Upcoming') : (language === 'ja' ? '過ぎた' : 'Past')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0">
        <CountdownDisplay selectedBirthday={selected} />
      </div>
    </section>
  )
}
