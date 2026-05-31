import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { runMigrations } from './migrations';
import { seedExercises } from '@/data/seed/seedExercises';
import type { RepoDeps, SqlDatabase } from './types';

let dbPromise: Promise<SqlDatabase> | null = null;

/** Runtime repository dependencies: real UUIDs + wall clock. */
export const repoDeps: RepoDeps = {
  id: () => Crypto.randomUUID(),
  now: () => new Date().toISOString(),
};

/** Open (once) and initialize the local database: migrations + seed. */
export function getDatabase(): Promise<SqlDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = (await SQLite.openDatabaseAsync('replog.db')) as unknown as SqlDatabase;
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      await seedExercises(db, repoDeps.now());
      return db;
    })();
  }
  return dbPromise;
}
