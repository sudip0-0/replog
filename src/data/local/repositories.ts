import {
  BodyMetricSchema,
  ExerciseNoteSchema,
  ExerciseSchema,
  GymProfileSchema,
  PersonalRecordSchema,
  ProfileSchema,
  RoutineExerciseSchema,
  RoutineSchema,
  SetSchema,
  WorkoutExerciseSchema,
  WorkoutSchema,
  type Exercise,
} from '@/domain/schemas';
import { Repository, type TableCodec } from './repository';
import type { RepoDeps, SqlDatabase } from './types';

const SYNC = ['id', 'user_id', 'created_at', 'updated_at', 'deleted_at'] as const;

export const codecs = {
  profiles: {
    table: 'profiles',
    schema: ProfileSchema,
    columns: ['id', 'user_id', 'display_name', 'default_unit', ...SYNC.slice(2)],
  } as TableCodec<import('@/domain/schemas').Profile>,
  gym_profiles: {
    table: 'gym_profiles',
    schema: GymProfileSchema,
    columns: ['id', 'user_id', 'name', 'is_default', ...SYNC.slice(2)],
    booleans: ['is_default'],
  } as TableCodec<import('@/domain/schemas').GymProfile>,
  exercises: {
    table: 'exercises',
    schema: ExerciseSchema,
    columns: [
      'id',
      'user_id',
      'name',
      'primary_muscle',
      'secondary_muscles',
      'equipment',
      'is_custom',
      ...SYNC.slice(2),
    ],
    booleans: ['is_custom'],
    json: ['secondary_muscles'],
  } as TableCodec<Exercise>,
  exercise_notes: {
    table: 'exercise_notes',
    schema: ExerciseNoteSchema,
    columns: [
      'id',
      'user_id',
      'exercise_id',
      'gym_profile_id',
      'machine_settings',
      'grip',
      'stance',
      'injury_caution',
      'substitutions',
      ...SYNC.slice(2),
    ],
  } as TableCodec<import('@/domain/schemas').ExerciseNote>,
  routines: {
    table: 'routines',
    schema: RoutineSchema,
    columns: ['id', 'user_id', 'name', 'notes', ...SYNC.slice(2)],
  } as TableCodec<import('@/domain/schemas').Routine>,
  routine_exercises: {
    table: 'routine_exercises',
    schema: RoutineExerciseSchema,
    columns: [
      'id',
      'user_id',
      'routine_id',
      'exercise_id',
      'order_index',
      'target_sets',
      'target_reps_min',
      'target_reps_max',
      'target_rest_sec',
      'progression_rule',
      ...SYNC.slice(2),
    ],
  } as TableCodec<import('@/domain/schemas').RoutineExercise>,
  workouts: {
    table: 'workouts',
    schema: WorkoutSchema,
    columns: [
      'id',
      'user_id',
      'routine_id',
      'name',
      'status',
      'started_at',
      'completed_at',
      'notes',
      ...SYNC.slice(2),
    ],
  } as TableCodec<import('@/domain/schemas').Workout>,
  workout_exercises: {
    table: 'workout_exercises',
    schema: WorkoutExerciseSchema,
    columns: ['id', 'user_id', 'workout_id', 'exercise_id', 'order_index', 'note', ...SYNC.slice(2)],
  } as TableCodec<import('@/domain/schemas').WorkoutExercise>,
  sets: {
    table: 'sets',
    schema: SetSchema,
    columns: [
      'id',
      'user_id',
      'workout_exercise_id',
      'set_index',
      'set_type',
      'weight_kg',
      'reps',
      'rpe',
      'completed',
      'note',
      ...SYNC.slice(2),
    ],
    booleans: ['completed'],
  } as TableCodec<import('@/domain/schemas').SetRecord>,
  personal_records: {
    table: 'personal_records',
    schema: PersonalRecordSchema,
    columns: [
      'id',
      'user_id',
      'exercise_id',
      'workout_id',
      'kind',
      'value',
      'reps',
      'weight_kg',
      'achieved_at',
      ...SYNC.slice(2),
    ],
  } as TableCodec<import('@/domain/schemas').PersonalRecord>,
  body_metrics: {
    table: 'body_metrics',
    schema: BodyMetricSchema,
    columns: ['id', 'user_id', 'date', 'weight_kg', 'body_fat_pct', ...SYNC.slice(2)],
  } as TableCodec<import('@/domain/schemas').BodyMetric>,
};

/** Exercise repository with name/muscle search over the seeded library. */
export class ExerciseRepository extends Repository<Exercise> {
  constructor(db: SqlDatabase, deps: RepoDeps) {
    super(db, codecs.exercises, deps);
  }

  search(query: string, limit = 50): Promise<Exercise[]> {
    const q = `%${query.toLowerCase()}%`;
    return this.list(
      '(LOWER(name) LIKE ? OR LOWER(primary_muscle) LIKE ?) ORDER BY name LIMIT ?',
      [q, q, limit],
    );
  }
}
