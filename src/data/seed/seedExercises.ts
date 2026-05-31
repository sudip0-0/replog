import { ExerciseSchema, type Exercise } from '@/domain/schemas';
import type { SqlDatabase } from '@/data/local/types';
import { uuidFromString } from '@/data/local/ids';
import raw from './exercises.json';

interface SeedExercise {
  name: string;
  primary_muscle: string;
  secondary_muscles: string[];
  equipment: string;
}

/** Build the full seed entities (deterministic IDs, user_id null = built-in). */
export function buildSeedExercises(now: string): Exercise[] {
  return (raw as SeedExercise[]).map((e) =>
    ExerciseSchema.parse({
      id: uuidFromString(`seed:${e.name}`),
      user_id: null,
      name: e.name,
      primary_muscle: e.primary_muscle,
      secondary_muscles: e.secondary_muscles,
      equipment: e.equipment,
      is_custom: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    }),
  );
}

/** Insert seed exercises if the table is empty. Idempotent. */
export async function seedExercises(db: SqlDatabase, now: string): Promise<number> {
  const count = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM exercises');
  if ((count?.n ?? 0) > 0) return 0;
  const seeds = buildSeedExercises(now);
  for (const e of seeds) {
    await db.runAsync(
      `INSERT INTO exercises
       (id, user_id, name, primary_muscle, secondary_muscles, equipment, is_custom, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id,
        e.user_id,
        e.name,
        e.primary_muscle,
        JSON.stringify(e.secondary_muscles),
        e.equipment,
        e.is_custom ? 1 : 0,
        e.created_at,
        e.updated_at,
        e.deleted_at,
      ],
    );
  }
  return seeds.length;
}
