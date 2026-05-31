import Database from 'better-sqlite3';
import type { SqlDatabase, SqlValue } from './types';

/**
 * Test-only adapter exposing better-sqlite3 through the async SqlDatabase
 * interface. PRAGMA user_version is read/written via dedicated paths since it
 * can't be parameterized.
 */
export function createTestDatabase(): SqlDatabase {
  const db = new Database(':memory:');
  return {
    async execAsync(sql: string) {
      db.exec(sql);
    },
    async runAsync(sql: string, params: SqlValue[] = []) {
      const info = db.prepare(sql).run(...params);
      return { changes: info.changes };
    },
    async getFirstAsync<T>(sql: string, params: SqlValue[] = []) {
      return (db.prepare(sql).get(...params) as T) ?? null;
    },
    async getAllAsync<T>(sql: string, params: SqlValue[] = []) {
      return db.prepare(sql).all(...params) as T[];
    },
  };
}
