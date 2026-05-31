import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import {
  addExerciseToRoutine,
  createRoutine,
  deleteRoutine,
  duplicateRoutine,
  getRoutineDetail,
  installStarterTemplates,
  listRoutines,
  removeRoutineExercise,
  reorderRoutineExercises,
  updateRoutineExercise,
  type RoutineDetail,
} from './routineService';

const LIST = ['routines'];
const detailKey = (id: string) => ['routine', id];

export function useRoutines() {
  return useQuery({ queryKey: LIST, queryFn: async () => listRoutines(await getRepos()) });
}

export function useRoutineDetail(id: string) {
  return useQuery<RoutineDetail | null>({
    queryKey: detailKey(id),
    queryFn: async () => getRoutineDetail(await getRepos(), id),
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (id?: string) => {
    qc.invalidateQueries({ queryKey: LIST });
    if (id) qc.invalidateQueries({ queryKey: detailKey(id) });
  };
}

export function useInstallTemplates() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async () => installStarterTemplates(await getRepos()),
    onSuccess: () => invalidate(),
  });
}

export function useCreateRoutine() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (name: string) => createRoutine(await getRepos(), name),
    onSuccess: () => invalidate(),
  });
}

export function useDuplicateRoutine() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => duplicateRoutine(await getRepos(), id),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteRoutine() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => deleteRoutine(await getRepos(), id),
    onSuccess: () => invalidate(),
  });
}

export function useAddExerciseToRoutine(routineId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (exerciseId: string) =>
      addExerciseToRoutine(await getRepos(), routineId, exerciseId),
    onSuccess: () => invalidate(routineId),
  });
}

export function useReorderRoutine(routineId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (orderedIds: string[]) =>
      reorderRoutineExercises(await getRepos(), orderedIds),
    onSuccess: () => invalidate(routineId),
  });
}

export function useUpdateRoutineExercise(routineId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      patch: Parameters<typeof updateRoutineExercise>[2];
    }) => updateRoutineExercise(await getRepos(), vars.id, vars.patch),
    onSuccess: () => invalidate(routineId),
  });
}

export function useRemoveRoutineExercise(routineId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => removeRoutineExercise(await getRepos(), id),
    onSuccess: () => invalidate(routineId),
  });
}
