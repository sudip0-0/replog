# RepLog

A fast, offline-first strength-training tracker (Expo + React Native + TypeScript).
Log workouts, reuse routines, keep per-exercise notes, see progress analytics, and
get **transparent, deterministic** progression suggestions — all without a network
connection during a gym session. Supabase auth + sync layer on top.

## Highlights

- **Offline-first.** Local SQLite is the source of truth; the active workout
  survives app close/restart.
- **Fast logging.** Start empty or from a routine, search the exercise library,
  log weight/reps/RPE/set-type, inline previous performance, per-exercise rest timer.
- **Routines.** Create/edit/duplicate/delete, reorder, target sets/reps/rest, plus
  6 starter templates (Push, Pull, Legs, Upper, Lower, Full Body).
- **Exercise memory.** Machine settings, grip, stance, injury cautions, substitutions —
  per user and optionally per gym profile, surfaced inline while logging.
- **Analytics.** Workout history, exercise detail (best weight, est. 1RM, reps,
  volume-over-time charts), PR detection on finish, weekly muscle-group volume.
- **Progression engine.** 5 deterministic rules (double progression, add-reps,
  add-weight, maintain, deload), each with a plain-text explanation.

## Tech stack

| Area | Choice |
| --- | --- |
| App | Expo SDK 56, React Native 0.85, React 19, TypeScript 6 (strict) |
| Routing | Expo Router (typed routes) |
| UI | React Native Paper (Material 3, light/dark) |
| Local data | expo-sqlite + typed repositories |
| Server/client state | TanStack Query (async data) + Zustand (UI/session only) |
| Validation | Zod at every boundary |
| Backend | Supabase (Auth + Postgres + RLS) |
| Testing | Jest + React Native Testing Library; Maestro for E2E |

## Architecture

Domain-driven, with business rules kept pure and framework-free.

```
app/                      Expo Router routes (thin)
  (tabs)/                 today, routines, history, profile
  workout/[id]            active workout
  routine/[id]            routine builder
  exercise/[id]           exercise analytics detail
  history/[id]            completed workout summary
  add-exercise            shared picker (workout or routine)
src/
  domain/                 pure logic: schemas (Zod), oneRepMax, volume, pr,
                          weeklyVolume, progression, units  (fully unit-tested)
  data/local/             SqlDatabase interface, migrations, generic Repository,
                          codecs, db (expo-sqlite), repos, testDb (better-sqlite3)
  data/remote/            supabase client, conflict resolver (LWW), sync engine
  data/seed/              exercises.json (64) + loader
  features/{workouts,routines,exercises,progress,auth}/
                          services (pure over Repos) + React Query hooks + components
  components/ theme/ store/ providers/
supabase/migrations/      Postgres schema + RLS
.maestro/                 smoke E2E flow
```

Key decisions:

- **SQLite is the single read/write path.** Route components never touch Supabase
  directly — they go through feature hooks → services → repositories.
- **Syncable records** carry client UUIDs + `created_at`/`updated_at`/`deleted_at`
  (soft delete). Local changes are tracked in a `sync_queue`.
- **Completed workouts are immutable**: the conflict resolver never overwrites a
  completed local workout, and analytics treat history as append-only.
- **No `any`** without justification; Zod parses every row and form boundary.

## Run it locally

```bash
npm install
npm run start        # Expo dev server (press i / a / w, or scan with Expo Go)
```

Quality gates:

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # eslint
npm test             # jest unit/component/integration tests
```

The app runs fully in **guest / local-only mode** out of the box — no backend needed.

## Supabase setup (optional cloud sync)

Live sync is implemented but **documented-but-unverified** without credentials.
To enable it:

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   to create the schema and Row Level Security policies (every table is restricted
   to `user_id = auth.uid()`; built-in exercises are world-readable).
3. Create `.env` (see `.env.example`):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

4. Restart the dev server. The Profile tab now shows Sign in / Sign up. After
   signing in, local changes in `sync_queue` push to Supabase and remote changes
   pull back, merged via last-write-wins (`src/data/remote/sync.ts`).

Secrets live only in env vars and are never committed (`.env` is gitignored).

## End-to-end smoke test

```bash
# Requires a running emulator/device with the app installed, and Maestro.
maestro test .maestro/smoke.yaml
```

Covers: start workout → add exercise → log a set → finish → see it in History.

## Known limitations / next steps

- Live Supabase sync (push/pull, RLS) is implemented with persisted per-table
  watermarks, a manual "Sync now" control, and a last-write-wins conflict
  resolver — all unit-tested — but **not yet verified against a real Supabase
  project** in this environment. Provision credentials to validate end-to-end.
- Sync runs on demand (manual button + after sign-in); a background/scheduled
  sync trigger is the next step.
- Routine reorder uses accessible up/down buttons (disabled at list ends); no
  drag-and-drop yet.
- Gym profiles can be created/selected (Profile → Gym profiles); exercise notes
  scope to the active gym. Marking a default gym / richer per-gym management is
  still minimal.
- Body metrics (weight + optional body-fat) can be logged from Profile → Body
  metrics; trend charts for body weight are not built yet.
- Charts are lightweight inline sparklines (no external chart dependency).
- Plate calculator assumes a standard barbell + default plate set per unit
  (kg: 20 kg bar; lb: 45 lb bar); custom bars/plates aren't configurable yet.
- E2E: the Maestro smoke flow (`.maestro/smoke.yaml`) is authored but was **not
  executed here** (no emulator/device available); run it on a device to verify.
```
