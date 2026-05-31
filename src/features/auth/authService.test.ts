import type { SupabaseClient } from '@supabase/supabase-js';
import { getCurrentUserId, signIn, signUp } from './authService';

// Minimal mock of the Supabase auth surface used by authService.
function mockClient(overrides: Record<string, unknown>): SupabaseClient {
  return { auth: overrides } as unknown as SupabaseClient;
}

describe('authService', () => {
  it('returns the user id on successful sign in', async () => {
    const client = mockClient({
      signInWithPassword: async () => ({ data: { user: { id: 'user-1' } }, error: null }),
    });
    const r = await signIn(client, 'a@b.com', 'pw');
    expect(r).toEqual({ userId: 'user-1', error: null });
  });

  it('surfaces auth errors', async () => {
    const client = mockClient({
      signInWithPassword: async () => ({ data: { user: null }, error: { message: 'bad creds' } }),
    });
    const r = await signIn(client, 'a@b.com', 'pw');
    expect(r).toEqual({ userId: null, error: 'bad creds' });
  });

  it('creates a user on sign up', async () => {
    const client = mockClient({
      signUp: async () => ({ data: { user: { id: 'new-user' } }, error: null }),
    });
    expect((await signUp(client, 'a@b.com', 'pw')).userId).toBe('new-user');
  });

  it('falls back to guest/local mode when no client is configured', async () => {
    expect(await getCurrentUserId(null)).toBeNull();
    const r = await signIn(null, 'a@b.com', 'pw');
    expect(r.userId).toBeNull();
    expect(r.error).toMatch(/local mode/);
  });
});
