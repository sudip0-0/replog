import { randomUUID } from 'node:crypto';
import { createTestDatabase } from '@/data/local/testDb';
import { runMigrations } from '@/data/local/migrations';
import { buildRepos, type Repos } from '@/data/local/repos';
import { seedExercises } from '@/data/seed/seedExercises';
import type { RepoDeps } from '@/data/local/types';
import { addExercise, addSet, finishWorkout, startEmptyWorkout } from '@/features/workouts/workoutService';
import {
  getExerciseHistory,
  getExercisePRs,
  getProgressionSuggestion,
  getWeeklyMuscleVolume,
} from './analyticsService';

const deps: RepoDeps = { id: () => randomUUID(), now: () => new Date().toISOString() };

async function setup(): Promise<{ repos: Repos; exId: string }> {
  const db = createTestDatabase();
  await runMigrations(db);
  await seedExercises(db, deps.now());
  const repos = buildRepos(db, deps);
  const ex = (await repos.exercises.search('Back Squat'))[0]!;
  return { repos, exId: ex.id };
}

async function loggedWorkout(repos: Repos, exId: string, weight: number, reps: number) {
  const w = await startEmptyWorkout(repos);
  const we = await addExercise(repos, w.id, exId);
  await addSet(repos, we.id, { weight_kg: weight, reps, completed: true });
  return finishWorkout(repos, w.id);
}

describe('analytics', () => {
  it('persists PRs on finish and surfaces them + history', async () => {
    const { repos, exId } = await setup();
    await loggedWorkout(repos, exId, 100, 5);
    await loggedWorkout(repos, exId, 110, 5); // beats weight, e1rm, volume

    const prs = await getExercisePRs(repos, exId);
    const kinds = new Set(prs.map((p) => p.kind));
    // second workout sets new weight/e1rm/volume PRs
    expect(kinds.has('weight')).toBe(true);
    expect(kinds.has('e1rm')).toBe(true);

    const history = await getExerciseHistory(repos, exId);
    expect(history).toHaveLength(2);
    expect(history[0]?.bestWeightKg).toBe(100); // oldest first
    expect(history[1]?.bestWeightKg).toBe(110);
  });

  it('computes weekly muscle volume from completed workouts', async () => {
    const { repos, exId } = await setup();
    await loggedWorkout(repos, exId, 100, 5); // 500 volume, primary quads
    const weeks = await getWeeklyMuscleVolume(repos);
    expect(weeks).toHaveLength(1);
    expect(weeks[0]?.volumeByMuscle.quads).toBe(500);
  });

  it('suggests progression from history (or not_enough_data when empty)', async () => {
    const { repos, exId } = await setup();
    expect((await getProgressionSuggestion(repos, exId)).status).toBe('not_enough_data');
    await loggedWorkout(repos, exId, 100, 12);
    const s = await getProgressionSuggestion(repos, exId);
    expect(s.status).toBe('ok');
  });
});
