import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import { addBodyMetric, listBodyMetrics, removeBodyMetric } from './bodyService';

const KEY = ['bodyMetrics'];

export function useBodyMetrics() {
  return useQuery({ queryKey: KEY, queryFn: async () => listBodyMetrics(await getRepos()) });
}

export function useAddBodyMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; weight_kg: number; body_fat_pct?: number | null }) =>
      addBodyMetric(await getRepos(), input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveBodyMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => removeBodyMetric(await getRepos(), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
