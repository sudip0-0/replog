import type { Repos } from '@/data/local/repos';
import type {
  Exercise,
  SetRecord,
  SetType,
  Workout,
  WorkoutExercise,
} from '@/domain/schemas';
import type { CompletedSet } from '@/domain/workoutMath';
import { detectPRs } from '@/domain/pr';

export const LOCAL_USER = 'local';

export interface SetInput {
  set_type?: SetType;
  weight_kg?: number;
  reps?: number;
  rpe?: number | null;
  note?: string | null;
  completed?: boolean;
}

export interface WorkoutExerciseDetail {
  workoutExercise: WorkoutExercise;
  exercise: Exercise | null;
  sets: SetRecord[];
}

export interface WorkoutDetail {
  workout: Workout;
  exercises: WorkoutExerciseDetail[];
}

/** The single in-progress workout, if any. */
export async function getActiveWorkout(repos: Repos): Promise<Workout | null> {
  const rows = await repos.workouts.list("status = 'active' ORDER BY started_at DESC LIMIT 1");
  return rows[0] ?? null;
}

/** Thrown when an action would create a second concurrent active workout. */
export class ActiveWorkoutExistsError extends Error {
  constructor(public activeId: string) {
    super('A workout is already in progress');
    this.name = 'ActiveWorkoutExistsError';
  }
}

/** Guard against accidentally creating multiple active workouts. */
export async function assertNoActiveWorkout(repos: Repos): Promise<void> {
  const active = await getActiveWorkout(repos);
  if (active) throw new ActiveWorkoutExistsError(active.id);
}

/** Discard (soft-delete) the current active workout, if any. Used by "replace". */
export async function discardActiveWorkout(repos: Repos): Promise<void> {
  const active = await getActiveWorkout(repos);
  if (active) await repos.workouts.softDelete(active.id);
}

export async function startEmptyWorkout(repos: Repos, name = 'Workout'): Promise<Workout> {
  await assertNoActiveWorkout(repos);
  const now = new Date().toISOString();
  return repos.workouts.create({
    user_id: LOCAL_USER,
    routine_id: null,
    name,
    status: 'active',
    started_at: now,
    completed_at: null,
    notes: null,
  });
}

export async function addExercise(
  repos: Repos,
  workoutId: string,
  exerciseId: string,
): Promise<WorkoutExercise> {
  const existing = await repos.workoutExercises.list('workout_id = ?', [workoutId]);
  return repos.workoutExercises.create({
    user_id: LOCAL_USER,
    workout_id: workoutId,
    exercise_id: exerciseId,
    order_index: existing.length,
    note: null,
  });
}

export async function addSet(
  repos: Repos,
  workoutExerciseId: string,
  input: SetInput = {},
): Promise<SetRecord> {
  const existing = await repos.sets.list('workout_exercise_id = ?', [workoutExerciseId]);
  return repos.sets.create({
    user_id: LOCAL_USER,
    workout_exercise_id: workoutExerciseId,
    set_index: existing.length,
    set_type: input.set_type ?? 'normal',
    weight_kg: input.weight_kg ?? 0,
    reps: input.reps ?? 0,
    rpe: input.rpe ?? null,
    completed: input.completed ?? false,
    note: input.note ?? null,
  });
}

export function updateSet(repos: Repos, id: string, patch: Partial<SetRecord>): Promise<SetRecord> {
  return repos.sets.update(id, patch);
}

export async function removeSet(repos: Repos, id: string): Promise<void> {
  const set = await repos.sets.getById(id);
  await repos.sets.softDelete(id);
  if (!set) return;
  // Keep set_index contiguous for the remaining sets.
  const remaining = await repos.sets.list('workout_exercise_id = ? ORDER BY set_index', [
    set.workout_exercise_id,
  ]);
  for (let i = 0; i < remaining.length; i++) {
    if (remaining[i]!.set_index !== i) await repos.sets.update(remaining[i]!.id, { set_index: i });
  }
}

