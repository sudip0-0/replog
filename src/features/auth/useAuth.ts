import { create } from 'zustand';
import { getSupabase, isSupabaseConfigured } from '@/data/remote/supabase';
import * as authService from '@/features/auth/authService';

interface AuthState {
  status: 'loading' | 'guest' | 'authenticated';
  userId: string | null;
  configured: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

/** Auth/session store. Defaults to guest/local mode when unconfigured. */
export const useAuth = create<AuthState>((set) => ({
  status: 'loading',
  userId: null,
  configured: isSupabaseConfigured,
  init: async () => {
    const userId = await authService.getCurrentUserId(getSupabase());
    set({ status: userId ? 'authenticated' : 'guest', userId });
  },
  signIn: async (email, password) => {
    const { userId, error } = await authService.signIn(getSupabase(), email, password);
    if (userId) set({ status: 'authenticated', userId });
    return error;
  },
  signUp: async (email, password) => {
    const { userId, error } = await authService.signUp(getSupabase(), email, password);
    if (userId) set({ status: 'authenticated', userId });
    return error;
  },
  signOut: async () => {
    await authService.signOut(getSupabase());
    set({ status: 'guest', userId: null });
  },
}));
