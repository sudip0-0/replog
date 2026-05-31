import { toKg, type WeightUnit } from './units';

export interface ParseResult<T> {
  value: T;
  error: string | null;
}

/** Parse a display-unit weight string into canonical kg. Empty = 0 (bodyweight). */
export function parseWeight(input: string, unit: WeightUnit): ParseResult<number> {
  const t = input.trim();
  if (t === '') return { value: 0, error: null };
  const n = Number(t);
  if (!Number.isFinite(n)) return { value: 0, error: 'Enter a number' };
  if (n < 0) return { value: 0, error: 'No negative weight' };
  return { value: toKg(n, unit), error: null };
}

/** Parse a reps string: integer >= 0. Empty = 0. */
export function parseReps(input: string): ParseResult<number> {
  const t = input.trim();
  if (t === '') return { value: 0, error: null };
  const n = Number(t);
  if (!Number.isInteger(n)) return { value: 0, error: 'Whole reps only' };
  if (n < 0) return { value: 0, error: 'No negative reps' };
  return { value: n, error: null };
}

/** Parse an RPE string: nullable, 1-10. Empty = null. */
export function parseRpe(input: string): ParseResult<number | null> {
  const t = input.trim();
  if (t === '') return { value: null, error: null };
  const n = Number(t);
  if (!Number.isFinite(n)) return { value: null, error: 'Enter 1-10' };
  if (n < 1 || n > 10) return { value: null, error: 'RPE is 1-10' };
  return { value: n, error: null };
}
