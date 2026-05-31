import type { SetType } from './schemas';

/** Minimal shape the pure calculations operate on (decoupled from rows). */
export interface CompletedSet {
  weightKg: number;
  reps: number;
  setType?: SetType;
}

/** Working sets count toward 1RM/volume/PRs; warmups are excluded. */
export function isWorkingSet(set: CompletedSet): boolean {
  return set.setType !== 'warmup' && set.reps > 0;
}

export function workingSets(sets: CompletedSet[]): CompletedSet[] {
  return sets.filter(isWorkingSet);
}
