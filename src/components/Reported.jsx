import { useEffect, useMemo, useRef, useState } from 'react'
import { AmountInput, Card, ConfirmDialog, EmptyState, IconCheck, IconTrash, Money } from './ui.jsx'
import MonthlyAmount from './MonthlyAmount.jsx'
import { VAT_RATE, num, sanitizeAmount, vatForMonth, vatOn } from '../lib/calc.js'
import { addDays, monthKeyOf, monthLabel, shortDate, todayKey, weekdayLabel } from '../lib/dates.js'

export default function Reported({ reports, monthlyReports, date, onDateChange, onSave, onDelete, onSaveMonthly }) {
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [monthlyOpen, setMonthlyOpen] = useState(false)
  const savedTimer = useRef(null)

  const existing = reports[date]

  useEffect(() => {
    setDraft(existing ? String(existing) : '')
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const amount = num(draft)
  const monthKey = monthKeyOf(date)

  // The summary follows the date being edited, not "now".
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

  const handleSave = () => {
    onSave(date, amount)
    setSaved(true)
    clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSaved(false), 2500)
  }

  const today = todayKey()
  const yesterday = addDays(today, -1)

  return (
    <div className="space-y-4">
      {/* date */}
      <div className="rounded-3xl border border-line bg-card p-4 shadow-sm shadow-black/5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="report-date" className="text-lg font-semibold text-muted">
            תאריך
          </label>
          <span className="text-lg font-bold">{weekdayLabel(date)}</span>
        </div>
        <input
          id="report-date"
          type="date"
          dir="ltr"
          value={date}
          onChange={(e) => e.target.value && onDateChange(e.target.value)}
          className="mt-2 h-16 w-full rounded-2xl border-2 border-line bg-page px-4 text-2xl font-bold text-text outline-none focus:border-taxi"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDateChange(today)}
            className={`h-12 rounded-xl border text-lg font-bold ${
              date === today ? 'border-taxi bg-taxi/25 text-text' : 'border-line bg-card2 text-muted'
            }`}
          >
            היום
          </button>
          <button
            type="button"
            onClick={() => onDateChange(yesterday)}
            className={`h-12 rounded-xl border text-lg font-bold ${
              date === yesterday ? 'border-taxi bg-taxi/25 text-text' : 'border-line bg-card2 text-muted'
            }`}
          >
            אתמול
          </button>
        </div>
      </div>

      {/* the amount he reports for this date */}
      <div className="rounded-3xl border-2 border-tax/40 bg-taxbg p-4">
        <h2 className="text-2xl font-black text-tax">סכום מדווח</h2>
        <p className="mt-1 text-base text-tax/90">הסכום שמשלמים עליו מע״מ. לא מתווסף להכנסות.</p>
        <div className="mt-3">
          <AmountInput
            value={draft}
            onChange={(v) => {
              setDraft(sanitizeAmount(v))
              setSaved(false)
            }}
            label="סכום מדווח"
            accent="focus:border-tax"
            className="bg-card"
          />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-card px-4 py-3">
          <span className="text-lg font-bold text-tax">מע״מ {Math.round(VAT_RATE * 100)}%</span>
          <span className="text-2xl font-black text-tax">
            <Money value={vatOn(amount)} />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`h-20 w-full rounded-3xl text-3xl font-black shadow-sm shadow-black/10 transition-colors active:scale-[0.99] ${
          saved ? 'bg-cash text-white' : 'bg-taxi text-text'
        }`}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <IconCheck className="h-8 w-8" />
            נשמר!
          </span>
        ) : (
          'שמור'
        )}
      </button>

      {existing > 0 && (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-3xl border border-line bg-card text-xl font-bold text-yango active:bg-card2"
        >
          <IconTrash />
          מחיקת הדיווח של יום זה
        </button>
      )}

      {/* month summary */}
      <Card className="p-4">
        <p className="text-lg font-semibold text-muted">מדווח — {monthLabel(monthKey)}</p>
        <div className="mt-3 space-y-2">
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
          <div className="flex items-center justify-between rounded-xl bg-taxbg px-3 py-2.5">
            <span className="text-lg font-bold text-tax">מע״מ לתשלום ({Math.round(VAT_RATE * 100)}%)</span>
            <span className="text-2xl font-black text-tax">
              <Money value={summary.vat} />
            </span>
          </div>
        </div>
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
                onClick={() => onDateChange(key)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right active:bg-card2"
              >
                <span className="min-w-0">
                  <span className="block text-xl font-bold">{weekdayLabel(key)}</span>
                  <span className="num block text-base text-muted">{shortDate(key)}</span>
                </span>
                <span className="text-left">
                  <span className="block text-2xl font-black">
                    <Money value={reports[key]} />
                  </span>
                  <span className="block text-base text-tax">
                    מע״מ <Money value={vatOn(reports[key])} />
                  </span>
                </span>
              </button>
            ))}
          </Card>
        ) : (
          <EmptyState title="עדיין לא דיווחת סכומים בחודש הזה" />
        )}
      </div>

      <MonthlyAmount
        open={monthlyOpen}
        onClose={() => setMonthlyOpen(false)}
        monthKey={monthKey}
        value={summary.monthly}
        onSave={onSaveMonthly}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="למחוק את הדיווח של יום זה?"
        message="הפעולה אינה הפיכה."
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete(date)
          setDraft('')
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
