import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import type { SetRecord } from '@/domain/schemas';
import type { CompletedSet } from '@/domain/workoutMath';
import {
  addExercise,
  addSet,
  finishWorkout,
  getActiveWorkout,
  getPreviousPerformance,
  getWorkoutDetail,
  removeSet,
  updateSet,
  type SetInput,
  type WorkoutDetail,
} from './workoutService';

const ACTIVE = ['workout', 'active'];
const detailKey = (id: string) => ['workout', 'detail', id];

export function useActiveWorkout() {
  return useQuery({
    queryKey: ACTIVE,
    queryFn: async () => getActiveWorkout(await getRepos()),
  });
}

export function useWorkoutDetail(id: string) {
  return useQuery<WorkoutDetail | null>({
    queryKey: detailKey(id),
    queryFn: async () => getWorkoutDetail(await getRepos(), id),
  });
}

export function usePreviousPerformance(exerciseId: string, excludeWorkoutId?: string) {
  return useQuery<{ sets: CompletedSet[] } | null>({
    queryKey: ['previous', exerciseId, excludeWorkoutId ?? null],
    queryFn: async () => getPreviousPerformance(await getRepos(), exerciseId, excludeWorkoutId),
  });
}

export function useAddExercise(workoutId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exerciseId: string) => addExercise(await getRepos(), workoutId, exerciseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: detailKey(workoutId) }),
  });
}

export function useAddSet(workoutId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { workoutExerciseId: string; input?: SetInput }) =>
      addSet(await getRepos(), vars.workoutExerciseId, vars.input),
    onSuccess: () => qc.invalidateQueries({ queryKey: detailKey(workoutId) }),
  });
}

export function useUpdateSet(workoutId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<SetRecord> }) =>
      updateSet(await getRepos(), vars.id, vars.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: detailKey(workoutId) }),
  });
}

export function useRemoveSet(workoutId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => removeSet(await getRepos(), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: detailKey(workoutId) }),
  });
}

export function useFinishWorkout(workoutId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => finishWorkout(await getRepos(), workoutId),
    onSuccess: () => {
      // A finished workout affects every analytics/history surface.
      for (const key of [
        ACTIVE,
        ['workouts'],
        ['weeklyVolume'],
        ['exerciseHistory'],
        ['exercisePRs'],
        ['suggestion'],
        ['previous'],
      ]) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}
