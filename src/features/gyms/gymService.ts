import type { Repos } from '@/data/local/repos';
import type { GymProfile } from '@/domain/schemas';
import { LOCAL_USER } from '@/features/workouts/workoutService';

export function listGymProfiles(repos: Repos): Promise<GymProfile[]> {
  return repos.gymProfiles.list('1=1 ORDER BY name');
}

export function createGymProfile(repos: Repos, name: string): Promise<GymProfile> {
  return repos.gymProfiles.create({ user_id: LOCAL_USER, name, is_default: false });
}

export function removeGymProfile(repos: Repos, id: string): Promise<void> {
  return repos.gymProfiles.softDelete(id);
}
