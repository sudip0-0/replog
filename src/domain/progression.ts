import type { ProgressionRule } from './schemas';
import type { WeightUnit } from './units';
import { fromKg, roundToIncrement } from './units';
import type { CompletedSet } from './workoutMath';
import { workingSets } from './workoutMath';

export interface ProgressionConfig {
  rule: ProgressionRule;
  targetRepsMin: number;
  targetRepsMax: number;
  /** Smallest loadable weight change, in kg (default 2.5). */
  weightIncrementKg?: number;
  /** Deload fraction, e.g. 0.1 removes 10% (default 0.1). */
  deloadPct?: number;
  /** Unit used only for the human-readable explanation (default kg). */
  unit?: WeightUnit;
}

export interface ProgressionSuggestion {
  status: 'ok';
  rule: ProgressionRule;
  targetWeightKg: number;
  targetRepsMin: number;
  targetRepsMax: number;
  explanation: string;
}

export interface NotEnoughData {
  status: 'not_enough_data';
  explanation: string;
}

export type ProgressionResult = ProgressionSuggestion | NotEnoughData;

/** Format a kg weight in the display unit without trailing zeros. */
function fmtWeight(kg: number, unit: WeightUnit): string {
  const v = fromKg(kg, unit);
  const rounded = Math.round(v * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)} ${unit}`;
}

interface LastSession {
  topWeightKg: number;
  setCount: number;
  minRepsAtTop: number;
}

/** Summarize the most recent session's top working weight. */
function summarize(sets: CompletedSet[]): LastSession | null {
  const working = workingSets(sets);
  if (working.length === 0) return null;
  const topWeightKg = Math.max(...working.map((s) => s.weightKg));
  const atTop = working.filter((s) => s.weightKg === topWeightKg);
  return {
    topWeightKg,
    setCount: atTop.length,
    minRepsAtTop: Math.min(...atTop.map((s) => s.reps)),
  };
}

/**
 * Suggest the next session's target for one exercise.
 *
 * @param sessions Past sessions' sets, ordered MOST RECENT FIRST.
 * @param config   Rule + target rep range + increments.
 */
export function suggestProgression(
  sessions: CompletedSet[][],
  config: ProgressionConfig,
): ProgressionResult {
  const {
    rule,
    targetRepsMin,
    targetRepsMax,
    weightIncrementKg = 2.5,
    deloadPct = 0.1,
    unit = 'kg',
  } = config;

  const last = sessions.length > 0 ? summarize(sessions[0] ?? []) : null;
  if (!last) {
    return {
      status: 'not_enough_data',
      explanation: 'Not enough data yet. Log a working set to get a suggestion next time.',
    };
  }

  const last3 = `${last.setCount}×${last.minRepsAtTop} at ${fmtWeight(last.topWeightKg, unit)}`;
  const ok = (
    targetWeightKg: number,
    repsMin: number,
    repsMax: number,
    explanation: string,
  ): ProgressionSuggestion => ({
    status: 'ok',
    rule,
    targetWeightKg: roundToIncrement(targetWeightKg, weightIncrementKg),
    targetRepsMin: repsMin,
    targetRepsMax: repsMax,
    explanation,
  });

  switch (rule) {
    case 'double_progression': {
      if (last.minRepsAtTop >= targetRepsMax) {
        const next = last.topWeightKg + weightIncrementKg;
        return ok(
          next,
          targetRepsMin,
          targetRepsMax,
          `Last time you completed ${last3}. You hit the top of the rep range, so add weight: try ${fmtWeight(next, unit)} for ${targetRepsMin}-${targetRepsMax}.`,
        );
      }
      return ok(
        last.topWeightKg,
        Math.min(last.minRepsAtTop + 1, targetRepsMax),
        targetRepsMax,
        `Last time you completed ${last3}. Stay at ${fmtWeight(last.topWeightKg, unit)} and aim for ${Math.min(last.minRepsAtTop + 1, targetRepsMax)}-${targetRepsMax} reps.`,
      );
    }
    case 'add_reps': {
      const nextReps = Math.min(last.minRepsAtTop + 1, targetRepsMax);
      return ok(
        last.topWeightKg,
        nextReps,
        targetRepsMax,
        `Last time you completed ${last3}. Keep ${fmtWeight(last.topWeightKg, unit)} and add a rep: aim for ${nextReps}.`,
      );
    }
    case 'add_weight': {
      const next = last.topWeightKg + weightIncrementKg;
      return ok(
        next,
        targetRepsMin,
        targetRepsMax,
        `Last time you completed ${last3}. Add weight: try ${fmtWeight(next, unit)} for ${targetRepsMin}-${targetRepsMax}.`,
      );
    }
    case 'deload': {
      const next = last.topWeightKg * (1 - deloadPct);
      return ok(
        next,
        targetRepsMin,
        targetRepsMax,
        `Last time you completed ${last3}. Deload to ${fmtWeight(roundToIncrement(next, weightIncrementKg), unit)} (-${Math.round(deloadPct * 100)}%) and rebuild for ${targetRepsMin}-${targetRepsMax}.`,
      );
    }
    case 'maintain':
    default:
      return ok(
        last.topWeightKg,
        targetRepsMin,
        targetRepsMax,
        `Last time you completed ${last3}. Maintain ${fmtWeight(last.topWeightKg, unit)} for ${targetRepsMin}-${targetRepsMax}.`,
      );
  }
}
