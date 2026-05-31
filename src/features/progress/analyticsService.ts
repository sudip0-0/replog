import type { Repos } from '@/data/local/repos';
import type { PersonalRecord, ProgressionRule, Workout } from '@/domain/schemas';
import type { CompletedSet } from '@/domain/workoutMath';
import { bestEstimatedOneRepMax } from '@/domain/oneRepMax';
import { bestWeight, totalReps, totalVolume } from '@/domain/volume';
import { weeklyMuscleVolume, type ExerciseSession, type WeeklyMuscleVolume } from '@/domain/weeklyVolume';
import { suggestProgression, type ProgressionResult } from '@/domain/progression';

export interface ExerciseSessionEntry {
  workout: Workout;
  sets: CompletedSet[];
}

export interface ExerciseHistoryPoint {
  date: string;
  bestWeightKg: number;
  estimatedOneRepMax: number;
  totalReps: number;
  totalVolume: number;
}

export function listCompletedWorkouts(repos: Repos): Promise<Workout[]> {
  return repos.workouts.list("status = 'completed' ORDER BY completed_at DESC");
}

/** Completed sessions that included an exercise, most recent first. */
export async function getExerciseSessions(
  repos: Repos,
  exerciseId: string,
): Promise<ExerciseSessionEntry[]> {
  const workouts = await listCompletedWorkouts(repos);
  const entries: ExerciseSessionEntry[] = [];
  for (const workout of workouts) {
    const wexs = await repos.workoutExercises.list('workout_id = ? AND exercise_id = ?', [
      workout.id,
      exerciseId,
    ]);
    const sets: CompletedSet[] = [];
    for (const we of wexs) {
      const rows = await repos.sets.list('workout_exercise_id = ? AND completed = 1', [we.id]);
      for (const s of rows) sets.push({ weightKg: s.weight_kg, reps: s.reps, setType: s.set_type });
    }
    if (sets.length > 0) entries.push({ workout, sets });
  }
  return entries;
}

/** Time series of best weight / e1RM / reps / volume per session (oldest first). */
export async function getExerciseHistory(
  repos: Repos,
  exerciseId: string,
): Promise<ExerciseHistoryPoint[]> {
  const sessions = await getExerciseSessions(repos, exerciseId);
  return sessions
    .map((s) => ({
      date: s.workout.completed_at ?? s.workout.started_at,
      bestWeightKg: bestWeight(s.sets),
      estimatedOneRepMax: bestEstimatedOneRepMax(s.sets),
      totalReps: totalReps(s.sets),
      totalVolume: totalVolume(s.sets),
    }))
    .reverse();
}

export function getExercisePRs(repos: Repos, exerciseId: string): Promise<PersonalRecord[]> {
  return repos.personalRecords.list('exercise_id = ? ORDER BY achieved_at DESC', [exerciseId]);
}

/** Progression suggestion for an exercise from its recent completed sessions. */
export async function getProgressionSuggestion(
  repos: Repos,
  exerciseId: string,
  rule: ProgressionRule = 'double_progression',
  unit: 'kg' | 'lb' = 'kg',
): Promise<ProgressionResult> {
  const sessions = await getExerciseSessions(repos, exerciseId);
  return suggestProgression(
    sessions.map((s) => s.sets),
    { rule, targetRepsMin: 8, targetRepsMax: 12, unit },
  );
}

/** Weekly muscle-group volume across all completed workouts. */
export async function getWeeklyMuscleVolume(repos: Repos): Promise<WeeklyMuscleVolume[]> {
  const workouts = await listCompletedWorkouts(repos);
  const sessions: ExerciseSession[] = [];
  for (const workout of workouts) {
    const wexs = await repos.workoutExercises.list('workout_id = ?', [workout.id]);
    for (const we of wexs) {
      const exercise = await repos.exercises.getById(we.exercise_id);
      if (!exercise) continue;
      const rows = await repos.sets.list('workout_exercise_id = ? AND completed = 1', [we.id]);
      sessions.push({
        date: workout.completed_at ?? workout.started_at,
        primaryMuscle: exercise.primary_muscle,
        secondaryMuscles: exercise.secondary_muscles,
        sets: rows.map((s) => ({ weightKg: s.weight_kg, reps: s.reps, setType: s.set_type })),
      });
    }
  }
  return weeklyMuscleVolume(sessions);
}
