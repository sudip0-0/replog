/**
 * Pure conflict resolution for sync. Last-write-wins by `updated_at`, with
 * tombstones (deleted_at) treated as ordinary updates, and completed workouts
 * held immutable (never overwritten by a remote change).
 */

export interface SyncRecord {
  id: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Resolve a local/remote pair by most-recent updated_at (remote wins ties). */
export function resolveLWW<T extends SyncRecord>(local: T | null, remote: T | null): T | null {
  if (!local) return remote;
  if (!remote) return local;
  return remote.updated_at >= local.updated_at ? remote : local;
}

export interface WorkoutRecord extends SyncRecord {
  status: 'active' | 'completed';
  completed_at: string | null;
}

/**
 * Workouts are immutable once completed locally: a completed local workout is
 * never overwritten. Otherwise standard LWW applies.
 */
export function resolveWorkout<T extends WorkoutRecord>(local: T | null, remote: T | null): T | null {
  if (local && local.status === 'completed' && !local.deleted_at) return local;
  return resolveLWW(local, remote);
}
