import { estimateOneRepMax, bestEstimatedOneRepMax } from './oneRepMax';

describe('estimateOneRepMax', () => {
  it('returns the weight for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('computes Epley for multi-rep sets', () => {
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.333, 3);
  });

  it('computes Brzycki for multi-rep sets', () => {
    expect(estimateOneRepMax(100, 10, 'brzycki')).toBeCloseTo(133.333, 3);
  });

  it('returns 0 for empty/zero sets', () => {
    expect(estimateOneRepMax(0, 5)).toBe(0);
    expect(estimateOneRepMax(100, 0)).toBe(0);
  });

  it('finds the best e1RM, ignoring warmups', () => {
    const best = bestEstimatedOneRepMax([
      { weightKg: 200, reps: 1, setType: 'warmup' },
      { weightKg: 100, reps: 5, setType: 'normal' },
      { weightKg: 110, reps: 3, setType: 'normal' },
    ]);
    // 110x3 Epley = 121 > 100x5 Epley = 116.67
    expect(best).toBeCloseTo(121, 5);
  });
});
