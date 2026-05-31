import { useQuery } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import type { Exercise } from '@/domain/schemas';

/** Search the seeded exercise library (empty query lists the first 100). */
export function useExerciseSearch(query: string) {
  return useQuery<Exercise[]>({
    queryKey: ['exercises', query],
    queryFn: async () => {
      const { exercises } = await getRepos();
      const q = query.trim();
      return q ? exercises.search(q) : exercises.list('1=1 ORDER BY name LIMIT 100');
    },
  });
}
