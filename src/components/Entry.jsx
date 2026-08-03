import { useEffect, useMemo, useRef, useState } from 'react'
import { ConfirmDialog, IconCheck, IconFuel, IconTrash, Money } from './ui.jsx'
import { ALL_FIELDS, EARNING_FIELDS, ENTRY_SECTIONS, num } from '../lib/calc.js'
import { addDays, todayKey, weekdayLabel } from '../lib/dates.js'

/** Static class names per source so Tailwind can see them at build time. */
const ACCENT = {
  gett: { strip: 'bg-gett', title: 'text-gett', focus: 'focus:border-gett' },
  yango: { strip: 'bg-yango', title: 'text-yango', focus: 'focus:border-yango' },
  station: { strip: 'bg-station', title: 'text-station', focus: 'focus:border-station' },
  bit: { strip: 'bg-bit', title: 'text-bit', focus: 'focus:border-bit' },
  cash: { strip: 'bg-cash', title: 'text-cash', focus: 'focus:border-cash' },
}

const emptyForm = () => Object.fromEntries(ALL_FIELDS.map((f) => [f, '']))

/** Digits plus a single decimal point; a typed comma becomes a point. */
function sanitize(value) {
  let s = String(value).replace(/,/g, '.').replace(/[^0-9.]/g, '')
  const first = s.indexOf('.')
  if (first !== -1) s = s.slice(0, first + 1) + s.slice(first + 1).replace(/\./g, '')
  return s
}

function toForm(record) {
  if (!record) return emptyForm()
  return Object.fromEntries(ALL_FIELDS.map((f) => [f, record[f] ? String(record[f]) : '']))
}

function Field({ label, value, onChange, focusClass, showLabel = true, className = 'block' }) {
  return (
    <label className={className}>
      {showLabel && <span className="mb-1.5 block text-lg font-semibold text-muted">{label}</span>}
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={value}
        placeholder="0"
        aria-label={label}
        onChange={(e) => onChange(sanitize(e.target.value))}
        onFocus={(e) => e.target.select()}
        className={`h-16 w-full rounded-2xl border-2 border-line bg-page px-3 text-center text-3xl font-black text-text outline-none placeholder:text-muted/50 ${focusClass}`}
      />
    </label>
  )
}

export default function Entry({ date, record, onDateChange, onSave, onDelete }) {
  const [form, setForm] = useState(() => toForm(record))
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const savedTimer = useRef(null)

  // Reload the form whenever the chosen date changes (edit-in-place per date).
  useEffect(() => {
    setForm(toForm(record))
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  useEffect(() => () => clearTimeout(savedTimer.current), [])

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  // Live day total — earnings only, fuel excluded.
  const liveTotal = useMemo(() => EARNING_FIELDS.reduce((sum, f) => sum + num(form[f]), 0), [form])

  const handleSave = () => {
    onSave(date, Object.fromEntries(ALL_FIELDS.map((f) => [f, num(form[f])])))
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
          <label htmlFor="entry-date" className="text-lg font-semibold text-muted">
            תאריך
          </label>
          <span className="text-lg font-bold">{weekdayLabel(date)}</span>
        </div>
        <input
          id="entry-date"
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
        {record && <p className="mt-3 text-base text-muted">ליום זה כבר יש נתונים — הם נטענו לעריכה.</p>}
      </div>

      {/* earnings — one card per source, cash last and on its own */}
      {ENTRY_SECTIONS.map((section) => {
        const accent = ACCENT[section.color]
        // One input and no explanatory note? Title and field share a row, so the
        // form stays short enough to thumb through.
        const inline = section.fields.length === 1 && !section.note
        return (
          <div
            key={section.key}
            className="relative overflow-hidden rounded-3xl border border-line bg-card p-4 ps-5 shadow-sm shadow-black/5"
          >
            <span className={`absolute inset-y-0 start-0 w-2 ${accent.strip}`} aria-hidden="true" />

            {inline ? (
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <h2 className={`text-2xl font-black ${accent.title}`}>{section.title}</h2>
                  {section.fields[0].label !== 'סכום' && (
                    <p className="text-base text-muted">{section.fields[0].label}</p>
                  )}
                </div>
                <Field
                  label={`${section.title} — ${section.fields[0].label}`}
                  value={form[section.fields[0].key]}
                  onChange={set(section.fields[0].key)}
                  focusClass={accent.focus}
                  showLabel={false}
                  className="min-w-0 flex-1"
                />
              </div>
            ) : (
              <>
                <h2 className={`text-2xl font-black ${accent.title}`}>{section.title}</h2>
                {section.note && <p className="mt-1 text-base text-muted">{section.note}</p>}
                <div className={`mt-3 ${section.fields.length === 1 ? '' : 'grid grid-cols-2 gap-3'}`}>
                  {section.fields.map((field) => (
                    <Field
                      key={field.key}
                      label={field.label}
                      value={form[field.key]}
                      onChange={set(field.key)}
                      focusClass={accent.focus}
                      showLabel={section.fields.length > 1}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      })}

      {/* fuel — expense, styled apart and never part of the total */}
      <div className="rounded-3xl border-2 border-dashed border-fuel/40 bg-fuelbg p-4">
        <h2 className="flex items-center gap-2 text-2xl font-black text-fuel">
          <IconFuel className="h-6 w-6" />
          דלק
        </h2>
        <p className="mt-1 text-base text-fuel/90">הוצאה — לא נגרעת מההכנסות</p>
        <div className="mt-3">
          <input
            type="text"
            inputMode="decimal"
            dir="ltr"
            value={form.fuel}
            placeholder="0"
            aria-label="דלק"
            onChange={(e) => set('fuel')(sanitize(e.target.value))}
            onFocus={(e) => e.target.select()}
            className="h-16 w-full rounded-2xl border-2 border-fuel/40 bg-card px-3 text-center text-3xl font-black text-fuel outline-none placeholder:text-fuel/40 focus:border-fuel"
          />
        </div>
      </div>

      {/* live total */}
      <div className="rounded-3xl border-2 border-taxi/60 bg-hero px-5 py-4">
        <p className="text-xl font-bold text-muted">סה״כ ליום</p>
        <p className="text-[clamp(2.25rem,12vw,3.25rem)] font-black leading-tight">
          <Money value={liveTotal} />
        </p>
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

      {record && (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex h-16 w-full items-center justify-center gap-2 rounded-3xl border border-line bg-card text-xl font-bold text-yango active:bg-card2"
        >
          <IconTrash />
          מחיקת נתוני היום הזה
        </button>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="למחוק את הנתונים של יום זה?"
        message="הפעולה אינה הפיכה."
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete(date)
          setForm(emptyForm())
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
