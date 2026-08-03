import { useEffect } from 'react'
import { formatMoney } from '../lib/dates.js'

/* ---------- money ---------- */

export function Money({ value, className = '' }) {
  return <span className={`money ${className}`}>{formatMoney(value)}</span>
}

/* ---------- icons (inline, nothing loaded from the network) ---------- */

const svg = (props) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...props,
})

export function IconHome({ className = 'w-7 h-7' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M5 17v-4.5l1.6-4.2A2 2 0 0 1 8.5 7h7a2 2 0 0 1 1.9 1.3L19 12.5V17" />
      <path d="M4 17h16" />
      <circle cx="7.5" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
      <path d="M9.5 7V5h5v2" />
    </svg>
  )
}

export function IconEntry({ className = 'w-7 h-7' }) {
  return (
    <svg {...svg({ className })}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 9v6M9 12h6" />
    </svg>
  )
}

export function IconHistory({ className = 'w-7 h-7' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  )
}

export function IconGear({ className = 'w-7 h-7' }) {
  return (
    <svg {...svg({ className })}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function IconFuel({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M3 22h12" />
      <path d="M4 9h10" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.83a2 2 0 0 0-.59-1.41L18 5" />
    </svg>
  )
}

export function IconTax({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  )
}

export function IconChevron({ open, className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className: `${className} transition-transform ${open ? 'rotate-180' : ''}` })}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function IconTrash({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    </svg>
  )
}

export function IconPencil({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" />
    </svg>
  )
}

export function IconDownload({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M12 4v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function IconUpload({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M12 16V5m0 0 4 4m-4-4L8 9" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function IconCheck({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="m5 13 4.5 4.5L19 7" />
    </svg>
  )
}

export function IconClose({ className = 'w-6 h-6' }) {
  return (
    <svg {...svg({ className })}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/* ---------- shared blocks ---------- */

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-3xl border border-line bg-card shadow-sm shadow-black/5 ${className}`} {...rest}>
      {children}
    </div>
  )
}

/** The שבוע | חודש segmented control. Shared state — one setting for the app. */
export function PeriodToggle({ period, onChange }) {
  const options = [
    { value: 'week', label: 'שבוע' },
    { value: 'month', label: 'חודש' },
  ]
  return (
    <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-card2 p-1.5" role="tablist">
      {options.map((o) => {
        const active = period === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`h-14 rounded-xl text-2xl font-bold transition-colors ${
              active ? 'bg-taxi text-text shadow-sm shadow-black/10' : 'text-muted active:bg-line'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl border border-line bg-card p-5 pb-8 shadow-2xl shadow-black/20 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגירה"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-card2 text-muted active:bg-line"
          >
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'כן, למחוק', danger = true, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-[400px] rounded-3xl border border-line bg-card p-6 shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <h2 className="text-2xl font-bold leading-snug">{title}</h2>
        {message && <p className="mt-2 text-lg leading-relaxed text-muted">{message}</p>}
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className={`h-16 rounded-2xl text-2xl font-bold active:scale-[0.99] ${
              danger ? 'bg-yango text-white' : 'bg-taxi text-text'
            }`}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-16 rounded-2xl border border-line bg-card2 text-2xl font-bold text-text active:bg-line"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title, action, onAction }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line bg-card/70 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-taxi/25 text-text">
        <IconHome className="h-9 w-9" />
      </div>
      <p className="text-xl leading-relaxed text-muted">{title}</p>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 h-14 w-full rounded-2xl bg-taxi text-xl font-bold text-text active:scale-[0.99]"
        >
          {action}
        </button>
      )}
    </div>
  )
}
