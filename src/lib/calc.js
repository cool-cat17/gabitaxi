import { monthKeyOf, weekKeyOf } from './dates.js'

/**
 * The six earnings fields. Cash is a single field — everything he collects in
 * notes goes in one place, not once per app.
 */
export const FIELDS = [
  { key: 'gettCredit', label: 'גט — אשראי', color: 'gett' },
  { key: 'yangoCredit', label: 'יאנגו — אשראי', color: 'yango' },
  { key: 'stationCredit', label: 'תחנה — אשראי', color: 'station' },
  { key: 'stationBusiness', label: 'תחנה — עסקיות', color: 'station' },
  { key: 'bit', label: 'ביט', color: 'bit' },
  { key: 'cash', label: 'מזומן', color: 'cash' },
]

/** How the entry form is laid out: one card per source, cash last and prominent. */
export const ENTRY_SECTIONS = [
  { key: 'gett', title: 'גט', color: 'gett', fields: [{ key: 'gettCredit', label: 'אשראי' }] },
  { key: 'yango', title: 'יאנגו', color: 'yango', fields: [{ key: 'yangoCredit', label: 'אשראי' }] },
  {
    key: 'station',
    title: 'תחנה',
    color: 'station',
    fields: [
      { key: 'stationCredit', label: 'אשראי' },
      { key: 'stationBusiness', label: 'עסקיות' },
    ],
  },
  { key: 'bit', title: 'ביט', color: 'bit', fields: [{ key: 'bit', label: 'סכום' }] },
  {
    key: 'cash',
    title: 'מזומן',
    color: 'cash',
    note: 'כל המזומן שקיבלת היום — מכל המקורות יחד',
    fields: [{ key: 'cash', label: 'סכום' }],
  },
]

export const EARNING_FIELDS = FIELDS.map((f) => f.key)

/**
 * `tax` and `fuel` are the two non-income fields, and they behave differently:
 * tax is deducted from the day total, fuel never is.
 */
export const ALL_FIELDS = [...EARNING_FIELDS, 'tax', 'fuel']

/** Payment categories, for the split card and the history summaries. */
export const CREDIT_FIELDS = ['gettCredit', 'yangoCredit', 'stationCredit']

export const EMPTY_DAY = Object.fromEntries(ALL_FIELDS.map((f) => [f, 0]))

export function num(value) {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

const sum = (record, fields) => fields.reduce((acc, f) => acc + num(record?.[f]), 0)

/** What came in, before the tax deduction. */
export const dayGross = (record) => sum(record, EARNING_FIELDS)
export const dayTax = (record) => num(record?.tax)

/** The day total: income less tax. Fuel is never subtracted, anywhere. */
export const dayEarnings = (record) => dayGross(record) - dayTax(record)

export const dayCash = (record) => num(record?.cash)
export const dayCredit = (record) => sum(record, CREDIT_FIELDS)
export const dayBusiness = (record) => num(record?.stationBusiness)
export const dayBit = (record) => num(record?.bit)
export const dayFuel = (record) => num(record?.fuel)

/** Aggregate a list of day records into one totals object. */
export function totals(records) {
  return records.reduce(
    (acc, r) => ({
      gross: acc.gross + dayGross(r),
      tax: acc.tax + dayTax(r),
      earnings: acc.earnings + dayEarnings(r),
      cash: acc.cash + dayCash(r),
      credit: acc.credit + dayCredit(r),
      business: acc.business + dayBusiness(r),
      bit: acc.bit + dayBit(r),
      fuel: acc.fuel + dayFuel(r),
      days: acc.days + 1,
    }),
    { gross: 0, tax: 0, earnings: 0, cash: 0, credit: 0, business: 0, bit: 0, fuel: 0, days: 0 },
  )
}

/** The four payment categories of a totals object — always gross, before tax. */
export function splitOf(t) {
  return [
    { key: 'cash', label: 'מזומן', value: t.cash },
    { key: 'credit', label: 'אשראי', value: t.credit },
    { key: 'business', label: 'עסקיות', value: t.business },
    { key: 'bit', label: 'ביט', value: t.bit },
  ]
}

/** Date keys of a `days` map, newest first. */
export function sortedKeys(days) {
  return Object.keys(days).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
}

export function totalsForGroup(days, groupKey, period) {
  const keyOf = period === 'week' ? weekKeyOf : monthKeyOf
  const records = Object.entries(days)
    .filter(([k]) => keyOf(k) === groupKey)
    .map(([, r]) => r)
  return totals(records)
}

/**
 * Group every stored day by month or by Sunday-start week.
 * Returns groups newest first, each with its day keys newest first.
 */
export function buildGroups(days, period) {
  const keyOf = period === 'week' ? weekKeyOf : monthKeyOf
  const map = new Map()
  for (const dayKey of sortedKeys(days)) {
    const groupKey = keyOf(dayKey)
    if (!map.has(groupKey)) map.set(groupKey, [])
    map.get(groupKey).push(dayKey)
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([groupKey, dayKeys]) => ({
      groupKey,
      dayKeys,
      ...totals(dayKeys.map((k) => days[k])),
    }))
}
