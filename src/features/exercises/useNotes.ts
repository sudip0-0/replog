import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import { getExerciseNote, upsertExerciseNote, type NoteFields } from './noteService';
import type { ExerciseNote } from '@/domain/schemas';

const key = (exerciseId: string, gymProfileId: string | null) => [
  'note',
  exerciseId,
  gymProfileId ?? null,
];

export function useExerciseNote(exerciseId: string, gymProfileId: string | null = null) {
  return useQuery<ExerciseNote | null>({
    queryKey: key(exerciseId, gymProfileId),
    queryFn: async () => getExerciseNote(await getRepos(), exerciseId, gymProfileId),
  });
}

export function useUpsertNote(exerciseId: string, gymProfileId: string | null = null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fields: Partial<NoteFields>) =>
      upsertExerciseNote(await getRepos(), exerciseId, gymProfileId, fields),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(exerciseId, gymProfileId) }),
  });
}
