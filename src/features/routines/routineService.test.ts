import { randomUUID } from 'node:crypto';
import { createTestDatabase } from '@/data/local/testDb';
import { runMigrations } from '@/data/local/migrations';
import { buildRepos, type Repos } from '@/data/local/repos';
import { seedExercises } from '@/data/seed/seedExercises';
import type { RepoDeps } from '@/data/local/types';
import {
  addExerciseToRoutine,
  createRoutine,
  duplicateRoutine,
  getRoutineDetail,
  installStarterTemplates,
  removeRoutineExercise,
  reorderRoutineExercises,
  startWorkoutFromRoutine,
  updateRoutineExercise,
} from './routineService';
import { ActiveWorkoutExistsError, finishWorkout } from '@/features/workouts/workoutService';
import { getExerciseNote, upsertExerciseNote } from '@/features/exercises/noteService';

const deps: RepoDeps = { id: () => randomUUID(), now: () => new Date().toISOString() };

async function setup(): Promise<{ repos: Repos; exIds: string[] }> {
  const db = createTestDatabase();
  await runMigrations(db);
  await seedExercises(db, deps.now());
  const repos = buildRepos(db, deps);
  const squat = (await repos.exercises.search('Back Squat'))[0]!;
  const bench = (await repos.exercises.search('Barbell Bench Press'))[0]!;
  return { repos, exIds: [squat.id, bench.id] };
}

describe('routineService', () => {
  it('duplicates a routine with all its exercises and new ids', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'PPL');
    await addExerciseToRoutine(repos, routine.id, exIds[0]!);
    await addExerciseToRoutine(repos, routine.id, exIds[1]!);

    const copy = await duplicateRoutine(repos, routine.id);
    expect(copy.id).not.toBe(routine.id);
    const detail = await getRoutineDetail(repos, copy.id);
    expect(detail?.exercises).toHaveLength(2);
    expect(detail?.routine.name).toBe('PPL (copy)');
  });

  it('reorders exercises by order_index', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'R');
    const a = await addExerciseToRoutine(repos, routine.id, exIds[0]!);
    const b = await addExerciseToRoutine(repos, routine.id, exIds[1]!);

    await reorderRoutineExercises(repos, [b.id, a.id]);
    const detail = await getRoutineDetail(repos, routine.id);
    expect(detail?.exercises.map((e) => e.routineExercise.id)).toEqual([b.id, a.id]);
  });

  it('edits targets and removes exercises', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'R');
    const a = await addExerciseToRoutine(repos, routine.id, exIds[0]!);
    const b = await addExerciseToRoutine(repos, routine.id, exIds[1]!);

    await updateRoutineExercise(repos, a.id, {
      target_sets: 5,
      target_reps_min: 3,
      target_reps_max: 5,
      target_rest_sec: 210,
      progression_rule: 'add_weight',
    });
    await removeRoutineExercise(repos, b.id);

    const detail = await getRoutineDetail(repos, routine.id);
    expect(detail?.exercises).toHaveLength(1);
    expect(detail?.exercises[0]?.routineExercise).toMatchObject({
      target_sets: 5,
      target_reps_min: 3,
      target_reps_max: 5,
      target_rest_sec: 210,
      progression_rule: 'add_weight',
    });
  });

  it('start-from-routine pre-creates the configured number of sets', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'R');
    const re = await addExerciseToRoutine(repos, routine.id, exIds[0]!, { target_sets: 4 });
    await updateRoutineExercise(repos, re.id, { target_sets: 4 });

    const workout = await startWorkoutFromRoutine(repos, routine.id);
    const [we] = await repos.workoutExercises.list('workout_id = ?', [workout.id]);
    const sets = await repos.sets.list('workout_exercise_id = ?', [we!.id]);
    expect(sets).toHaveLength(4);
  });

  it('installs starter templates idempotently', async () => {
    const { repos } = await setup();
    const first = await installStarterTemplates(repos);
    expect(first).toBe(6);
    expect(await installStarterTemplates(repos)).toBe(0);
  });

  it('starting from a routine does not mutate completed workout history', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'Leg');
    await addExerciseToRoutine(repos, routine.id, exIds[0]!, { target_sets: 2 });

    const workout = await startWorkoutFromRoutine(repos, routine.id);
    await finishWorkout(repos, workout.id);

    // Snapshot of the completed workout's exercises.
    const before = await repos.workoutExercises.list('workout_id = ?', [workout.id]);

    // Edit the routine afterwards.
    await addExerciseToRoutine(repos, routine.id, exIds[1]!);

    const after = await repos.workoutExercises.list('workout_id = ?', [workout.id]);
    expect(after).toEqual(before);
    expect(after).toHaveLength(1);
  });

  it('blocks starting from a routine while a workout is already active', async () => {
    const { repos, exIds } = await setup();
    const routine = await createRoutine(repos, 'Leg');
    await addExerciseToRoutine(repos, routine.id, exIds[0]!, { target_sets: 2 });

    await startWorkoutFromRoutine(repos, routine.id);
    await expect(startWorkoutFromRoutine(repos, routine.id)).rejects.toBeInstanceOf(
      ActiveWorkoutExistsError,
    );
  });
});

describe('noteService scoping', () => {
  it('gym-specific notes override the general note', async () => {
    const { repos, exIds } = await setup();
    const exId = exIds[0]!;
    const gymA = randomUUID();
    const gymB = randomUUID();
    await upsertExerciseNote(repos, exId, null, { grip: 'shoulder width' });
    await upsertExerciseNote(repos, exId, gymA, { grip: 'narrow' });

    expect((await getExerciseNote(repos, exId, gymA))?.grip).toBe('narrow');
    expect((await getExerciseNote(repos, exId, gymB))?.grip).toBe('shoulder width');
    expect((await getExerciseNote(repos, exId, null))?.grip).toBe('shoulder width');
  });
});
