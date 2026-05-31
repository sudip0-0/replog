import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuthOutcome {
  userId: string | null;
  error: string | null;
}

/** Sign in with email/password. Returns the user id or a message. */
export async function signIn(
  client: SupabaseClient | null,
  email: string,
  password: string,
): Promise<AuthOutcome> {
  if (!client) return { userId: null, error: 'Auth is not configured (running in local mode).' };
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  return { userId: data.user?.id ?? null, error: error?.message ?? null };
}

/** Sign up with email/password. */
export async function signUp(
  client: SupabaseClient | null,
  email: string,
  password: string,
): Promise<AuthOutcome> {
  if (!client) return { userId: null, error: 'Auth is not configured (running in local mode).' };
  const { data, error } = await client.auth.signUp({ email, password });
  return { userId: data.user?.id ?? null, error: error?.message ?? null };
}

export async function signOut(client: SupabaseClient | null): Promise<void> {
  await client?.auth.signOut();
}

/** Current authenticated user id, or null in guest/local mode. */
export async function getCurrentUserId(client: SupabaseClient | null): Promise<string | null> {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}
