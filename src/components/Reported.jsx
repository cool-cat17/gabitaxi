import { useMemo, useState } from 'react'
import { Card, EmptyState, IconChevron, Money } from './ui.jsx'
import MonthlyAmount from './MonthlyAmount.jsx'
import { VAT_RATE, vatForMonth, vatOn } from '../lib/calc.js'
import { addMonths, currentMonthKey, monthKeyOf, monthLabel, shortDate, weekdayLabel } from '../lib/dates.js'

/**
 * The מע״מ overview. Amounts are entered where the money is: the daily figure in
 * the daily entry form, the once-a-month figure on the home screen. This tab adds
 * them up and shows what is owed.
 */
export default function Reported({ reports, monthlyReports, onEditDay, onSaveMonthly }) {
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [monthlyOpen, setMonthlyOpen] = useState(false)

  const summary = useMemo(
    () => vatForMonth({ reports, monthlyReports, monthKey }),
    [reports, monthlyReports, monthKey],
  )

  const monthDays = useMemo(
    () =>
      Object.keys(reports)
        .filter((k) => monthKeyOf(k) === monthKey)
        .sort((a, b) => (a < b ? 1 : -1)),
    [reports, monthKey],
  )

  const isCurrent = monthKey === currentMonthKey()

  return (
    <div className="space-y-4">
      {/* month browser */}
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-card p-2 shadow-sm shadow-black/5">
        <button
          type="button"
          onClick={() => setMonthKey(addMonths(monthKey, -1))}
          aria-label="חודש קודם"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-card2 text-muted active:bg-line"
        >
          {/* RTL: earlier is to the right, so this arrow points right */}
          <IconChevron className="h-6 w-6 -rotate-90" />
        </button>
        <span className="text-xl font-black">{monthLabel(monthKey)}</span>
        <button
          type="button"
          onClick={() => setMonthKey(addMonths(monthKey, 1))}
          aria-label="חודש הבא"
          disabled={isCurrent}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-card2 text-muted active:bg-line disabled:opacity-30"
        >
          <IconChevron className="h-6 w-6 rotate-90" />
        </button>
      </div>

      {/* what is owed */}
      <div className="rounded-3xl border-2 border-tax/40 bg-taxbg p-5">
        <p className="text-lg font-semibold text-tax">מע״מ לתשלום ({Math.round(VAT_RATE * 100)}%)</p>
        <p className="mt-1 text-[clamp(2.5rem,14vw,3.5rem)] font-black leading-none text-tax">
          <Money value={summary.vat} />
        </p>
        <p className="mt-2 text-base font-semibold text-muted">
          מסה״כ מדווח של <Money value={summary.base} className="font-bold text-text" />
        </p>
      </div>

      {/* how that total is made up */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg text-muted">מדווח יומי</span>
            <span className="text-xl font-bold">
              <Money value={summary.daily} />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMonthlyOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-card2 px-3 py-2.5 text-right active:bg-line"
          >
            <span className="text-lg text-muted">סכום חודשי</span>
            <span className="flex items-center gap-2">
              <span className="text-xl font-bold">
                <Money value={summary.monthly} />
              </span>
              <span className="text-base font-bold text-tax">שינוי</span>
            </span>
          </button>
          <div className="flex items-center justify-between border-t border-line pt-2">
            <span className="text-lg font-bold">סה״כ מדווח</span>
            <span className="text-xl font-black">
              <Money value={summary.base} />
            </span>
          </div>
        </div>
        <p className="mt-3 text-base leading-relaxed text-muted">
          את הסכום היומי מזינים במסך „הזנה״, יחד עם שאר נתוני היום.
        </p>
      </Card>

      {/* the reported days of this month */}
      <div>
        <h2 className="mb-2 px-1 text-xl font-bold text-muted">הימים שדווחו</h2>
        {monthDays.length > 0 ? (
          <Card className="divide-y divide-line overflow-hidden">
            {monthDays.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onEditDay(key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right active:bg-card2"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-bold">{weekdayLabel(key)}</span>
                  <span className="num block text-base text-muted">{shortDate(key)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-left">
                    <span className="block text-2xl font-black">
                      <Money value={reports[key]} />
                    </span>
                    <span className="block text-base text-tax">
                      מע״מ <Money value={vatOn(reports[key])} />
                    </span>
                  </span>
                  <IconChevron className="h-5 w-5 rotate-90 text-muted" />
                </span>
              </button>
            ))}
          </Card>
        ) : (
          <EmptyState
            title="לא דיווחת סכומים בחודש הזה — אפשר להזין את הסכום היומי במסך ההזנה"
            action="למסך ההזנה"
            onAction={() => onEditDay(null)}
          />
        )}
      </div>

      <MonthlyAmount
        open={monthlyOpen}
        onClose={() => setMonthlyOpen(false)}
        monthKey={monthKey}
        value={summary.monthly}
        onSave={onSaveMonthly}
      />
    </div>
  )
}
