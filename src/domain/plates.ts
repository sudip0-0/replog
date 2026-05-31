import { fromKg, type WeightUnit } from './units';

export interface PlateResult {
  /** Plates to load on ONE side, largest first (display unit). */
  perSide: number[];
  /** Weight that can't be represented with the given plates (display unit). */
  leftover: number;
  barWeight: number;
}

const DEFAULTS: Record<WeightUnit, { bar: number; plates: number[] }> = {
  kg: { bar: 20, plates: [25, 20, 15, 10, 5, 2.5, 1.25] },
  lb: { bar: 45, plates: [45, 35, 25, 10, 5, 2.5] },
};

const EPS = 1e-6;

/**
 * Plates per side to reach `target` (same unit as `bar`/`plates`), greedy from
 * the largest plate. `leftover` is any unrepresentable remainder (both sides).
 */
export function platesPerSide(target: number, bar: number, plates: number[]): {
  perSide: number[];
  leftover: number;
} {
  let perSideWeight = (target - bar) / 2;
  if (perSideWeight <= EPS) return { perSide: [], leftover: Math.max(0, target - bar) };
  const sorted = [...plates].sort((a, b) => b - a);
  const perSide: number[] = [];
  for (const p of sorted) {
    while (perSideWeight + EPS >= p) {
      perSide.push(p);
      perSideWeight -= p;
    }
  }
  return { perSide, leftover: Math.round(perSideWeight * 2 * 100) / 100 };
}

/** Plate breakdown for a kg target, rendered in the user's display unit. */
export function barbellPlates(targetKg: number, unit: WeightUnit): PlateResult {
  const { bar, plates } = DEFAULTS[unit];
  const target = Math.round(fromKg(targetKg, unit) * 100) / 100;
  const { perSide, leftover } = platesPerSide(target, bar, plates);
  return { perSide, leftover, barWeight: bar };
}
