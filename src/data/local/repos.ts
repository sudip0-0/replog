import { Repository } from './repository';
import { codecs, ExerciseRepository } from './repositories';
import type { RepoDeps, SqlDatabase } from './types';
import type {
  BodyMetric,
  ExerciseNote,
  GymProfile,
  PersonalRecord,
  Profile,
  Routine,
  RoutineExercise,
  SetRecord,
  Workout,
  WorkoutExercise,
} from '@/domain/schemas';

export interface Repos {
  profiles: Repository<Profile>;
  gymProfiles: Repository<GymProfile>;
  exercises: ExerciseRepository;
  exerciseNotes: Repository<ExerciseNote>;
  routines: Repository<Routine>;
  routineExercises: Repository<RoutineExercise>;
  workouts: Repository<Workout>;
  workoutExercises: Repository<WorkoutExercise>;
  sets: Repository<SetRecord>;
  personalRecords: Repository<PersonalRecord>;
  bodyMetrics: Repository<BodyMetric>;
}

/** Construct the full repository set over a given database + deps. */
export function buildRepos(db: SqlDatabase, deps: RepoDeps): Repos {
  return {
    profiles: new Repository<Profile>(db, codecs.profiles, deps),
    gymProfiles: new Repository<GymProfile>(db, codecs.gym_profiles, deps),
    exercises: new ExerciseRepository(db, deps),
    exerciseNotes: new Repository<ExerciseNote>(db, codecs.exercise_notes, deps),
    routines: new Repository<Routine>(db, codecs.routines, deps),
    routineExercises: new Repository<RoutineExercise>(db, codecs.routine_exercises, deps),
    workouts: new Repository<Workout>(db, codecs.workouts, deps),
    workoutExercises: new Repository<WorkoutExercise>(db, codecs.workout_exercises, deps),
    sets: new Repository<SetRecord>(db, codecs.sets, deps),
    personalRecords: new Repository<PersonalRecord>(db, codecs.personal_records, deps),
    bodyMetrics: new Repository<BodyMetric>(db, codecs.body_metrics, deps),
  };
}

let cached: Repos | null = null;

/** Lazily build (once) the repositories over the initialized local database. */
export async function getRepos(): Promise<Repos> {
  if (cached) return cached;
  // Imported lazily so test/Node consumers of buildRepos never load expo-sqlite.
  const { getDatabase, repoDeps } = await import('./db');
  const db = await getDatabase();
  cached = buildRepos(db, repoDeps);
  return cached;
}
