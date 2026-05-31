import type { CompletedSet } from './workoutMath';
import { workingSets } from './workoutMath';

export interface VolumeOptions {
  /** Include warmup sets in the totals (default false). */
  includeWarmups?: boolean;
}

export function setVolume(set: CompletedSet): number {
  return set.weightKg * set.reps;
}

function selected(sets: CompletedSet[], opts?: VolumeOptions): CompletedSet[] {
  return opts?.includeWarmups ? sets : workingSets(sets);
}

/** Total training volume (sum of weight x reps) in kg. */
export function totalVolume(sets: CompletedSet[], opts?: VolumeOptions): number {
  return selected(sets, opts).reduce((sum, s) => sum + setVolume(s), 0);
}

/** Total reps performed. */
export function totalReps(sets: CompletedSet[], opts?: VolumeOptions): number {
  return selected(sets, opts).reduce((sum, s) => sum + s.reps, 0);
}

/** Heaviest weight lifted across the selected sets (0 if none). */
export function bestWeight(sets: CompletedSet[], opts?: VolumeOptions): number {
  return selected(sets, opts).reduce((best, s) => Math.max(best, s.weightKg), 0);
}
