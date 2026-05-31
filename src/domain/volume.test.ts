import { totalVolume, totalReps, bestWeight, setVolume } from './volume';
import type { CompletedSet } from './workoutMath';

const sets: CompletedSet[] = [
  { weightKg: 40, reps: 10, setType: 'warmup' },
  { weightKg: 60, reps: 10, setType: 'normal' },
  { weightKg: 60, reps: 8, setType: 'normal' },
];

describe('volume', () => {
  it('computes single set volume', () => {
    expect(setVolume({ weightKg: 60, reps: 10 })).toBe(600);
  });

  it('excludes warmups by default', () => {
    expect(totalVolume(sets)).toBe(600 + 480);
    expect(totalReps(sets)).toBe(18);
    expect(bestWeight(sets)).toBe(60);
  });

  it('includes warmups when requested', () => {
    expect(totalVolume(sets, { includeWarmups: true })).toBe(400 + 600 + 480);
    expect(totalReps(sets, { includeWarmups: true })).toBe(28);
  });

  it('returns 0 for empty input', () => {
    expect(totalVolume([])).toBe(0);
    expect(bestWeight([])).toBe(0);
  });
});
