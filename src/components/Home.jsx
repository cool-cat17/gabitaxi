import { useMemo } from 'react'
import { Card, EmptyState, IconChevron, IconFuel, Money, PeriodToggle } from './ui.jsx'
import { currentMonthKey, currentWeekKey, monthLabel, shortDate, todayKey, weekRangeLabel, weekdayLabel } from '../lib/dates.js'
import { dayEarnings, dayFuel, sortedKeys, splitOf, totalsForGroup } from '../lib/calc.js'

const RECENT_COUNT = 7

export default function Home({ days, period, onPeriodChange, onOpenDay, onGoEntry }) {
  const today = todayKey()
  const groupKey = period === 'week' ? currentWeekKey() : currentMonthKey()

  const stats = useMemo(() => totalsForGroup(days, groupKey, period), [days, groupKey, period])
  const todayTotal = dayEarnings(days[today])
  const recent = useMemo(() => sortedKeys(days).slice(0, RECENT_COUNT), [days])

  const isWeek = period === 'week'
  const hasData = Object.keys(days).length > 0

  return (
    <div className="space-y-4">
      <PeriodToggle period={period} onChange={onPeriodChange} />

      {/* Hero — the centerpiece. Soft taxi-yellow wash, biggest number in the app. */}
      <div className="rounded-[2rem] border-2 border-taxi/60 bg-hero px-6 py-7 shadow-sm shadow-black/5">
        <p className="text-2xl font-bold text-muted">{isWeek ? 'הרווחת השבוע' : 'הרווחת החודש'}</p>
        <p className="mt-1 text-[clamp(3rem,17vw,4.5rem)] font-black leading-none tracking-tight">
          <Money value={stats.earnings} />
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-2 text-lg font-semibold text-muted">
          {isWeek ? <span className="num">{weekRangeLabel(groupKey)}</span> : <span>{monthLabel(groupKey)}</span>}
          {stats.days > 0 && <span>·</span>}
          {stats.days > 0 && <span>{stats.days === 1 ? 'יום עבודה אחד' : `${stats.days} ימי עבודה`}</span>}
        </p>
        {/* Show the arithmetic only when there is tax to explain. */}
        {stats.tax > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base font-semibold text-muted">
            <span>
              ברוטו <Money value={stats.gross} />
            </span>
            <span>·</span>
            <span className="text-tax">
              מס <Money value={stats.tax} />
            </span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-lg font-semibold text-muted">היום</p>
          <p className="mt-1 text-3xl font-black leading-tight">
            <Money value={todayTotal} />
          </p>
          <p className="mt-1 text-base text-muted">{weekdayLabel(today)}</p>
        </Card>

        {/* Fuel is an expense stat — its own colour, dashed frame, never in the totals. */}
        <div className="rounded-3xl border-2 border-dashed border-fuel/40 bg-fuelbg p-4">
          <p className="flex items-center gap-1.5 text-lg font-semibold text-fuel">
            <IconFuel className="h-5 w-5" />
            {isWeek ? 'דלק השבוע' : 'דלק החודש'}
          </p>
          <p className="mt-1 text-3xl font-black leading-tight text-fuel">
            <Money value={stats.fuel} />
          </p>
          <p className="mt-1 text-base text-fuel/80">הוצאה</p>
        </div>
      </div>

      {/* How the money came in, for the selected period. */}
      <Card className="p-4">
        <p className="text-lg font-semibold text-muted">איך קיבלת {isWeek ? 'השבוע' : 'החודש'}</p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
          {splitOf(stats).map((part) => (
            <div key={part.key}>
              <p className="text-base text-muted">{part.label}</p>
              <p className="text-2xl font-black">
                <Money value={part.value} />
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="mb-2 px-1 text-xl font-bold text-muted">הימים האחרונים</h2>
        {hasData ? (
          <Card className="divide-y divide-line overflow-hidden">
            {recent.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onOpenDay(key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right active:bg-card2"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-bold">{weekdayLabel(key)}</span>
                  <span className="num block text-base text-muted">{shortDate(key)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-left">
                    <span className="block text-2xl font-black">
                      <Money value={dayEarnings(days[key])} />
                    </span>
                    {dayFuel(days[key]) > 0 && (
                      <span className="block text-base text-fuel">
                        דלק <Money value={dayFuel(days[key])} />
                      </span>
                    )}
                  </span>
                  <IconChevron className="h-5 w-5 rotate-90 text-muted" />
                </span>
              </button>
            ))}
          </Card>
        ) : (
          <EmptyState title="אין עדיין נתונים — הזן את היום הראשון שלך" action="להזנת יום" onAction={onGoEntry} />
        )}
      </div>
    </div>
  )
}
