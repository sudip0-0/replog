import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createTestDatabase } from '@/data/local/testDb';
import { runMigrations } from '@/data/local/migrations';
import { buildRepos } from '@/data/local/repos';
import type { RepoDeps, SqlDatabase } from '@/data/local/types';
import { getWatermark, setWatermark } from './watermark';
import { pushChanges, pullChanges } from './sync';

const deps: RepoDeps = { id: () => randomUUID(), now: () => '2024-01-01T00:00:00.000Z' };

async function freshDb(): Promise<SqlDatabase> {
  const db = createTestDatabase();
  await runMigrations(db);
  return db;
}

/** Minimal fake of the Supabase query builder surface used by sync. */
function fakeSupabase(opts: {
  rowsByTable?: Record<string, unknown[]>;
  upsertError?: string;
  selectError?: string;
}): SupabaseClient {
  return {
    from: (table: string) => ({
      upsert: async () => ({ error: opts.upsertError ? { message: opts.upsertError } : null }),
      select: () => ({
        gt: async () => ({
          data: opts.rowsByTable?.[table] ?? [],
          error: opts.selectError ? { message: opts.selectError } : null,
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe('watermark', () => {
  it('defaults to epoch and advances monotonically', async () => {
    const db = await freshDb();
    expect(await getWatermark(db, 'workouts')).toBe('1970-01-01T00:00:00.000Z');
    await setWatermark(db, 'workouts', '2024-05-01T00:00:00.000Z');
    expect(await getWatermark(db, 'workouts')).toBe('2024-05-01T00:00:00.000Z');
    // Older value must not move the watermark backwards.
    await setWatermark(db, 'workouts', '2024-01-01T00:00:00.000Z');
    expect(await getWatermark(db, 'workouts')).toBe('2024-05-01T00:00:00.000Z');
  });
});

describe('pullChanges', () => {
  it('applies remote rows and advances the table watermark', async () => {
    const db = await freshDb();
    const repos = buildRepos(db, deps);
    const routine = {
      id: randomUUID(),
      user_id: 'remote-user',
      name: 'Remote Routine',
      notes: null,
      created_at: '2024-03-01T00:00:00.000Z',
      updated_at: '2024-03-01T00:00:00.000Z',
      deleted_at: null,
    };
    const supabase = fakeSupabase({ rowsByTable: { routines: [routine] } });

    const applied = await pullChanges(db, repos, supabase);
    expect(applied).toBe(1);
    expect((await repos.routines.getById(routine.id))?.name).toBe('Remote Routine');
    expect(await getWatermark(db, 'routines')).toBe('2024-03-01T00:00:00.000Z');
  });

  it('surfaces select errors', async () => {
    const db = await freshDb();
    const repos = buildRepos(db, deps);
    const supabase = fakeSupabase({ selectError: 'network down' });
    await expect(pullChanges(db, repos, supabase)).rejects.toMatchObject({ message: 'network down' });
  });
});

describe('pushChanges', () => {
  it('drains the queue on success and keeps it on error', async () => {
    const db = await freshDb();
    const repos = buildRepos(db, deps);
    await repos.routines.create({ user_id: 'local', name: 'R', notes: null }); // enqueues 1 upsert

    const failing = fakeSupabase({ upsertError: 'denied' });
    await expect(pushChanges(db, failing, 'user-1')).rejects.toMatchObject({ message: 'denied' });
    let queued = await db.getAllAsync('SELECT id FROM sync_queue');
    expect(queued.length).toBeGreaterThan(0); // error keeps the queue intact

    const ok = fakeSupabase({});
    const pushed = await pushChanges(db, ok, 'user-1');
    expect(pushed).toBeGreaterThan(0);
    queued = await db.getAllAsync('SELECT id FROM sync_queue');
    expect(queued).toHaveLength(0);
  });
});
