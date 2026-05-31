import { create } from 'zustand';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getRepos } from '@/data/local/repos';
import {
  discardActiveWorkout,
  getActiveWorkout,
  startEmptyWorkout,
} from './workoutService';
import { startWorkoutFromRoutine } from '@/features/routines/routineService';

export type StartIntent = { kind: 'empty' } | { kind: 'routine'; routineId: string };

interface ConflictState {
  pending: StartIntent | null;
  activeId: string | null;
  open: (intent: StartIntent, activeId: string) => void;
  clear: () => void;
}

const useConflict = create<ConflictState>((set) => ({
  pending: null,
  activeId: null,
  open: (pending, activeId) => set({ pending, activeId }),
  clear: () => set({ pending: null, activeId: null }),
}));

const toWorkout = (id: string) => router.push({ pathname: '/workout/[id]', params: { id } });

/**
 * Single entry point for starting workouts. If a workout is already active, it
 * surfaces a Resume / Replace / Cancel choice instead of silently creating a
 * second active workout.
 */
export function useStartFlow() {
  const qc = useQueryClient();
  const { pending, activeId, open, clear } = useConflict();

  const run = async (intent: StartIntent) => {
    const repos = await getRepos();
    const w =
      intent.kind === 'empty'
        ? await startEmptyWorkout(repos)
        : await startWorkoutFromRoutine(repos, intent.routineId);
    qc.invalidateQueries({ queryKey: ['workout', 'active'] });
    toWorkout(w.id);
  };

  const start = async (intent: StartIntent) => {
    const active = await getActiveWorkout(await getRepos());
    if (active) open(intent, active.id);
    else await run(intent);
  };

  const resume = () => {
    if (activeId) toWorkout(activeId);
    clear();
  };

  const replace = async () => {
    const intent = pending;
    clear();
    await discardActiveWorkout(await getRepos());
    if (intent) await run(intent);
  };

  return { conflict: pending !== null, start, resume, replace, cancel: clear };
}
