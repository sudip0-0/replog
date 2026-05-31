import { create } from 'zustand';

/** Ephemeral rest-timer state, keyed per workout-exercise (not persisted). */
interface RestTimerState {
  /** key (workoutExerciseId) -> epoch ms when that rest ends. */
  endsAt: Record<string, number>;
  start: (key: string, seconds: number) => void;
  stop: (key: string) => void;
}

export const useRestTimer = create<RestTimerState>((set) => ({
  endsAt: {},
  start: (key, seconds) =>
    set((s) => ({ endsAt: { ...s.endsAt, [key]: Date.now() + seconds * 1000 } })),
  stop: (key) =>
    set((s) => {
      const next = { ...s.endsAt };
      delete next[key];
      return { endsAt: next };
    }),
}));
