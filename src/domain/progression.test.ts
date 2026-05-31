import { suggestProgression, type ProgressionConfig } from './progression';
import type { CompletedSet } from './workoutMath';

const s = (weightKg: number, reps: number): CompletedSet => ({ weightKg, reps, setType: 'normal' });

const base: Omit<ProgressionConfig, 'rule'> = {
  targetRepsMin: 8,
  targetRepsMax: 10,
  weightIncrementKg: 2.5,
};

describe('suggestProgression', () => {
  it('returns not_enough_data when there is no history', () => {
    const r = suggestProgression([], { ...base, rule: 'double_progression' });
    expect(r.status).toBe('not_enough_data');
    expect(r.explanation).toMatch(/Not enough data/);
  });

  it('double progression adds weight when top of range is reached', () => {
    const r = suggestProgression([[s(40, 10), s(40, 10), s(40, 10)]], {
      ...base,
      rule: 'double_progression',
    });
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 42.5, targetRepsMin: 8, targetRepsMax: 10 });
    expect(r.explanation).toBe(
      'Last time you completed 3×10 at 40 kg. You hit the top of the rep range, so add weight: try 42.5 kg for 8-10.',
    );
  });

  it('double progression adds reps when below the top of range', () => {
    const r = suggestProgression([[s(40, 8), s(40, 8)]], { ...base, rule: 'double_progression' });
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 40, targetRepsMin: 9 });
  });

  it('add_reps keeps weight and bumps a rep', () => {
    const r = suggestProgression([[s(60, 8)]], { ...base, rule: 'add_reps' });
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 60, targetRepsMin: 9 });
  });

  it('add_weight always increases load', () => {
    const r = suggestProgression([[s(100, 5)]], { ...base, rule: 'add_weight' });
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 102.5 });
  });

  it('maintain repeats the last working weight', () => {
    const r = suggestProgression([[s(80, 8)]], { ...base, rule: 'maintain' });
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 80, targetRepsMin: 8, targetRepsMax: 10 });
  });

  it('deload reduces weight by the configured percentage', () => {
    const r = suggestProgression([[s(100, 5)]], { ...base, rule: 'deload', deloadPct: 0.1 });
    // 100 * 0.9 = 90 -> rounded to 90
    expect(r).toMatchObject({ status: 'ok', targetWeightKg: 90 });
    expect(r.explanation).toMatch(/Deload/);
  });

  it('formats explanations in the chosen unit', () => {
    const r = suggestProgression([[s(40, 10), s(40, 10), s(40, 10)]], {
      ...base,
      rule: 'maintain',
      unit: 'lb',
    });
    expect(r.explanation).toMatch(/lb/);
  });
});
