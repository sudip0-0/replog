import { randomUUID } from 'node:crypto';
import { createTestDatabase } from './testDb';
import { runMigrations, MIGRATIONS } from './migrations';
import { Repository } from './repository';
import { codecs, ExerciseRepository } from './repositories';
import { seedExercises } from '@/data/seed/seedExercises';
import type { RepoDeps, SqlDatabase } from './types';
import type { Routine } from '@/domain/schemas';

const NOW = '2024-01-01T00:00:00.000Z';
const deps: RepoDeps = { id: () => randomUUID(), now: () => NOW };

async function freshDb(): Promise<SqlDatabase> {
  const db = createTestDatabase();
  await runMigrations(db);
  return db;
}

describe('migrations', () => {
  it('bring user_version up to the migration count', async () => {
    const db = await freshDb();
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(row?.user_version).toBe(MIGRATIONS.length);
  });

  it('are idempotent across repeated runs', async () => {
    const db = await freshDb();
    await expect(runMigrations(db)).resolves.toBeUndefined();
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(row?.user_version).toBe(MIGRATIONS.length);
  });
});

describe('Repository CRUD', () => {
  it('round-trips create/read/update/soft-delete and tracks sync', async () => {
    const db = await freshDb();
    const repo = new Repository<Routine>(db, codecs.routines, deps);

    const created = await repo.create({ user_id: 'local', name: 'PPL', notes: null });
    expect(created.id).toBeDefined();
    expect(await repo.getById(created.id)).toMatchObject({ name: 'PPL' });

    const updated = await repo.update(created.id, { name: 'Push Pull Legs' });
    expect(updated.name).toBe('Push Pull Legs');

    await repo.softDelete(created.id);
    expect(await repo.getById(created.id)).toBeNull();
    expect(await repo.list()).toHaveLength(0);

    // sync_queue captured create (upsert), update (upsert) and delete.
    const q = await db.getAllAsync<{ op: string }>('SELECT op FROM sync_queue ORDER BY rowid');
    expect(q.map((r) => r.op)).toEqual(['upsert', 'upsert', 'delete']);
  });
});

describe('exercise seed + search', () => {
  it('seeds the library once and searches by name/muscle', async () => {
    const db = await freshDb();
    const inserted = await seedExercises(db, NOW);
    expect(inserted).toBeGreaterThanOrEqual(50);

    // Idempotent: second run inserts nothing.
    expect(await seedExercises(db, NOW)).toBe(0);

    const repo = new ExerciseRepository(db, deps);
    const bench = await repo.search('bench');
    expect(bench.some((e) => e.name === 'Barbell Bench Press')).toBe(true);

    const back = await repo.search('back');
    expect(back.length).toBeGreaterThan(0);
    expect(back.every((e) => e.primary_muscle === 'back' || /back/i.test(e.name))).toBe(true);

    // Seed rows are built-in (user_id null) and parse cleanly.
    expect(bench[0]?.user_id).toBeNull();
  });
});
