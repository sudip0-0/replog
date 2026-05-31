import type { SqlDatabase } from './types';

/**
 * Ordered list of migrations. Each entry's index+1 is its target user_version.
 * Booleans are stored as INTEGER (0/1); arrays as JSON TEXT; timestamps as ISO
 * TEXT. Every syncable table carries id/user_id/created_at/updated_at/deleted_at.
 */
export const MIGRATIONS: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE profiles (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    display_name TEXT NOT NULL, default_unit TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE gym_profiles (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    name TEXT NOT NULL, is_default INTEGER NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE exercises (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT,
    name TEXT NOT NULL, primary_muscle TEXT NOT NULL,
    secondary_muscles TEXT NOT NULL, equipment TEXT NOT NULL,
    is_custom INTEGER NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_exercises_name ON exercises(name);
  CREATE INDEX idx_exercises_muscle ON exercises(primary_muscle);

  CREATE TABLE exercise_notes (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL, gym_profile_id TEXT,
    machine_settings TEXT, grip TEXT, stance TEXT,
    injury_caution TEXT, substitutions TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_notes_exercise ON exercise_notes(exercise_id);

  CREATE TABLE routines (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    name TEXT NOT NULL, notes TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE routine_exercises (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    routine_id TEXT NOT NULL, exercise_id TEXT NOT NULL,
    order_index INTEGER NOT NULL, target_sets INTEGER NOT NULL,
    target_reps_min INTEGER NOT NULL, target_reps_max INTEGER NOT NULL,
    target_rest_sec INTEGER NOT NULL, progression_rule TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_routine_ex_routine ON routine_exercises(routine_id);

  CREATE TABLE workouts (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    routine_id TEXT, name TEXT NOT NULL, status TEXT NOT NULL,
    started_at TEXT NOT NULL, completed_at TEXT, notes TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_workouts_status ON workouts(status);

  CREATE TABLE workout_exercises (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    workout_id TEXT NOT NULL, exercise_id TEXT NOT NULL,
    order_index INTEGER NOT NULL, note TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_workout_ex_workout ON workout_exercises(workout_id);

  CREATE TABLE sets (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    workout_exercise_id TEXT NOT NULL, set_index INTEGER NOT NULL,
    set_type TEXT NOT NULL, weight_kg REAL NOT NULL, reps INTEGER NOT NULL,
    rpe REAL, completed INTEGER NOT NULL, note TEXT,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_sets_we ON sets(workout_exercise_id);

  CREATE TABLE personal_records (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL, workout_id TEXT NOT NULL,
    kind TEXT NOT NULL, value REAL NOT NULL, reps INTEGER, weight_kg REAL,
    achieved_at TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );
  CREATE INDEX idx_pr_exercise ON personal_records(exercise_id);

  CREATE TABLE body_metrics (
    id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL,
    date TEXT NOT NULL, weight_kg REAL NOT NULL, body_fat_pct REAL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  );

  CREATE TABLE sync_queue (
    id TEXT PRIMARY KEY NOT NULL, table_name TEXT NOT NULL,
    row_id TEXT NOT NULL, op TEXT NOT NULL, payload TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  `,
  // v2 — persisted per-table pull watermarks (replaces caller-provided `since`).
  `
  CREATE TABLE sync_state (
    table_name TEXT PRIMARY KEY NOT NULL,
    last_pulled_at TEXT NOT NULL
  );
  `,
];

/** Apply any pending migrations. Idempotent: safe to call on every launch. */
export async function runMigrations(db: SqlDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    await db.execAsync(MIGRATIONS[v] as string);
    // user_version can't be parameterized; v+1 is an integer we control.
    await db.execAsync(`PRAGMA user_version = ${v + 1}`);
  }
}
