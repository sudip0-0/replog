import type { Repos } from '@/data/local/repos';
import type { BodyMetric } from '@/domain/schemas';
import { LOCAL_USER } from '@/features/workouts/workoutService';

/** Body metrics, most recent date first. */
export function listBodyMetrics(repos: Repos): Promise<BodyMetric[]> {
  return repos.bodyMetrics.list('1=1 ORDER BY date DESC');
}

export function addBodyMetric(
  repos: Repos,
  input: { date: string; weight_kg: number; body_fat_pct?: number | null },
): Promise<BodyMetric> {
  return repos.bodyMetrics.create({
    user_id: LOCAL_USER,
    date: input.date,
    weight_kg: input.weight_kg,
    body_fat_pct: input.body_fat_pct ?? null,
  });
}

export function removeBodyMetric(repos: Repos, id: string): Promise<void> {
  return repos.bodyMetrics.softDelete(id);
}
