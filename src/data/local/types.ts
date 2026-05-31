/** Positional SQL parameter values. */
export type SqlValue = string | number | null;

/**
 * Minimal async database surface used by repositories. Mirrors the subset of
 * expo-sqlite's SQLiteDatabase API we rely on, so the production driver and the
 * test (better-sqlite3) driver are interchangeable.
 */
export interface SqlDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlValue[]): Promise<{ changes: number }>;
  getFirstAsync<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  getAllAsync<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
}

/** Dependencies injected into repositories for deterministic testing. */
export interface RepoDeps {
  id: () => string;
  now: () => string;
}