/** Mark a workout completed. Historical data becomes immutable afterwards. */
export async function finishWorkout(repos: Repos, workoutId: string): Promise<Workout> {
  const workout = await repos.workouts.update(workoutId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
  await detectAndPersistPRs(repos, workout);
  return workout;
}

/** Compare each exercise's session to prior history and store any new PRs. */
async function detectAndPersistPRs(repos: Repos, workout: Workout): Promise<void> {
  const achievedAt = workout.completed_at ?? new Date().toISOString();
  const wexs = await repos.workoutExercises.list('workout_id = ?', [workout.id]);
  for (const we of wexs) {
    const current = (await repos.sets.list('workout_exercise_id = ? AND completed = 1', [we.id])).map(
      (s) => ({ weightKg: s.weight_kg, reps: s.reps, setType: s.set_type }),
    );
    if (current.length === 0) continue;
    const previous = await repos.workouts.list(
      "status = 'completed' AND id != ? ORDER BY completed_at DESC",
      [workout.id],
    );
    const history: CompletedSet[][] = [];
    for (const w of previous) {
      const pastWexs = await repos.workoutExercises.list(
        'workout_id = ? AND exercise_id = ?',
        [w.id, we.exercise_id],
      );
      const sets: CompletedSet[] = [];
      for (const pw of pastWexs) {
        const rows = await repos.sets.list('workout_exercise_id = ? AND completed = 1', [pw.id]);
        for (const s of rows) sets.push({ weightKg: s.weight_kg, reps: s.reps, setType: s.set_type });
      }
      if (sets.length > 0) history.push(sets);
    }
    for (const pr of detectPRs(history, current)) {
      await repos.personalRecords.create({
        user_id: LOCAL_USER,
        exercise_id: we.exercise_id,
        workout_id: workout.id,
        kind: pr.kind,
        value: pr.value,
        reps: pr.reps,
        weight_kg: pr.weightKg,
        achieved_at: achievedAt,
      });
    }
  }
}

/** Full active-workout tree, ordered, for rendering and rehydration. */
export async function getWorkoutDetail(repos: Repos, workoutId: string): Promise<WorkoutDetail | null> {
  const workout = await repos.workouts.getById(workoutId);
  if (!workout) return null;
  const wexs = (await repos.workoutExercises.list('workout_id = ? ORDER BY order_index', [workoutId]));
  const exercises: WorkoutExerciseDetail[] = [];
  for (const we of wexs) {
    const sets = await repos.sets.list('workout_exercise_id = ? ORDER BY set_index', [we.id]);
    exercises.push({
      workoutExercise: we,
      exercise: await repos.exercises.getById(we.exercise_id),
      sets,
    });
  }
  return { workout, exercises };
}

/**
 * Working sets from the most recent completed workout that included this
 * exercise (before `excludeWorkoutId`). Used for inline "previous" display and
 * progression suggestions.
 */
export async function getPreviousPerformance(
  repos: Repos,
  exerciseId: string,
  excludeWorkoutId?: string,
): Promise<{ workout: Workout; sets: CompletedSet[] } | null> {
  const completed = await repos.workouts.list("status = 'completed' ORDER BY completed_at DESC");
  for (const workout of completed) {
    if (workout.id === excludeWorkoutId) continue;
    const wexs = await repos.workoutExercises.list('workout_id = ? AND exercise_id = ?', [
      workout.id,
      exerciseId,
    ]);
    if (wexs.length === 0) continue;
    const sets: CompletedSet[] = [];
    for (const we of wexs) {
      const rows = await repos.sets.list('workout_exercise_id = ? AND completed = 1', [we.id]);
      for (const s of rows) sets.push({ weightKg: s.weight_kg, reps: s.reps, setType: s.set_type });
    }
    if (sets.length > 0) return { workout, sets };
  }
  return null;
}
