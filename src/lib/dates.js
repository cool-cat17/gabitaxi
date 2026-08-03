// All date handling is local-timezone and string-key based ("YYYY-MM-DD").
// Nothing here ever goes through Date.parse / toISOString, so a device in
// Israel never sees a day shift.

const pad = (n) => String(n).padStart(2, '0')

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey() {
  return toKey(new Date())
}

export function addDays(key, days) {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** "2026-08-04" -> "2026-08" */
export function monthKeyOf(key) {
  return key.slice(0, 7)
}

/**
 * Israeli week: Sunday .. Saturday. getDay() is already 0 for Sunday,
 * so the week's Sunday is simply "today minus getDay() days".
 * The week is identified by the key of that Sunday.
 */
export function weekKeyOf(key) {
  const d = fromKey(key)
  d.setDate(d.getDate() - d.getDay())
  return toKey(d)
}

export function currentMonthKey() {
  return monthKeyOf(todayKey())
}

export function currentWeekKey() {
  return weekKeyOf(todayKey())
}

/** Does this date key belong to the given group (month key or week key)? */
export function inGroup(dayKey, groupKey, period) {
  return period === 'week' ? weekKeyOf(dayKey) === groupKey : monthKeyOf(dayKey) === groupKey
}

/* ---------- formatting ---------- */

const monthFmt = new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' })
const weekdayFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'long' })
const weekdayShortFmt = new Intl.DateTimeFormat('he-IL', { weekday: 'short' })

/** "2026-08" -> "אוגוסט 2026" */
export function monthLabel(monthKey) {
  const [y, m] = monthKey.split('-').map(Number)
  return monthFmt.format(new Date(y, m - 1, 1))
}

/** "2026-08-04" -> "4.8" */
export function shortDate(key) {
  const d = fromKey(key)
  return `${d.getDate()}.${d.getMonth() + 1}`
}

/** Sunday key -> "10.8 – 16.8" (rendered inside a dir="ltr" span) */
export function weekRangeLabel(weekKey) {
  return `${shortDate(weekKey)} – ${shortDate(addDays(weekKey, 6))}`
}

/** "2026-08-04" -> "יום שלישי" */
export function weekdayLabel(key) {
  return weekdayFmt.format(fromKey(key))
}

/** "2026-08-04" -> "ג׳" style short weekday */
export function weekdayShort(key) {
  return weekdayShortFmt.format(fromKey(key))
}

export function groupLabel(groupKey, period) {
  return period === 'week' ? weekRangeLabel(groupKey) : monthLabel(groupKey)
}

/* ---------- money ---------- */

const shekel = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatMoney(value) {
  return shekel.format(Number(value) || 0)
}
