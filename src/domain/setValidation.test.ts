import { parseWeight, parseReps, parseRpe } from './setValidation';

describe('parseWeight', () => {
  it('accepts empty as 0 and converts units', () => {
    expect(parseWeight('', 'kg')).toEqual({ value: 0, error: null });
    expect(parseWeight('100', 'kg')).toEqual({ value: 100, error: null });
    expect(parseWeight('100', 'lb').value).toBeCloseTo(45.359, 2);
  });
  it('rejects negatives and non-numbers', () => {
    expect(parseWeight('-5', 'kg').error).toMatch(/negative/);
    expect(parseWeight('abc', 'kg').error).toMatch(/number/);
  });
});

describe('parseReps', () => {
  it('accepts whole non-negative integers', () => {
    expect(parseReps('8')).toEqual({ value: 8, error: null });
    expect(parseReps('')).toEqual({ value: 0, error: null });
  });
  it('rejects decimals and negatives', () => {
    expect(parseReps('8.5').error).toMatch(/Whole/);
    expect(parseReps('-1').error).toMatch(/negative/);
  });
});

describe('parseRpe', () => {
  it('is nullable and bounded 1-10', () => {
    expect(parseRpe('')).toEqual({ value: null, error: null });
    expect(parseRpe('8.5')).toEqual({ value: 8.5, error: null });
    expect(parseRpe('0').error).toMatch(/1-10/);
    expect(parseRpe('11').error).toMatch(/1-10/);
  });
});
