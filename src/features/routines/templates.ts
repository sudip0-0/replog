import type { ProgressionRule } from '@/domain/schemas';

export interface TemplateExercise {
  /** Must match a seeded exercise name. */
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSec: number;
  rule: ProgressionRule;
}

export interface RoutineTemplate {
  name: string;
  exercises: TemplateExercise[];
}

const dp: ProgressionRule = 'double_progression';

/** Built-in starter routines. Exercise names map onto the seed library. */
export const STARTER_TEMPLATES: RoutineTemplate[] = [
  {
    name: 'Push',
    exercises: [
      { name: 'Barbell Bench Press', sets: 3, repsMin: 5, repsMax: 8, restSec: 180, rule: dp },
      { name: 'Overhead Press', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Incline Dumbbell Press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120, rule: dp },
      { name: 'Triceps Pushdown', sets: 3, repsMin: 10, repsMax: 15, restSec: 90, rule: dp },
      { name: 'Lateral Raise', sets: 3, repsMin: 12, repsMax: 20, restSec: 60, rule: dp },
    ],
  },
  {
    name: 'Pull',
    exercises: [
      { name: 'Deadlift', sets: 2, repsMin: 3, repsMax: 5, restSec: 210, rule: 'add_weight' },
      { name: 'Pull-Up', sets: 3, repsMin: 5, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Barbell Row', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Seated Cable Row', sets: 3, repsMin: 8, repsMax: 12, restSec: 120, rule: dp },
      { name: 'Barbell Curl', sets: 3, repsMin: 8, repsMax: 12, restSec: 90, rule: dp },
    ],
  },
  {
    name: 'Legs',
    exercises: [
      { name: 'Back Squat', sets: 3, repsMin: 5, repsMax: 8, restSec: 210, rule: dp },
      { name: 'Romanian Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Leg Press', sets: 3, repsMin: 10, repsMax: 15, restSec: 120, rule: dp },
      { name: 'Lying Leg Curl', sets: 3, repsMin: 10, repsMax: 15, restSec: 90, rule: dp },
      { name: 'Standing Calf Raise', sets: 4, repsMin: 10, repsMax: 15, restSec: 60, rule: dp },
    ],
  },
  {
    name: 'Upper',
    exercises: [
      { name: 'Barbell Bench Press', sets: 3, repsMin: 5, repsMax: 8, restSec: 180, rule: dp },
      { name: 'Barbell Row', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Overhead Press', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Lat Pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 120, rule: dp },
      { name: 'Dumbbell Curl', sets: 3, repsMin: 8, repsMax: 12, restSec: 90, rule: dp },
    ],
  },
  {
    name: 'Lower',
    exercises: [
      { name: 'Back Squat', sets: 3, repsMin: 5, repsMax: 8, restSec: 210, rule: dp },
      { name: 'Romanian Deadlift', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Walking Lunge', sets: 3, repsMin: 10, repsMax: 12, restSec: 120, rule: dp },
      { name: 'Seated Leg Curl', sets: 3, repsMin: 10, repsMax: 15, restSec: 90, rule: dp },
      { name: 'Seated Calf Raise', sets: 4, repsMin: 12, repsMax: 20, restSec: 60, rule: dp },
    ],
  },
  {
    name: 'Full Body',
    exercises: [
      { name: 'Back Squat', sets: 3, repsMin: 5, repsMax: 8, restSec: 180, rule: dp },
      { name: 'Barbell Bench Press', sets: 3, repsMin: 5, repsMax: 8, restSec: 180, rule: dp },
      { name: 'Barbell Row', sets: 3, repsMin: 6, repsMax: 10, restSec: 150, rule: dp },
      { name: 'Overhead Press', sets: 2, repsMin: 8, repsMax: 12, restSec: 120, rule: dp },
      { name: 'Plank', sets: 3, repsMin: 1, repsMax: 1, restSec: 60, rule: 'maintain' },
    ],
  },
];
