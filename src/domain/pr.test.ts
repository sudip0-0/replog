import { detectPRs } from './pr';
import type { CompletedSet } from './workoutMath';

const s = (weightKg: number, reps: number): CompletedSet => ({
  weightKg,
  reps,
  setType: 'normal',
});

describe('detectPRs', () => {
  it('reports weight, e1rm, and volume PRs when there is no history', () => {
    const prs = detectPRs([], [s(100, 5)]);
    const kinds = prs.map((p) => p.kind).sort();
    expect(kinds).toEqual(['e1rm', 'volume', 'weight']);
  });

  it('detects a weight PR at a rep-count', () => {
    const history = [[s(100, 5)]];
    const prs = detectPRs(history, [s(105, 5)]);
    const weight = prs.find((p) => p.kind === 'weight');
    expect(weight).toMatchObject({ weightKg: 105, reps: 5 });
  });

  it('detects an e1rm PR even at different rep ranges', () => {
    const history = [[s(100, 5)]]; // e1rm ~116.7
    const prs = detectPRs(history, [s(110, 3)]); // e1rm = 121
    expect(prs.some((p) => p.kind === 'e1rm')).toBe(true);
  });

  it('detects a session volume PR', () => {
    const history = [[s(100, 5)]]; // volume 500
    const prs = detectPRs(history, [s(100, 3), s(100, 3)]); // volume 600
    expect(prs.some((p) => p.kind === 'volume')).toBe(true);
  });

  it('reports nothing when the session does not beat history', () => {
    const history = [[s(100, 5), s(100, 5)]];
    expect(detectPRs(history, [s(90, 5)])).toEqual([]);
  });

  it('ignores warmups and empty sessions', () => {
    expect(detectPRs([[s(100, 5)]], [{ weightKg: 200, reps: 1, setType: 'warmup' }])).toEqual([]);
  });
});
