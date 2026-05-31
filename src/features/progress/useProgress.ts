import { useQuery } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import type { ProgressionRule } from '@/domain/schemas';
import type { WeightUnit } from '@/domain/units';
import {
  getExerciseHistory,
  getExercisePRs,
  getProgressionSuggestion,
  getWeeklyMuscleVolume,
  listCompletedWorkouts,
} from './analyticsService';

export function useCompletedWorkouts() {
  return useQuery({
    queryKey: ['workouts', 'completed'],
    queryFn: async () => listCompletedWorkouts(await getRepos()),
  });
}

export function useExerciseHistory(exerciseId: string) {
  return useQuery({
    queryKey: ['exerciseHistory', exerciseId],
    queryFn: async () => getExerciseHistory(await getRepos(), exerciseId),
  });
}

export function useExercisePRs(exerciseId: string) {
  return useQuery({
    queryKey: ['exercisePRs', exerciseId],
    queryFn: async () => getExercisePRs(await getRepos(), exerciseId),
  });
}

export function useProgressionSuggestion(exerciseId: string, rule: ProgressionRule, unit: WeightUnit) {
  return useQuery({
    queryKey: ['suggestion', exerciseId, rule, unit],
    queryFn: async () => getProgressionSuggestion(await getRepos(), exerciseId, rule, unit),
  });
}

export function useWeeklyMuscleVolume() {
  return useQuery({
    queryKey: ['weeklyVolume'],
    queryFn: async () => getWeeklyMuscleVolume(await getRepos()),
  });
}
