import { randomUUID } from 'node:crypto';
import { createTestDatabase } from '@/data/local/testDb';
import { runMigrations } from '@/data/local/migrations';
import { buildRepos } from '@/data/local/repos';
import { seedExercises } from '@/data/seed/seedExercises';
import type { SqlDatabase, RepoDeps } from '@/data/local/types';
import {
  addExercise,
  addSet,
  ActiveWorkoutExistsError,
  assertNoActiveWorkout,
  discardActiveWorkout,
  finishWorkout,
  getActiveWorkout,
  getPreviousPerformance,
  getWorkoutDetail,
  removeSet,
  startEmptyWorkout,
} from './workoutService';

const deps: RepoDeps = { id: () => randomUUID(), now: () => new Date().toISOString() };

async function setup(): Promise<{ db: SqlDatabase; exerciseId: string }> {
  const db = createTestDatabase();
  await runMigrations(db);
  await seedExercises(db, deps.now());
  const repos = buildRepos(db, deps);
  const [ex] = await repos.exercises.search('Back Squat');
  return { db, exerciseId: ex!.id };
}

describe('workoutService', () => {
  it('persists an active workout that rehydrates after a simulated restart', async () => {
    const { db, exerciseId } = await setup();

    // Session 1: start, add exercise + a couple sets.
    const repos1 = buildRepos(db, deps);
    const workout = await startEmptyWorkout(repos1, 'Leg Day');
    const we = await addExercise(repos1, workout.id, exerciseId);
    await addSet(repos1, we.id, { weight_kg: 100, reps: 5, completed: true });
    await addSet(repos1, we.id, { weight_kg: 100, reps: 5, completed: true });

    // Simulate app restart: brand-new repos over the same database.
    const repos2 = buildRepos(db, deps);
    const active = await getActiveWorkout(repos2);
    expect(active?.id).toBe(workout.id);

    const detail = await getWorkoutDetail(repos2, workout.id);
    expect(detail?.exercises).toHaveLength(1);
    expect(detail?.exercises[0]?.exercise?.name).toBe('Back Squat');
    expect(detail?.exercises[0]?.sets).toHaveLength(2);
    expect(detail?.exercises[0]?.sets[0]?.weight_kg).toBe(100);
  });

  it('finishing a workout removes it from active and exposes previous performance', async () => {
    const { db, exerciseId } = await setup();
    const repos = buildRepos(db, deps);

    const w1 = await startEmptyWorkout(repos);
    const we1 = await addExercise(repos, w1.id, exerciseId);
    await addSet(repos, we1.id, { weight_kg: 80, reps: 8, completed: true });
    await finishWorkout(repos, w1.id);

    expect(await getActiveWorkout(repos)).toBeNull();

    const prev = await getPreviousPerformance(repos, exerciseId);
    expect(prev?.sets).toEqual([{ weightKg: 80, reps: 8, setType: 'normal' }]);
  });

  it('prevents a second concurrent active workout', async () => {
    const { db } = await setup();
    const repos = buildRepos(db, deps);
    await startEmptyWorkout(repos);

    await expect(startEmptyWorkout(repos)).rejects.toBeInstanceOf(ActiveWorkoutExistsError);
    await expect(assertNoActiveWorkout(repos)).rejects.toBeInstanceOf(ActiveWorkoutExistsError);
  });

  it('replace path: discarding the active workout allows starting a new one', async () => {
    const { db } = await setup();
    const repos = buildRepos(db, deps);
    const first = await startEmptyWorkout(repos);

    await discardActiveWorkout(repos);
    const second = await startEmptyWorkout(repos);

    expect(second.id).not.toBe(first.id);
    expect((await getActiveWorkout(repos))?.id).toBe(second.id);
  });

  it('renumbers remaining set indices after a delete', async () => {
    const { db, exerciseId } = await setup();
    const repos = buildRepos(db, deps);
    const w = await startEmptyWorkout(repos);
    const we = await addExercise(repos, w.id, exerciseId);
    const s0 = await addSet(repos, we.id, { reps: 5 });
    const s1 = await addSet(repos, we.id, { reps: 6 });
    const s2 = await addSet(repos, we.id, { reps: 7 });
    expect([s0.set_index, s1.set_index, s2.set_index]).toEqual([0, 1, 2]);

    await removeSet(repos, s1.id); // remove the middle set

    const remaining = await repos.sets.list('workout_exercise_id = ? ORDER BY set_index', [we.id]);
    expect(remaining.map((s) => s.set_index)).toEqual([0, 1]);
    expect(remaining.map((s) => s.reps)).toEqual([5, 7]);
  });
});
