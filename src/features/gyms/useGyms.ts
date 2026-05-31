import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import { createGymProfile, listGymProfiles, removeGymProfile } from './gymService';

const KEY = ['gymProfiles'];

export function useGymProfiles() {
  return useQuery({ queryKey: KEY, queryFn: async () => listGymProfiles(await getRepos()) });
}

export function useCreateGymProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => createGymProfile(await getRepos(), name),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRemoveGymProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => removeGymProfile(await getRepos(), id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
