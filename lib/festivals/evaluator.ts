import type { FestivalPack, GregorianYearlyRule } from './types'

export type FestivalEvaluationStatus = 'active' | 'inactive' | 'unsupported-calendar'

export interface FestivalEvaluation {
  pack: FestivalPack
  status: FestivalEvaluationStatus
}

function getCalendarDate(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now)

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type === 'year' || type === 'month' || type === 'day')
      .map(({ type, value }) => [type, Number(value)]),
  )

  return {
    month: values.month,
    day: values.day,
  }
}

function isActiveYearlyRule(rule: GregorianYearlyRule, now: Date): boolean {
  const { month, day } = getCalendarDate(now, rule.timeZone)
  return rule.ranges.some((range) =>
    range.month === month && day >= range.startDay && day <= range.endDay,
  )
}

function compareEvaluations(left: FestivalEvaluation, right: FestivalEvaluation): number {
  return right.pack.priority - left.pack.priority || left.pack.id.localeCompare(right.pack.id)
}

export function evaluateFestivalPacks(
  packs: readonly FestivalPack[],
  now: Date = new Date(),
): FestivalEvaluation[] {
  return packs
    .map((pack): FestivalEvaluation => {
      if (pack.status === 'unsupported-calendar' || pack.dateRule.recurrence !== 'yearly') {
        return { pack, status: 'unsupported-calendar' }
      }

      if (!pack.enabled || pack.status !== 'enabled') {
        return { pack, status: 'inactive' }
      }

      return {
        pack,
        status: isActiveYearlyRule(pack.dateRule, now) ? 'active' : 'inactive',
      }
    })
    .sort(compareEvaluations)
}
