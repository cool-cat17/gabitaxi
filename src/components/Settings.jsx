import { useRef, useState } from 'react'
import { ConfirmDialog, IconDownload, IconUpload, Modal } from './ui.jsx'
import { makeBackup, parseBackup } from '../lib/storage.js'
import { todayKey } from '../lib/dates.js'

export default function Settings({ open, onClose, state, onRestore }) {
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null)
  const [note, setNote] = useState(null)

  const dayCount = Object.keys(state.days).length

  const handleExport = () => {
    const blob = new Blob([makeBackup(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `גיבוי-יומן-מונית-${todayKey()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNote({ kind: 'ok', text: 'קובץ הגיבוי ירד למכשיר.' })
  }

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const restored = parseBackup(await file.text())
      setNote(null)
      setPending(restored)
    } catch {
      setNote({ kind: 'error', text: 'הקובץ אינו קובץ גיבוי תקין.' })
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="הגדרות וגיבוי">
        <p className="mb-4 text-lg leading-relaxed text-muted">
          הנתונים נשמרים רק במכשיר הזה. כדאי לייצא גיבוי מדי פעם ולשמור אותו במקום בטוח.
        </p>
        <p className="mb-5 text-lg font-bold">
          נשמרו {dayCount === 1 ? 'יום אחד' : `${dayCount} ימים`}.
        </p>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl bg-taxi text-2xl font-bold text-text active:scale-[0.99]"
          >
            <IconDownload />
            ייצוא גיבוי
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-16 items-center justify-center gap-2 rounded-2xl border border-line bg-card2 text-2xl font-bold text-text active:bg-line"
          >
            <IconUpload />
            שחזור מגיבוי
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleFile} className="hidden" />
        </div>

        {note && (
          <p className={`mt-4 text-lg font-bold ${note.kind === 'error' ? 'text-yango' : 'text-cash'}`}>
            {note.text}
          </p>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pending)}
        title="לשחזר מהגיבוי?"
        message={
          pending
            ? `בקובץ יש ${Object.keys(pending.days).length} ימים. כל הנתונים הקיימים במכשיר יוחלפו.`
            : ''
        }
        confirmLabel="כן, לשחזר"
        onConfirm={() => {
          onRestore(pending)
          setPending(null)
          setNote({ kind: 'ok', text: 'הנתונים שוחזרו בהצלחה.' })
        }}
        onCancel={() => setPending(null)}
      />
    </>
  )
}
