import { useCallback, useEffect, useRef, useState } from 'react'
import Home from './components/Home.jsx'
import Entry from './components/Entry.jsx'
import History from './components/History.jsx'
import Settings from './components/Settings.jsx'
import { IconEntry, IconGear, IconHistory, IconHome } from './components/ui.jsx'
import { loadState, saveState } from './lib/storage.js'
import { todayKey } from './lib/dates.js'

const TABS = [
  { key: 'home', label: 'בית', Icon: IconHome },
  { key: 'entry', label: 'הזנה יומית', Icon: IconEntry },
  { key: 'history', label: 'היסטוריה', Icon: IconHistory },
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
            period={state.settings.period}
            onPeriodChange={setPeriod}
            onOpenDay={editDay}
            onGoEntry={goEntry}
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

      <nav className="safe-bottom grid shrink-0 grid-cols-3 gap-1 border-t border-line bg-card px-2 pt-2">
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl text-base font-bold ${
                active ? 'bg-taxi/30 text-text' : 'text-muted active:bg-card2'
              }`}
            >
              <Icon className="h-7 w-7" />
              {label}
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
