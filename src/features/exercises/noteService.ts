import type { Repos } from '@/data/local/repos';
import type { ExerciseNote } from '@/domain/schemas';
import { LOCAL_USER } from '@/features/workouts/workoutService';

export type NoteFields = Pick<
  ExerciseNote,
  'machine_settings' | 'grip' | 'stance' | 'injury_caution' | 'substitutions'
>;

const EMPTY: NoteFields = {
  machine_settings: null,
  grip: null,
  stance: null,
  injury_caution: null,
  substitutions: null,
};

/**
 * Resolve the note for an exercise. A gym-profile-specific note (when a gym is
 * active) takes precedence over the general (gym_profile_id null) note.
 */
export async function getExerciseNote(
  repos: Repos,
  exerciseId: string,
  gymProfileId: string | null,
): Promise<ExerciseNote | null> {
  const all = await repos.exerciseNotes.list('exercise_id = ?', [exerciseId]);
  if (gymProfileId) {
    const scoped = all.find((n) => n.gym_profile_id === gymProfileId);
    if (scoped) return scoped;
  }
  return all.find((n) => n.gym_profile_id === null) ?? null;
}

/** Create or update the note for an exercise at the given scope. */
export async function upsertExerciseNote(
  repos: Repos,
  exerciseId: string,
  gymProfileId: string | null,
  fields: Partial<NoteFields>,
): Promise<ExerciseNote> {
  const all = await repos.exerciseNotes.list('exercise_id = ?', [exerciseId]);
  const existing = all.find((n) => n.gym_profile_id === gymProfileId);
  if (existing) {
    return repos.exerciseNotes.update(existing.id, fields);
  }
  return repos.exerciseNotes.create({
    user_id: LOCAL_USER,
    exercise_id: exerciseId,
    gym_profile_id: gymProfileId,
    ...EMPTY,
    ...fields,
  });
}

/** True when a note carries any content worth surfacing inline. */
export function hasNoteContent(note: ExerciseNote | null): boolean {
  if (!note) return false;
  return Boolean(
    note.machine_settings ||
      note.grip ||
      note.stance ||
      note.injury_caution ||
      note.substitutions,
  );
}
