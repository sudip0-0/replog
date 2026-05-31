import { resolveLWW, resolveWorkout, type SyncRecord, type WorkoutRecord } from './conflict';

const rec = (updated_at: string, deleted_at: string | null = null): SyncRecord => ({
  id: 'x',
  updated_at,
  deleted_at,
});

describe('resolveLWW', () => {
  it('keeps the existing side when the other is missing', () => {
    expect(resolveLWW(rec('2024-01-01T00:00:00.000Z'), null)?.updated_at).toBe(
      '2024-01-01T00:00:00.000Z',
    );
    expect(resolveLWW(null, rec('2024-01-02T00:00:00.000Z'))?.updated_at).toBe(
      '2024-01-02T00:00:00.000Z',
    );
    expect(resolveLWW(null, null)).toBeNull();
  });

  it('picks the most recently updated record', () => {
    const local = rec('2024-01-02T00:00:00.000Z');
    const remote = rec('2024-01-01T00:00:00.000Z');
    expect(resolveLWW(local, remote)).toBe(local);
  });

  it('treats a newer tombstone as the winner (propagates deletes)', () => {
    const local = rec('2024-01-01T00:00:00.000Z');
    const remoteDeleted = rec('2024-01-03T00:00:00.000Z', '2024-01-03T00:00:00.000Z');
    expect(resolveLWW(local, remoteDeleted)?.deleted_at).toBe('2024-01-03T00:00:00.000Z');
  });

  it('prefers remote on an exact tie (server authority)', () => {
    const local = rec('2024-01-01T00:00:00.000Z');
    const remote = rec('2024-01-01T00:00:00.000Z');
    expect(resolveLWW(local, remote)).toBe(remote);
  });
});

describe('resolveWorkout', () => {
  const w = (
    updated_at: string,
    status: 'active' | 'completed',
    deleted_at: string | null = null,
  ): WorkoutRecord => ({ id: 'w', updated_at, deleted_at, status, completed_at: null });

  it('never overwrites a completed local workout', () => {
    const local = w('2024-01-01T00:00:00.000Z', 'completed');
    const remote = w('2024-02-01T00:00:00.000Z', 'active');
    expect(resolveWorkout(local, remote)).toBe(local);
  });

  it('uses LWW for active workouts', () => {
    const local = w('2024-01-01T00:00:00.000Z', 'active');
    const remote = w('2024-02-01T00:00:00.000Z', 'active');
    expect(resolveWorkout(local, remote)).toBe(remote);
  });
});
