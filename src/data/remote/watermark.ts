import type { SqlDatabase, SqlValue } from '@/data/local/types';

const EPOCH = '1970-01-01T00:00:00.000Z';

/** Last successfully-pulled `updated_at` for a table (epoch if never pulled). */
export async function getWatermark(db: SqlDatabase, table: string): Promise<string> {
  const row = await db.getFirstAsync<{ last_pulled_at: string }>(
    'SELECT last_pulled_at FROM sync_state WHERE table_name = ?',
    [table],
  );
  return row?.last_pulled_at ?? EPOCH;
}

/** Persist the watermark for a table (monotonic: never moves backwards). */
export async function setWatermark(db: SqlDatabase, table: string, ts: string): Promise<void> {
  const current = await getWatermark(db, table);
  const next = ts > current ? ts : current;
  await db.runAsync(
    `INSERT INTO sync_state (table_name, last_pulled_at) VALUES (?, ?)
     ON CONFLICT(table_name) DO UPDATE SET last_pulled_at = excluded.last_pulled_at`,
    [table as SqlValue, next as SqlValue],
  );
}
