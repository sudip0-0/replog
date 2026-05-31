import type { ZodType } from 'zod';
import type { RepoDeps, SqlDatabase, SqlValue } from './types';

/** Fields the repository manages automatically. */
export interface SyncableBase {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TableCodec<T extends SyncableBase> {
  table: string;
  schema: ZodType<T>;
  /** All persisted column names (must match the migration). */
  columns: (keyof T & string)[];
  /** Columns stored as INTEGER 0/1. */
  booleans?: (keyof T & string)[];
  /** Columns stored as JSON TEXT. */
  json?: (keyof T & string)[];
}

/** Input for create(): caller supplies everything except managed fields. */
export type CreateInput<T extends SyncableBase> = Omit<
  T,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
> & { id?: string };

export class Repository<T extends SyncableBase> {
  constructor(
    protected db: SqlDatabase,
    protected codec: TableCodec<T>,
    protected deps: RepoDeps,
  ) {}

  private toRow(entity: T): SqlValue[] {
    const bools = new Set(this.codec.booleans ?? []);
    const jsons = new Set(this.codec.json ?? []);
    return this.codec.columns.map((c) => {
      const v = (entity as Record<string, unknown>)[c];
      if (v === undefined || v === null) return null;
      if (bools.has(c)) return v ? 1 : 0;
      if (jsons.has(c)) return JSON.stringify(v);
      return v as SqlValue;
    });
  }

  private fromRow(row: Record<string, SqlValue>): T {
    const bools = new Set(this.codec.booleans ?? []);
    const jsons = new Set(this.codec.json ?? []);
    const obj: Record<string, unknown> = {};
    for (const c of this.codec.columns) {
      const v = row[c];
      if (bools.has(c)) obj[c] = v === 1 || v === '1';
      else if (jsons.has(c)) obj[c] = v == null ? [] : JSON.parse(String(v));
      else obj[c] = v ?? null;
    }
    return this.codec.schema.parse(obj);
  }

  private async enqueue(op: 'upsert' | 'delete', entity: T): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO sync_queue (id, table_name, row_id, op, payload, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [this.deps.id(), this.codec.table, entity.id, op, JSON.stringify(entity), this.deps.now()],
    );
  }

  async create(input: CreateInput<T>): Promise<T> {
    const now = this.deps.now();
    const entity = this.codec.schema.parse({
      ...input,
      id: input.id ?? this.deps.id(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    const cols = this.codec.columns;
    await this.db.runAsync(
      `INSERT INTO ${this.codec.table} (${cols.join(', ')})
       VALUES (${cols.map(() => '?').join(', ')})`,
      this.toRow(entity),
    );
    await this.enqueue('upsert', entity);
    return entity;
  }

  async getById(id: string): Promise<T | null> {
    const row = await this.db.getFirstAsync<Record<string, SqlValue>>(
      `SELECT * FROM ${this.codec.table} WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );
    return row ? this.fromRow(row) : null;
  }

  async list(where = '', params: SqlValue[] = []): Promise<T[]> {
    const clause = where ? `AND ${where}` : '';
    const rows = await this.db.getAllAsync<Record<string, SqlValue>>(
      `SELECT * FROM ${this.codec.table} WHERE deleted_at IS NULL ${clause}`,
      params,
    );
    return rows.map((r) => this.fromRow(r));
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`${this.codec.table} ${id} not found`);
    const updated = this.codec.schema.parse({
      ...existing,
      ...patch,
      id,
      updated_at: this.deps.now(),
    });
    const cols = this.codec.columns.filter((c) => c !== 'id');
    await this.db.runAsync(
      `UPDATE ${this.codec.table} SET ${cols.map((c) => `${c} = ?`).join(', ')} WHERE id = ?`,
      [...this.toRowExcept(updated, 'id'), id],
    );
    await this.enqueue('upsert', updated);
    return updated;
  }

  private toRowExcept(entity: T, omit: string): SqlValue[] {
    const idx = this.codec.columns.indexOf(omit as keyof T & string);
    const row = this.toRow(entity);
    return row.filter((_, i) => i !== idx);
  }

  /** Soft-delete: sets deleted_at and enqueues a tombstone for sync. */
  async softDelete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) return;
    const now = this.deps.now();
    await this.db.runAsync(
      `UPDATE ${this.codec.table} SET deleted_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, id],
    );
    await this.enqueue('delete', { ...existing, deleted_at: now, updated_at: now });
  }

  /**
   * Write a row received from the remote during a pull, WITHOUT enqueuing it
   * back to the sync queue (avoids ping-pong). Upserts by primary key.
   */
  async applyRemote(entity: T): Promise<void> {
    const parsed = this.codec.schema.parse(entity);
    const cols = this.codec.columns;
    await this.db.runAsync(
      `INSERT OR REPLACE INTO ${this.codec.table} (${cols.join(', ')})
       VALUES (${cols.map(() => '?').join(', ')})`,
      this.toRow(parsed),
    );
  }

  /** Read a raw row by id (including soft-deleted) for conflict resolution. */
  async getRaw(id: string): Promise<T | null> {
    const row = await this.db.getFirstAsync<Record<string, SqlValue>>(
      `SELECT * FROM ${this.codec.table} WHERE id = ?`,
      [id],
    );
    return row ? this.fromRow(row) : null;
  }
}
