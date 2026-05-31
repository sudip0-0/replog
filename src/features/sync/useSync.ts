import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getRepos } from '@/data/local/repos';
import { getSupabase } from '@/data/remote/supabase';
import { syncAll } from '@/data/remote/sync';
import { useAuth } from '@/features/auth/useAuth';

export interface SyncResult {
  pushed: number;
  pulled: number;
}

/**
 * Manual "Sync now". Safe no-op surface: throws a friendly error if not
 * configured/authenticated; never touches the network in guest mode.
 */
export function useSyncNow() {
  const userId = useAuth((s) => s.userId);
  const qc = useQueryClient();
  return useMutation<SyncResult>({
    mutationFn: async () => {
      const supabase = getSupabase();
      if (!supabase || !userId) throw new Error('Sign in to enable cloud sync.');
      const { getDatabase } = await import('@/data/local/db');
      const db = await getDatabase();
      const repos = await getRepos();
      return syncAll(db, repos, supabase, userId);
    },
    // After a pull, local data may have changed — refresh all screens.
    onSuccess: () => qc.invalidateQueries(),
  });
}
