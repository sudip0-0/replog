import type { PRKind } from './schemas';
import type { CompletedSet } from './workoutMath';
import { workingSets } from './workoutMath';
import { bestEstimatedOneRepMax, estimateOneRepMax } from './oneRepMax';
import { totalVolume } from './volume';

export interface PRResult {
  kind: PRKind;
  value: number;
  reps: number | null;
  weightKg: number | null;
}

const EPS = 1e-6;

/** Max weight lifted for each exact rep-count across the given sets. */
function bestWeightByReps(sets: CompletedSet[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const s of workingSets(sets)) {
    map.set(s.reps, Math.max(map.get(s.reps) ?? 0, s.weightKg));
  }
  return map;
}

/**
 * Detect personal records set by `currentSession` for one exercise, compared
 * against `history` (each element is the working sets of one past workout).
 * Detects three kinds: best weight at a rep-count, best estimated 1RM, and
 * best single-session volume.
 */
export function detectPRs(history: CompletedSet[][], currentSession: CompletedSet[]): PRResult[] {
  const current = workingSets(currentSession);
  if (current.length === 0) return [];

  const results: PRResult[] = [];
  const pastSets = history.flat();

  // --- Estimated 1RM ---
  const curE1rm = bestEstimatedOneRepMax(current);
  const pastE1rm = bestEstimatedOneRepMax(pastSets);
  if (curE1rm > pastE1rm + EPS) {
    const top = current.reduce((a, b) =>
      estimateOneRepMax(b.weightKg, b.reps) > estimateOneRepMax(a.weightKg, a.reps) ? b : a,
    );
    results.push({ kind: 'e1rm', value: curE1rm, reps: top.reps, weightKg: top.weightKg });
  }

  // --- Best single-session volume ---
  const curVol = totalVolume(current);
  const pastVol = history.reduce((m, s) => Math.max(m, totalVolume(s)), 0);
  if (curVol > pastVol + EPS) {
    results.push({ kind: 'volume', value: curVol, reps: null, weightKg: null });
  }

  // --- Best weight at a rep-count (report the single heaviest qualifying) ---
  const pastByReps = bestWeightByReps(pastSets);
  let weightPR: { weightKg: number; reps: number } | null = null;
  for (const [reps, weight] of bestWeightByReps(current)) {
    if (weight > (pastByReps.get(reps) ?? 0) + EPS) {
      if (!weightPR || weight > weightPR.weightKg) weightPR = { weightKg: weight, reps };
    }
  }
  if (weightPR) {
    results.push({
      kind: 'weight',
      value: weightPR.weightKg,
      reps: weightPR.reps,
      weightKg: weightPR.weightKg,
    });
  }

  return results;
}
