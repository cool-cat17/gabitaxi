import { ALL_FIELDS, num } from './calc.js'

export const STORAGE_KEY = 'taxi-log-v1'
export const SCHEMA_VERSION = 2

const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  days: {},
  settings: { period: 'month' },
}

const isDateKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k)

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
  const state = { version: SCHEMA_VERSION, days: {}, settings: { period: 'month' } }
  if (!raw || typeof raw !== 'object') return state

  const days = raw.days && typeof raw.days === 'object' ? raw.days : {}
  for (const [key, value] of Object.entries(days)) {
    if (!isDateKey(key) || !value || typeof value !== 'object') continue
    state.days[key] = migrateRecord(value)
  }

  const period = raw.settings?.period
  if (period === 'week' || period === 'month') state.settings.period = period

  return state
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return normalize(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_STATE }
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
