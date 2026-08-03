import { useMemo, useState } from 'react'
import { Card, ConfirmDialog, EmptyState, IconChevron, IconFuel, IconPencil, IconTrash, Money, PeriodToggle } from './ui.jsx'
import { FIELDS, buildGroups, dayEarnings, dayFuel, num, splitOf, totals } from '../lib/calc.js'
import { groupLabel, shortDate, weekdayLabel } from '../lib/dates.js'

const DOT = {
  gett: 'bg-gett',
  yango: 'bg-yango',
  station: 'bg-station',
  bit: 'bg-bit',
  cash: 'bg-cash',
}

function DayBreakdown({ record, dayKey, onEdit, onDelete }) {
  return (
    <div className="space-y-3 border-t border-line bg-page p-3">
      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center justify-between gap-3 px-3 py-3">
            <span className="flex items-center gap-2 text-lg font-bold">
              <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${DOT[field.color]}`} aria-hidden="true" />
              {field.label}
            </span>
            <span className="text-xl font-black">
              <Money value={num(record[field.key])} />
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-fuel/40 bg-fuelbg px-3 py-3">
        <span className="flex items-center gap-2 text-lg font-bold text-fuel">
          <IconFuel className="h-5 w-5" />
          דלק
        </span>
        <span className="text-xl font-black text-fuel">
          <Money value={dayFuel(record)} />
        </span>
      </div>

      <div className="flex items-center justify-between rounded-2xl border-2 border-taxi/60 bg-hero px-3 py-3">
        <span className="text-lg font-bold text-muted">סה״כ ליום</span>
        <span className="text-2xl font-black">
          <Money value={dayEarnings(record)} />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onEdit(dayKey)}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-line bg-card text-xl font-bold active:bg-card2"
        >
          <IconPencil className="h-5 w-5" />
          עריכה
        </button>
        <button
          type="button"
          onClick={() => onDelete(dayKey)}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-line bg-card text-xl font-bold text-yango active:bg-card2"
        >
          <IconTrash className="h-5 w-5" />
          מחיקה
        </button>
      </div>
    </div>
  )
}

export default function History({ days, period, onPeriodChange, onEdit, onDelete, onGoEntry }) {
  const [openGroup, setOpenGroup] = useState(null)
  const [openDay, setOpenDay] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const allTime = useMemo(() => totals(Object.values(days)), [days])
  const groups = useMemo(() => buildGroups(days, period), [days, period])
  const hasData = groups.length > 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-lg font-semibold text-muted">סה״כ מכל הזמנים</p>
          <p className="mt-1 text-3xl font-black leading-tight">
            <Money value={allTime.earnings} />
          </p>
          <p className="mt-1 text-base text-muted">{allTime.days === 1 ? 'יום אחד' : `${allTime.days} ימים`}</p>
        </Card>
        <div className="rounded-3xl border-2 border-dashed border-fuel/40 bg-fuelbg p-4">
          <p className="flex items-center gap-1.5 text-lg font-semibold text-fuel">
            <IconFuel className="h-5 w-5" />
            דלק — הכול
          </p>
          <p className="mt-1 text-3xl font-black leading-tight text-fuel">
            <Money value={allTime.fuel} />
          </p>
          <p className="mt-1 text-base text-fuel/80">הוצאה</p>
        </div>
      </div>

      <PeriodToggle period={period} onChange={onPeriodChange} />

      {!hasData && <EmptyState title="אין עדיין נתונים — הזן את היום הראשון שלך" action="להזנת יום" onAction={onGoEntry} />}

      <div className="space-y-3">
        {groups.map((group) => {
          const groupOpen = openGroup === group.groupKey
          const label = groupLabel(group.groupKey, period)
          const parts = splitOf(group).filter((p) => p.value > 0)
          return (
            <Card key={group.groupKey} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenGroup(groupOpen ? null : group.groupKey)}
                aria-expanded={groupOpen}
                className="w-full px-4 py-4 text-right active:bg-card2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-black">
                    {period === 'week' ? <span className="num">{label}</span> : label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-2xl font-black">
                      <Money value={group.earnings} />
                    </span>
                    <IconChevron open={groupOpen} className="h-6 w-6 text-muted" />
                  </span>
                </div>
                {/* A wrapping flex row, not inline separators — a wrapped line
                    must never start with a dangling "·". */}
                <div className="mt-1.5 flex items-start justify-between gap-3 text-base">
                  <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 text-muted">
                    {parts.map((part) => (
                      <span key={part.key}>
                        {part.label} <Money value={part.value} className="font-bold text-text" />
                      </span>
                    ))}
                  </span>
                  <span className="shrink-0 font-bold text-fuel">
                    דלק <Money value={group.fuel} />
                  </span>
                </div>
              </button>

              {groupOpen && (
                <div className="border-t border-line">
                  {group.dayKeys.map((dayKey) => {
                    const record = days[dayKey]
                    const dayOpen = openDay === dayKey
                    return (
                      <div key={dayKey} className="border-b border-line last:border-b-0">
                        <button
                          type="button"
                          onClick={() => setOpenDay(dayOpen ? null : dayKey)}
                          aria-expanded={dayOpen}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right active:bg-card2"
                        >
                          <span className="min-w-0">
                            <span className="block text-xl font-bold">{weekdayLabel(dayKey)}</span>
                            <span className="num block text-base text-muted">{shortDate(dayKey)}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="text-left">
                              <span className="block text-xl font-black">
                                <Money value={dayEarnings(record)} />
                              </span>
                              {dayFuel(record) > 0 && (
                                <span className="block text-base text-fuel">
                                  דלק <Money value={dayFuel(record)} />
                                </span>
                              )}
                            </span>
                            <IconChevron open={dayOpen} className="h-5 w-5 text-muted" />
                          </span>
                        </button>
                        {dayOpen && (
                          <DayBreakdown
                            record={record}
                            dayKey={dayKey}
                            onEdit={onEdit}
                            onDelete={(k) => setPendingDelete(k)}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="למחוק את הנתונים של יום זה?"
        message={pendingDelete ? `${weekdayLabel(pendingDelete)}, ${shortDate(pendingDelete)} — הפעולה אינה הפיכה.` : ''}
        onConfirm={() => {
          onDelete(pendingDelete)
          setOpenDay(null)
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
