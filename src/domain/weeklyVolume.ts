import type { MuscleGroup } from './schemas';
import type { CompletedSet } from './workoutMath';
import { totalVolume } from './volume';

export interface ExerciseSession {
  /** ISO date or datetime string. */
  date: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  sets: CompletedSet[];
}

export interface WeeklyMuscleVolume {
  /** Monday (UTC) of the week as YYYY-MM-DD. */
  weekStart: string;
  volumeByMuscle: Partial<Record<MuscleGroup, number>>;
}

/** Monday (UTC) of the week containing the given date, as YYYY-MM-DD. */
export function weekStartUTC(dateISO: string): string {
  const d = new Date(dateISO);
  const day = d.getUTCDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // days since Monday
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff),
  );
  return monday.toISOString().slice(0, 10);
}

export interface WeeklyVolumeOptions {
  /** Fraction of volume credited to secondary muscles (default 0.5). */
  secondaryWeight?: number;
}

/**
 * Aggregate training volume per muscle group per ISO week. Primary muscle gets
 * full credit; each secondary muscle gets `secondaryWeight` of the volume.
 * Result is sorted ascending by week.
 */
export function weeklyMuscleVolume(
  sessions: ExerciseSession[],
  opts?: WeeklyVolumeOptions,
): WeeklyMuscleVolume[] {
  const secondaryWeight = opts?.secondaryWeight ?? 0.5;
  const weeks = new Map<string, Partial<Record<MuscleGroup, number>>>();

  for (const session of sessions) {
    const vol = totalVolume(session.sets);
    if (vol === 0) continue;
    const week = weekStartUTC(session.date);
    const byMuscle = weeks.get(week) ?? {};
    byMuscle[session.primaryMuscle] = (byMuscle[session.primaryMuscle] ?? 0) + vol;
    for (const m of session.secondaryMuscles) {
      byMuscle[m] = (byMuscle[m] ?? 0) + vol * secondaryWeight;
    }
    weeks.set(week, byMuscle);
  }

  return [...weeks.entries()]
    .map(([weekStart, volumeByMuscle]) => ({ weekStart, volumeByMuscle }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}
