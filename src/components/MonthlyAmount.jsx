import { useEffect, useState } from 'react'
import { AmountInput, Modal, Money } from './ui.jsx'
import { VAT_RATE, num, sanitizeAmount, vatOn } from '../lib/calc.js'
import { monthLabel } from '../lib/dates.js'

/**
 * The once-a-month amount he also pays מע״מ on. One value per calendar month,
 * replaced each time — reachable from the home screen and from the מדווח tab.
 */
export default function MonthlyAmount({ open, onClose, monthKey, value, onSave }) {
  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (open) setDraft(value ? String(value) : '')
  }, [open, value])

  const amount = num(draft)

  return (
    <Modal open={open} onClose={onClose} title="סכום חודשי">
      <p className="mb-4 text-lg leading-relaxed text-muted">
        הסכום שמתקבל פעם בחודש ומשלמים עליו מע״מ. הוא לא מתווסף להכנסות — רק המע״מ יורד.
      </p>
      <p className="mb-2 text-lg font-bold">{monthLabel(monthKey)}</p>

      <AmountInput
        value={draft}
        onChange={(v) => setDraft(sanitizeAmount(v))}
        label="סכום חודשי"
        accent="focus:border-tax"
      />

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-taxbg px-4 py-3">
        <span className="text-lg font-bold text-tax">מע״מ {Math.round(VAT_RATE * 100)}%</span>
        <span className="text-xl font-black text-tax">
          <Money value={vatOn(amount)} />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => {
            onSave(monthKey, amount)
            onClose()
          }}
          className="h-16 rounded-2xl bg-taxi text-2xl font-bold text-text active:scale-[0.99]"
        >
          שמור
        </button>
        {value > 0 && (
          <button
            type="button"
            onClick={() => {
              onSave(monthKey, 0)
              onClose()
            }}
            className="h-14 rounded-2xl border border-line bg-card2 text-xl font-bold text-yango active:bg-line"
          >
            מחיקת הסכום
          </button>
        )}
      </div>
    </Modal>
  )
}
