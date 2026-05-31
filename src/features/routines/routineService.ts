import type { Repos } from '@/data/local/repos';
import type { Exercise, Routine, RoutineExercise, Workout } from '@/domain/schemas';
import { assertNoActiveWorkout, LOCAL_USER } from '@/features/workouts/workoutService';
import { STARTER_TEMPLATES } from './templates';

export interface RoutineExerciseDetail {
  routineExercise: RoutineExercise;
  exercise: Exercise | null;
}

export interface RoutineDetail {
  routine: Routine;
  exercises: RoutineExerciseDetail[];
}

export function listRoutines(repos: Repos): Promise<Routine[]> {
  return repos.routines.list('1=1 ORDER BY name');
}

export function createRoutine(repos: Repos, name: string, notes: string | null = null) {
  return repos.routines.create({ user_id: LOCAL_USER, name, notes });
}

export async function getRoutineDetail(repos: Repos, routineId: string): Promise<RoutineDetail | null> {
  const routine = await repos.routines.getById(routineId);
  if (!routine) return null;
  const res = await repos.routineExercises.list('routine_id = ? ORDER BY order_index', [routineId]);
  const exercises: RoutineExerciseDetail[] = [];
  for (const re of res) {
    exercises.push({ routineExercise: re, exercise: await repos.exercises.getById(re.exercise_id) });
  }
  return { routine, exercises };
}

export async function addExerciseToRoutine(
  repos: Repos,
  routineId: string,
  exerciseId: string,
  opts: Partial<Omit<RoutineExercise, 'id' | 'routine_id' | 'exercise_id' | 'order_index'>> = {},
): Promise<RoutineExercise> {
  const existing = await repos.routineExercises.list('routine_id = ?', [routineId]);
  return repos.routineExercises.create({
    user_id: LOCAL_USER,
    routine_id: routineId,
    exercise_id: exerciseId,
    order_index: existing.length,
    target_sets: opts.target_sets ?? 3,
    target_reps_min: opts.target_reps_min ?? 8,
    target_reps_max: opts.target_reps_max ?? 12,
    target_rest_sec: opts.target_rest_sec ?? 120,
    progression_rule: opts.progression_rule ?? 'double_progression',
  });
}

/** Persist a new explicit ordering of a routine's exercises. */
export async function reorderRoutineExercises(repos: Repos, orderedIds: string[]): Promise<void> {
  for (let i = 0; i < orderedIds.length; i++) {
    await repos.routineExercises.update(orderedIds[i] as string, { order_index: i });
  }
}

/** Edit a routine exercise's targets (sets, rep range, rest, progression rule). */
export function updateRoutineExercise(
  repos: Repos,
  id: string,
  patch: Partial<
    Pick<
      RoutineExercise,
      'target_sets' | 'target_reps_min' | 'target_reps_max' | 'target_rest_sec' | 'progression_rule'
    >
  >,
): Promise<RoutineExercise> {
  return repos.routineExercises.update(id, patch);
}

/** Remove an exercise from a routine (soft delete). */
export function removeRoutineExercise(repos: Repos, id: string): Promise<void> {
  return repos.routineExercises.softDelete(id);
}

/** Deep-copy a routine and all its exercises into a brand-new routine. */
export async function duplicateRoutine(repos: Repos, routineId: string): Promise<Routine> {
  const detail = await getRoutineDetail(repos, routineId);
  if (!detail) throw new Error('Routine not found');
  const copy = await createRoutine(repos, `${detail.routine.name} (copy)`, detail.routine.notes);
  for (const { routineExercise: re } of detail.exercises) {
    await repos.routineExercises.create({
      user_id: LOCAL_USER,
      routine_id: copy.id,
      exercise_id: re.exercise_id,
      order_index: re.order_index,
      target_sets: re.target_sets,
      target_reps_min: re.target_reps_min,
      target_reps_max: re.target_reps_max,
      target_rest_sec: re.target_rest_sec,
      progression_rule: re.progression_rule,
    });
  }
  return copy;
}

export function deleteRoutine(repos: Repos, routineId: string): Promise<void> {
  return repos.routines.softDelete(routineId);
}

/** Install starter templates (skips ones already present by name). */
export async function installStarterTemplates(repos: Repos): Promise<number> {
  const existing = new Set((await listRoutines(repos)).map((r) => r.name));
  let created = 0;
  for (const tpl of STARTER_TEMPLATES) {
    if (existing.has(tpl.name)) continue;
    const routine = await createRoutine(repos, tpl.name);
    let order = 0;
    for (const te of tpl.exercises) {
      const [ex] = await repos.exercises.search(te.name);
      if (!ex) continue;
      await repos.routineExercises.create({
        user_id: LOCAL_USER,
        routine_id: routine.id,
        exercise_id: ex.id,
        order_index: order++,
        target_sets: te.sets,
        target_reps_min: te.repsMin,
        target_reps_max: te.repsMax,
        target_rest_sec: te.restSec,
        progression_rule: te.rule,
      });
    }
    created++;
  }
  return created;
}

/**
 * Start a workout from a routine: copies routine exercises into the workout and
 * pre-creates the target number of empty sets. Does NOT mutate the routine.
 */
export async function startWorkoutFromRoutine(repos: Repos, routineId: string): Promise<Workout> {
  const detail = await getRoutineDetail(repos, routineId);
  if (!detail) throw new Error('Routine not found');
  await assertNoActiveWorkout(repos);
  const now = new Date().toISOString();
  const workout = await repos.workouts.create({
    user_id: LOCAL_USER,
    routine_id: routineId,
    name: detail.routine.name,
    status: 'active',
    started_at: now,
    completed_at: null,
    notes: null,
  });
  for (const { routineExercise: re } of detail.exercises) {
    const we = await repos.workoutExercises.create({
      user_id: LOCAL_USER,
      workout_id: workout.id,
      exercise_id: re.exercise_id,
      order_index: re.order_index,
      note: null,
    });
    for (let i = 0; i < re.target_sets; i++) {
      await repos.sets.create({
        user_id: LOCAL_USER,
        workout_exercise_id: we.id,
        set_index: i,
        set_type: 'normal',
        weight_kg: 0,
        reps: 0,
        rpe: null,
        completed: false,
        note: null,
      });
    }
  }
  return workout;
}
