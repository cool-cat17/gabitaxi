import { useEffect, useState } from 'react'
import { AmountInput, ConfirmDialog, IconTrash, Modal, Money } from './ui.jsx'
import { expensesTotal, num, sanitizeAmount } from '../lib/calc.js'
import { EXPENSE_NAME_MAX } from '../lib/storage.js'
import { addDays, shortDate, todayKey, weekdayLabel } from '../lib/dates.js'

/** One tap fills the name — typing on the road is the slow part. */
const QUICK_NAMES = ['שתייה', 'אוכל', 'קפה', 'חניה', 'שטיפה']

/**
 * Add and delete small purchases. Like fuel, they are an expense on their own line
 * and never come off the earnings total.
 */
export default function Expenses({ open, onClose, title, list, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayKey)
  const [pendingDelete, setPendingDelete] = useState(null)

  useEffect(() => {
    if (open) {
      setName('')
      setAmount('')
      setDate(todayKey())
    }
  }, [open])

  const today = todayKey()
  const yesterday = addDays(today, -1)
  const canAdd = num(amount) > 0

  const handleAdd = () => {
    if (!canAdd) return
    onAdd({ date, name: name.trim() || 'הוצאה', amount: num(amount) })
    setName('')
    setAmount('')
    setDate(todayKey())
  }

  const dayBtn = (key, label) => (
    <button
      type="button"
      onClick={() => setDate(key)}
      className={`h-12 rounded-xl text-lg font-bold ${date === key ? 'bg-spend text-white' : 'bg-card2 text-muted active:bg-line'}`}
    >
      {label}
    </button>
  )

  return (
    <Modal open={open} onClose={onClose} title="הוצאות">
      <div className="max-h-[70dvh] space-y-4 overflow-y-auto">
        <div className="space-y-3 rounded-2xl border-2 border-spend/30 bg-spendbg p-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_NAMES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setName(q)}
                className={`h-11 rounded-full px-4 text-lg font-bold ${
                  name === q ? 'bg-spend text-white' : 'border border-spend/30 bg-card text-spend active:bg-card2'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={name}
            maxLength={EXPENSE_NAME_MAX}
            placeholder="על מה? (למשל קולה)"
            aria-label="על מה"
            onChange={(e) => setName(e.target.value)}
            className="h-14 w-full rounded-2xl border-2 border-line bg-card px-3 text-xl font-bold text-text outline-none placeholder:font-normal placeholder:text-muted/60 focus:border-spend"
          />

          <AmountInput value={amount} onChange={(v) => setAmount(sanitizeAmount(v))} label="סכום" accent="focus:border-spend" />

          <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-2">
            {dayBtn(today, 'היום')}
            {dayBtn(yesterday, 'אתמול')}
            <input
              type="date"
              value={date}
              max={today}
              aria-label="תאריך"
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="h-12 w-full min-w-0 rounded-xl border border-line bg-card px-1 text-sm font-bold text-text"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="h-16 w-full rounded-2xl bg-spend text-2xl font-bold text-white active:scale-[0.99] disabled:opacity-40"
          >
            הוספה
          </button>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-lg font-bold text-muted">{title}</span>
            <span className="text-xl font-black text-spend">
              <Money value={expensesTotal(list)} />
            </span>
          </div>
          {list.length === 0 ? (
            <p className="rounded-2xl bg-card2 p-4 text-center text-lg text-muted">אין עדיין הוצאות</p>
          ) : (
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {list.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 px-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-bold">{e.name}</span>
                    <span className="block text-base text-muted">
                      {weekdayLabel(e.date)} <span className="num">{shortDate(e.date)}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xl font-black text-spend">
                      <Money value={e.amount} />
                    </span>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(e)}
                      aria-label={`מחיקת ${e.name}`}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-card2 text-yango active:bg-line"
                    >
                      <IconTrash className="h-5 w-5" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="למחוק את ההוצאה?"
        message={pendingDelete ? `${pendingDelete.name} — ${shortDate(pendingDelete.date)}` : ''}
        onConfirm={() => {
          onDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </Modal>
  )
}
