import { ALL_FIELDS, num } from './calc.js'

export const STORAGE_KEY = 'taxi-log-v1'
export const SCHEMA_VERSION = 5

const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  days: {},
  reports: {},
  monthlyReports: {},
  expenses: [],
  settings: { period: 'month' },
}

const isDateKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k)
const isMonthKey = (k) => /^\d{4}-\d{2}$/.test(k)

export const EXPENSE_NAME_MAX = 40

export function newExpenseId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const LEGACY_KEYS = ['gettCash', 'yangoCash', 'stationCash']

/**
 * v1 kept a cash field per source and no ביט. v2 has one shared cash field,
 * תחנה–עסקיות as its own field, and ביט. The mapping preserves day totals exactly:
 * the old per-app cash columns merge into `cash`, and the old stationCash column
 * (which was labelled עסקיות) becomes `stationBusiness`.
 */
function migrateRecord(value) {
  const record = Object.fromEntries(ALL_FIELDS.map((f) => [f, 0]))
  const isLegacy = LEGACY_KEYS.some((k) => k in value) && !('cash' in value)

  if (isLegacy) {
    record.cash = num(value.gettCash) + num(value.yangoCash)
    record.stationBusiness = num(value.stationCash)
    record.gettCredit = num(value.gettCredit)
    record.yangoCredit = num(value.yangoCredit)
    record.stationCredit = num(value.stationCredit)
    record.bit = 0
    record.fuel = num(value.fuel)
    return record
  }

  for (const field of ALL_FIELDS) record[field] = num(value[field])
  return record
}

/** Coerce anything that comes out of storage (or a backup file) into our shape. */
export function normalize(raw) {
  const state = { version: SCHEMA_VERSION, days: {}, reports: {}, monthlyReports: {}, expenses: [], settings: { period: 'month' } }
  if (!raw || typeof raw !== 'object') return state

  const days = raw.days && typeof raw.days === 'object' ? raw.days : {}
  for (const [key, value] of Object.entries(days)) {
    if (!isDateKey(key) || !value || typeof value !== 'object') continue
    state.days[key] = migrateRecord(value)
  }

  // מע״מ lives apart from the earnings log: a reported amount is money already
  // counted in `days`, so keeping it here stops it creating phantom ₪0 workdays.
  const reports = raw.reports && typeof raw.reports === 'object' ? raw.reports : {}
  for (const [key, value] of Object.entries(reports)) {
    const amount = num(value)
    if (isDateKey(key) && amount !== 0) state.reports[key] = amount
  }

  const monthlyReports = raw.monthlyReports && typeof raw.monthlyReports === 'object' ? raw.monthlyReports : {}
  for (const [key, value] of Object.entries(monthlyReports)) {
    const amount = num(value)
    if (isMonthKey(key) && amount !== 0) state.monthlyReports[key] = amount
  }

  // Small purchases (a drink, something to eat). Like fuel, they never come off the
  // earnings total. Every field is re-checked so a hand-edited backup can't inject junk.
  const expenses = Array.isArray(raw.expenses) ? raw.expenses : []
  for (const item of expenses) {
    if (!item || typeof item !== 'object') continue
    const amount = num(item.amount)
    if (!isDateKey(item.date) || !(amount > 0)) continue
    state.expenses.push({
      id: typeof item.id === 'string' && item.id ? item.id.slice(0, 40) : newExpenseId(),
      date: item.date,
      name: typeof item.name === 'string' ? item.name.trim().slice(0, EXPENSE_NAME_MAX) : '',
      amount,
    })
  }

  const period = raw.settings?.period
  if (period === 'week' || period === 'month') state.settings.period = period

  return state
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalize(DEFAULT_STATE)
    return normalize(JSON.parse(raw))
  } catch {
    return normalize(DEFAULT_STATE)
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** A backup file is just the whole state plus a stamp, so restore is trivial. */
export function makeBackup(state) {
  return JSON.stringify({ ...state, app: 'taxi-log', exportedAt: new Date().toISOString() }, null, 2)
}

export function parseBackup(text) {
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || typeof parsed.days !== 'object' || parsed.days === null) {
    throw new Error('bad-file')
  }
  return normalize(parsed)
}
