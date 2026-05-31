import { ScrollView } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useWorkoutDetail } from '@/features/workouts/useWorkout';
import { fromKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useUIStore((s) => s.unit);
  const { data, isLoading } = useWorkoutDetail(id);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={{ margin: 16 }}>Workout not found.</Text>;

  const w = (kg: number) => `${Math.round(fromKg(kg, unit) * 10) / 10}${unit}`;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineSmall">{data.workout.name}</Text>
      <Text variant="bodySmall">
        {new Date(data.workout.completed_at ?? data.workout.started_at).toLocaleString()}
      </Text>
      {data.exercises.map((e) => (
        <Card key={e.workoutExercise.id} mode="contained">
          <Card.Title title={e.exercise?.name ?? 'Exercise'} />
          <Card.Content>
            {e.sets.map((s, i) => (
              <Text key={s.id}>
                {i + 1}. {s.set_type} · {w(s.weight_kg)} × {s.reps}
                {s.completed ? ' ✓' : ''}
              </Text>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
