import type { SupabaseClient } from '@supabase/supabase-js';
import type { Repos } from '@/data/local/repos';
import type { Repository, SyncableBase } from '@/data/local/repository';
import type { SqlDatabase, SqlValue } from '@/data/local/types';
import { resolveLWW, resolveWorkout, type WorkoutRecord } from './conflict';
import { getWatermark, setWatermark } from './watermark';

/** Tables synced, paired with their repository. Order respects FK-ish deps. */
function syncTables(repos: Repos): { name: string; repo: Repository<SyncableBase> }[] {
  return [
    { name: 'profiles', repo: repos.profiles as unknown as Repository<SyncableBase> },
    { name: 'gym_profiles', repo: repos.gymProfiles as unknown as Repository<SyncableBase> },
    { name: 'exercises', repo: repos.exercises as unknown as Repository<SyncableBase> },
    { name: 'exercise_notes', repo: repos.exerciseNotes as unknown as Repository<SyncableBase> },
    { name: 'routines', repo: repos.routines as unknown as Repository<SyncableBase> },
    { name: 'routine_exercises', repo: repos.routineExercises as unknown as Repository<SyncableBase> },
    { name: 'workouts', repo: repos.workouts as unknown as Repository<SyncableBase> },
    { name: 'workout_exercises', repo: repos.workoutExercises as unknown as Repository<SyncableBase> },
    { name: 'sets', repo: repos.sets as unknown as Repository<SyncableBase> },
    { name: 'personal_records', repo: repos.personalRecords as unknown as Repository<SyncableBase> },
    { name: 'body_metrics', repo: repos.bodyMetrics as unknown as Repository<SyncableBase> },
  ];
}

interface QueueRow {
  id: string;
  table_name: string;
  payload: string;
}

/**
 * Push local changes to Supabase by draining the sync_queue. Each payload is
 * upserted under the authenticated user_id (deletes carry deleted_at).
 */
export async function pushChanges(
  db: SqlDatabase,
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const rows = await db.getAllAsync<QueueRow>('SELECT * FROM sync_queue ORDER BY created_at');
  let pushed = 0;
  for (const row of rows) {
    const payload = { ...JSON.parse(row.payload), user_id: userId };
    const { error } = await supabase.from(row.table_name).upsert(payload);
    if (error) throw error;
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [row.id as SqlValue]);
    pushed++;
  }
  return pushed;
}

/**
 * Pull remote rows updated since each table's persisted watermark and merge
 * into SQLite using the conflict resolver (workouts stay immutable once
 * completed locally). Advances each table's watermark as it succeeds.
 */
export async function pullChanges(
  db: SqlDatabase,
  repos: Repos,
  supabase: SupabaseClient,
): Promise<number> {
  let applied = 0;
  for (const { name, repo } of syncTables(repos)) {
    const since = await getWatermark(db, name);
    const { data, error } = await supabase.from(name).select('*').gt('updated_at', since);
    if (error) throw error;
    let maxSeen = since;
    for (const remote of (data ?? []) as SyncableBase[]) {
      const local = await repo.getRaw(remote.id);
      const winner =
        name === 'workouts'
          ? resolveWorkout(local as WorkoutRecord | null, remote as unknown as WorkoutRecord)
          : resolveLWW(local, remote);
      if (winner && winner !== local) {
        await repo.applyRemote(winner as SyncableBase);
        applied++;
      }
      if (remote.updated_at > maxSeen) maxSeen = remote.updated_at;
    }
    await setWatermark(db, name, maxSeen);
  }
  return applied;
}

/** Full bidirectional sync. No-op friendly: callers gate on auth + config. */
export async function syncAll(
  db: SqlDatabase,
  repos: Repos,
  supabase: SupabaseClient,
  userId: string,
): Promise<{ pushed: number; pulled: number }> {
  const pushed = await pushChanges(db, supabase, userId);
  const pulled = await pullChanges(db, repos, supabase);
  return { pushed, pulled };
}
