import { weeklyMuscleVolume, weekStartUTC, type ExerciseSession } from './weeklyVolume';

describe('weekStartUTC', () => {
  it('returns the Monday of the week', () => {
    // 2024-01-03 is a Wednesday -> Monday 2024-01-01
    expect(weekStartUTC('2024-01-03T12:00:00.000Z')).toBe('2024-01-01');
    // 2024-01-01 is a Monday
    expect(weekStartUTC('2024-01-01T00:00:00.000Z')).toBe('2024-01-01');
    // 2024-01-07 is a Sunday -> still 2024-01-01
    expect(weekStartUTC('2024-01-07T23:00:00.000Z')).toBe('2024-01-01');
  });
});

describe('weeklyMuscleVolume', () => {
  const sessions: ExerciseSession[] = [
    {
      date: '2024-01-03T12:00:00.000Z',
      primaryMuscle: 'chest',
      secondaryMuscles: ['triceps'],
      sets: [{ weightKg: 100, reps: 10, setType: 'normal' }], // vol 1000
    },
    {
      date: '2024-01-05T12:00:00.000Z',
      primaryMuscle: 'triceps',
      secondaryMuscles: [],
      sets: [{ weightKg: 30, reps: 10, setType: 'normal' }], // vol 300
    },
  ];

  it('aggregates per week with secondary credit', () => {
    const [week] = weeklyMuscleVolume(sessions);
    expect(week?.weekStart).toBe('2024-01-01');
    expect(week?.volumeByMuscle.chest).toBe(1000);
    // triceps: 300 (primary) + 1000*0.5 (secondary from chest) = 800
    expect(week?.volumeByMuscle.triceps).toBe(800);
  });

  it('honors a custom secondary weight', () => {
    const [week] = weeklyMuscleVolume(sessions, { secondaryWeight: 0 });
    expect(week?.volumeByMuscle.triceps).toBe(300);
  });

  it('returns empty for no sessions', () => {
    expect(weeklyMuscleVolume([])).toEqual([]);
  });
});
