import type { CompletedSet } from './workoutMath';
import { workingSets } from './workoutMath';

export type OneRepMaxFormula = 'epley' | 'brzycki';

/**
 * Estimate a one-rep max from a weight x reps set.
 * Epley:   w * (1 + reps/30)
 * Brzycki: w * 36 / (37 - reps)
 * Returns the weight itself for a single rep, and 0 for an empty set.
 */
export function estimateOneRepMax(
  weightKg: number,
  reps: number,
  formula: OneRepMaxFormula = 'epley',
): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  if (formula === 'brzycki') {
    // Brzycki diverges as reps approach 37; clamp for safety.
    if (reps >= 37) return estimateOneRepMax(weightKg, reps, 'epley');
    return (weightKg * 36) / (37 - reps);
  }
  return weightKg * (1 + reps / 30);
}

/** Best estimated 1RM across the working sets (0 if none). */
export function bestEstimatedOneRepMax(
  sets: CompletedSet[],
  formula: OneRepMaxFormula = 'epley',
): number {
  return workingSets(sets).reduce(
    (best, s) => Math.max(best, estimateOneRepMax(s.weightKg, s.reps, formula)),
    0,
  );
}
