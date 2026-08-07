import { useCallback, useEffect, useRef, useState } from 'react'
import Home from './components/Home.jsx'
import Entry from './components/Entry.jsx'
import Reported from './components/Reported.jsx'
import History from './components/History.jsx'
import Settings from './components/Settings.jsx'
import { IconEntry, IconGear, IconHistory, IconHome, IconReport } from './components/ui.jsx'
import { loadState, saveState } from './lib/storage.js'
import { todayKey } from './lib/dates.js'

// `label` is the full page name; `short` is what fits in a four-up bottom bar.
const TABS = [
  { key: 'home', label: 'בית', short: 'בית', Icon: IconHome },
  { key: 'entry', label: 'הזנה יומית', short: 'הזנה', Icon: IconEntry },
  { key: 'reported', label: 'מדווח', short: 'מדווח', Icon: IconReport },
  { key: 'history', label: 'היסטוריה', short: 'היסטוריה', Icon: IconHistory },
]

export default function App() {
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('home')
  const [entryDate, setEntryDate] = useState(todayKey)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const scrollRef = useRef(null)

  // One versioned key, written on every change.
  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const setPeriod = useCallback((period) => {
    setState((s) => ({ ...s, settings: { ...s.settings, period } }))
  }, [])

  const saveDay = useCallback((dateKey, record) => {
    setState((s) => ({ ...s, days: { ...s.days, [dateKey]: record } }))
  }, [])

  const deleteDay = useCallback((dateKey) => {
    setState((s) => {
      const days = { ...s.days }
      delete days[dateKey]
      return { ...s, days }
    })
  }, [])

  // A zero report is the same as no report, so saving 0 removes the entry.
  const saveReport = useCallback((dateKey, amount) => {
    setState((s) => {
      const reports = { ...s.reports }
      if (amount > 0) reports[dateKey] = amount
      else delete reports[dateKey]
      return { ...s, reports }
    })
  }, [])

  const deleteReport = useCallback((dateKey) => {
    setState((s) => {
      const reports = { ...s.reports }
      delete reports[dateKey]
      return { ...s, reports }
    })
  }, [])

  const saveMonthlyReport = useCallback((monthKey, amount) => {
    setState((s) => {
      const monthlyReports = { ...s.monthlyReports }
      if (amount > 0) monthlyReports[monthKey] = amount
      else delete monthlyReports[monthKey]
      return { ...s, monthlyReports }
    })
  }, [])

  const editDay = useCallback((dateKey) => {
    setEntryDate(dateKey)
    setTab('entry')
  }, [])

  const goEntry = useCallback(() => {
    setEntryDate(todayKey())
    setTab('entry')
  }, [])

  const activeTab = TABS.find((t) => t.key === tab)

  return (
    <div className="mx-auto flex h-[100dvh] max-w-[430px] flex-col bg-page">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card px-4 py-3">
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-taxi text-text">
            <IconHome className="h-6 w-6" />
          </span>
          יומן מונית
        </h1>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="הגדרות וגיבוי"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-card text-muted active:bg-card2"
        >
          <IconGear />
        </button>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <h2 className="sr-only">{activeTab?.label}</h2>
        {tab === 'home' && (
          <Home
            days={state.days}
            reports={state.reports}
            monthlyReports={state.monthlyReports}
            period={state.settings.period}
            onPeriodChange={setPeriod}
            onOpenDay={editDay}
            onGoEntry={goEntry}
            onSaveMonthly={saveMonthlyReport}
          />
        )}
        {tab === 'reported' && (
          <Reported
            reports={state.reports}
            monthlyReports={state.monthlyReports}
            date={entryDate}
            onDateChange={setEntryDate}
            onSave={saveReport}
            onDelete={deleteReport}
            onSaveMonthly={saveMonthlyReport}
          />
        )}
        {tab === 'entry' && (
          <Entry
            date={entryDate}
            record={state.days[entryDate]}
            onDateChange={setEntryDate}
            onSave={saveDay}
            onDelete={deleteDay}
          />
        )}
        {tab === 'history' && (
          <History
            days={state.days}
            period={state.settings.period}
            onPeriodChange={setPeriod}
            onEdit={editDay}
            onDelete={deleteDay}
            onGoEntry={goEntry}
          />
        )}
      </main>

      <nav className="safe-bottom grid shrink-0 grid-cols-4 gap-1 border-t border-line bg-card px-1.5 pt-2">
        {TABS.map(({ key, short, Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl text-sm font-bold ${
                active ? 'bg-taxi/30 text-text' : 'text-muted active:bg-card2'
              }`}
            >
              <Icon className="h-6 w-6" />
              {short}
            </button>
          )
        })}
      </nav>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        state={state}
        onRestore={(restored) => setState(restored)}
      />
    </div>
  )
}
