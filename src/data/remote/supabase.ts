import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both env vars are present; otherwise the app stays local-only. */
export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Returns the Supabase client, or null when unconfigured (documented mock /
 * local-only mode). Auth state is persisted via the platform default storage.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  return client;
}
