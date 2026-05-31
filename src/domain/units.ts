export type WeightUnit = 'kg' | 'lb';

const LB_PER_KG = 2.2046226218;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

/** Convert a weight stored in kg (canonical) to the display unit. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}

/** Convert a user-entered display weight back to canonical kg. */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

/** Round to the nearest loadable increment (default 2.5 kg / 5 lb plates). */
export function roundToIncrement(value: number, increment: number): number {
  if (increment <= 0) return value;
  return Math.round(value / increment) * increment;
}
