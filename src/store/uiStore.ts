import { create } from 'zustand';
import type { ThemeMode } from '@/theme';
import type { WeightUnit } from '@/domain/units';

// Ephemeral UI/session state only. Durable data lives in SQLite.
interface UIState {
  themeMode: ThemeMode;
  unit: WeightUnit;
  /** Selected gym profile for scoping exercise notes (null = general). */
  activeGymId: string | null;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setUnit: (unit: WeightUnit) => void;
  setActiveGym: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  themeMode: 'system',
  unit: 'kg',
  activeGymId: null,
  setThemeMode: (themeMode) => set({ themeMode }),
  toggleTheme: () =>
    set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
  setUnit: (unit) => set({ unit }),
  setActiveGym: (activeGymId) => set({ activeGymId }),
}));
