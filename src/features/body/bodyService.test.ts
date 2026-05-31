import { randomUUID } from 'node:crypto';
import { createTestDatabase } from '@/data/local/testDb';
import { runMigrations } from '@/data/local/migrations';
import { buildRepos, type Repos } from '@/data/local/repos';
import type { RepoDeps } from '@/data/local/types';
import { addBodyMetric, listBodyMetrics, removeBodyMetric } from '@/features/body/bodyService';
import { createGymProfile, listGymProfiles, removeGymProfile } from '@/features/gyms/gymService';

const deps: RepoDeps = { id: () => randomUUID(), now: () => '2024-01-01T00:00:00.000Z' };

async function setup(): Promise<Repos> {
  const db = createTestDatabase();
  await runMigrations(db);
  return buildRepos(db, deps);
}

describe('bodyService', () => {
  it('adds, lists (newest first), and removes entries', async () => {
    const repos = await setup();
    await addBodyMetric(repos, { date: '2024-01-01', weight_kg: 80 });
    const b = await addBodyMetric(repos, { date: '2024-02-01', weight_kg: 79, body_fat_pct: 15 });

    const list = await listBodyMetrics(repos);
    expect(list.map((m) => m.date)).toEqual(['2024-02-01', '2024-01-01']);
    expect(list[0]?.body_fat_pct).toBe(15);

    await removeBodyMetric(repos, b.id);
    expect(await listBodyMetrics(repos)).toHaveLength(1);
  });
});

describe('gymService', () => {
  it('creates, lists, and removes gym profiles', async () => {
    const repos = await setup();
    const g = await createGymProfile(repos, 'Home Gym');
    expect((await listGymProfiles(repos)).map((x) => x.name)).toEqual(['Home Gym']);
    await removeGymProfile(repos, g.id);
    expect(await listGymProfiles(repos)).toHaveLength(0);
  });
});
