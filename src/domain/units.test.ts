import { fromKg, toKg, roundToIncrement } from './units';

describe('units (smoke)', () => {
  it('round-trips kg through lb', () => {
    const kg = 100;
    expect(toKg(fromKg(kg, 'lb'), 'lb')).toBeCloseTo(kg, 6);
  });

  it('rounds to plate increment', () => {
    expect(roundToIncrement(41.2, 2.5)).toBe(40);
  });
});
