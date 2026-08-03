# יומן מונית — taxi day log

A single-user, offline-first PWA in Hebrew (RTL) for logging a taxi driver's daily
earnings. No accounts, no backend, no network calls at runtime — everything lives in
`localStorage` on the device.

## Live

**https://cool-cat17.github.io/gabitaxi/** — open it on the phone in Chrome/Safari and
"add to home screen".

To publish a new version after changing anything:

```bash
npm run deploy   # builds, then force-pushes dist/ to the gh-pages branch
```

Source lives on `main`; `gh-pages` only ever holds the current build.

## Commands

```bash
npm install      # once
npm run dev      # local dev server  -> http://localhost:5173/gabitaxi/
npm run build    # production build  -> dist/
npm run preview  # serve dist/ (needed to test the PWA / offline) -> http://localhost:4173/gabitaxi/
```

The service worker only runs on the built output, so test "add to home screen" and
airplane mode against `npm run preview`, not `npm run dev`.

### Base path

GitHub Pages serves this project repo from `/gabitaxi/`, so `vite.config.js` sets that
as the base and the manifest's `start_url`, `scope` and icon paths all carry it — which
is why the local URLs above include it too. To serve from a domain root instead:

```bash
APP_BASE=/ npm run build
```

## How it works

- **Storage** — one versioned key, `taxi-log-v1`, holding `{ version, days, settings }`.
  `days` is keyed by `YYYY-MM-DD`, one record per calendar date with seven numeric fields:

  | field | label | category |
  | --- | --- | --- |
  | `gettCredit` | גט — אשראי | אשראי |
  | `yangoCredit` | יאנגו — אשראי | אשראי |
  | `stationCredit` | תחנה — אשראי | אשראי |
  | `stationBusiness` | תחנה — עסקיות | עסקיות |
  | `bit` | ביט | ביט |
  | `cash` | מזומן | מזומן |
  | `tax` | מס | *deduction — comes off the total* |
  | `fuel` | דלק | *expense — never comes off the total* |

- **Cash is a single field.** Everything he collects in notes goes in one place rather
  than once per app.
- **The day total is `gross - tax`**, where gross is the six income fields. So 1000 in
  with 50 of tax shows 950.
- **Tax and fuel are not interchangeable.** Tax reduces the headline number; fuel never
  does, anywhere. They are coloured differently for exactly this reason — tax violet,
  fuel amber — and wherever tax is non-zero the UI spells out `ברוטו … · מס …` so the
  arithmetic is visible.
- The payment split (מזומן / אשראי / עסקיות / ביט) is always **gross**, since it
  describes how the money arrived, not what was kept. It will not sum to the headline
  number on days with tax.
- **Migrations run on load** (`migrateRecord` in `storage.js`). v1 → v2: per-app cash
  columns merge into `cash`, `stationCash` becomes `stationBusiness`, `bit` starts at 0.
  v2 → v3: `tax` defaults to 0. Day totals are preserved exactly and old backup files
  still restore.
- **Weeks** run Sunday–Saturday (Israeli week) and are identified by their Sunday's date key.
- **Months** group on the `YYYY-MM` prefix of the date key.
- Date handling is local-time and string-based throughout — no UTC conversion, so a day
  never shifts across the midnight boundary.

## Files

| path | purpose |
| --- | --- |
| `src/lib/dates.js` | date keys, Sunday-start weeks, Hebrew/ILS formatting |
| `src/lib/calc.js` | field definitions, day totals, month/week grouping |
| `src/lib/storage.js` | load/save, backup export + import validation |
| `src/components/Home.jsx` | tab 1 — hero + period stats |
| `src/components/Entry.jsx` | tab 2 — daily entry form |
| `src/components/History.jsx` | tab 3 — all-time totals, groups, day breakdowns |
| `src/components/Settings.jsx` | backup export / restore |

## Backup

The data exists only on the device. The gear menu exports the whole state as a JSON file
and restores from one (behind a confirm dialog). Restoring replaces everything.
