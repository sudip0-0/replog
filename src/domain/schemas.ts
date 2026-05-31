import { z } from 'zod';

/**
 * Runtime schemas for every persisted entity. These are the single source of
 * truth for types (via z.infer) and are used at all boundaries: SQLite row
 * parsing, form validation, and Supabase DTOs.
 */

// --- Enums ---------------------------------------------------------------
export const MuscleGroup = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core',
  'traps',
  'fullBody',
]);
export type MuscleGroup = z.infer<typeof MuscleGroup>;

export const Equipment = z.enum([
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
  'other',
]);
export type Equipment = z.infer<typeof Equipment>;

export const SetType = z.enum(['warmup', 'normal', 'drop', 'failure']);
export type SetType = z.infer<typeof SetType>;

export const ProgressionRule = z.enum([
  'double_progression',
  'add_reps',
  'add_weight',
  'maintain',
  'deload',
]);
export type ProgressionRule = z.infer<typeof ProgressionRule>;

export const WorkoutStatus = z.enum(['active', 'completed']);
export type WorkoutStatus = z.infer<typeof WorkoutStatus>;

export const PRKind = z.enum(['weight', 'e1rm', 'volume']);
export type PRKind = z.infer<typeof PRKind>;

export const WeightUnitSchema = z.enum(['kg', 'lb']);

// --- Shared fields -------------------------------------------------------
const id = z.uuid();
const ts = z.iso.datetime(); // ISO-8601 UTC string

/** Fields shared by every syncable record. */
const syncable = {
  id,
  user_id: z.string(), // local guest uses 'local'
  created_at: ts,
  updated_at: ts,
  deleted_at: ts.nullable(),
};

// --- Entities ------------------------------------------------------------
export const ProfileSchema = z.object({
  ...syncable,
  display_name: z.string().min(1),
  default_unit: WeightUnitSchema,
});
export type Profile = z.infer<typeof ProfileSchema>;

export const GymProfileSchema = z.object({
  ...syncable,
  name: z.string().min(1),
  is_default: z.boolean(),
});
export type GymProfile = z.infer<typeof GymProfileSchema>;

export const ExerciseSchema = z.object({
  ...syncable,
  user_id: z.string().nullable(), // null = built-in seed exercise
  name: z.string().min(1),
  primary_muscle: MuscleGroup,
  secondary_muscles: z.array(MuscleGroup),
  equipment: Equipment,
  is_custom: z.boolean(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const ExerciseNoteSchema = z.object({
  ...syncable,
  exercise_id: id,
  gym_profile_id: id.nullable(), // null = applies to all gyms
  machine_settings: z.string().nullable(),
  grip: z.string().nullable(),
  stance: z.string().nullable(),
  injury_caution: z.string().nullable(),
  substitutions: z.string().nullable(),
});
export type ExerciseNote = z.infer<typeof ExerciseNoteSchema>;

export const RoutineSchema = z.object({
  ...syncable,
  name: z.string().min(1),
  notes: z.string().nullable(),
});
export type Routine = z.infer<typeof RoutineSchema>;

export const RoutineExerciseSchema = z.object({
  ...syncable,
  routine_id: id,
  exercise_id: id,
  order_index: z.number().int().nonnegative(),
  target_sets: z.number().int().positive(),
  target_reps_min: z.number().int().positive(),
  target_reps_max: z.number().int().positive(),
  target_rest_sec: z.number().int().nonnegative(),
  progression_rule: ProgressionRule,
});
export type RoutineExercise = z.infer<typeof RoutineExerciseSchema>;

export const WorkoutSchema = z.object({
  ...syncable,
  routine_id: id.nullable(),
  name: z.string().min(1),
  status: WorkoutStatus,
  started_at: ts,
  completed_at: ts.nullable(),
  notes: z.string().nullable(),
});
export type Workout = z.infer<typeof WorkoutSchema>;

export const WorkoutExerciseSchema = z.object({
  ...syncable,
  workout_id: id,
  exercise_id: id,
  order_index: z.number().int().nonnegative(),
  note: z.string().nullable(),
});
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;

export const SetSchema = z.object({
  ...syncable,
  workout_exercise_id: id,
  set_index: z.number().int().nonnegative(),
  set_type: SetType,
  weight_kg: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
  rpe: z.number().min(1).max(10).nullable(),
  completed: z.boolean(),
  note: z.string().nullable(),
});
export type SetRecord = z.infer<typeof SetSchema>;

export const PersonalRecordSchema = z.object({
  ...syncable,
  exercise_id: id,
  workout_id: id,
  kind: PRKind,
  value: z.number(), // e1rm/volume in kg; weight in kg
  reps: z.number().int().nullable(),
  weight_kg: z.number().nullable(),
  achieved_at: ts,
});
export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;

export const BodyMetricSchema = z.object({
  ...syncable,
  date: z.iso.date(),
  weight_kg: z.number().positive(),
  body_fat_pct: z.number().min(0).max(100).nullable(),
});
export type BodyMetric = z.infer<typeof BodyMetricSchema>;

export const SyncOp = z.enum(['upsert', 'delete']);
export type SyncOp = z.infer<typeof SyncOp>;

export const SyncQueueItemSchema = z.object({
  id,
  table_name: z.string(),
  row_id: id,
  op: SyncOp,
  payload: z.string(), // JSON-encoded row
  created_at: ts,
});
export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;
