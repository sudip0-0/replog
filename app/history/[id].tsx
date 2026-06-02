import { StyleSheet } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useWorkoutDetail } from '@/features/workouts/useWorkout';
import { fromKg } from '@/domain/units';
import { useUIStore } from '@/store/uiStore';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useUIStore((s) => s.unit);
  const { data, isLoading } = useWorkoutDetail(id);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={styles.notFound}>Workout not found.</Text>;

  const w = (kg: number) => `${Math.round(fromKg(kg, unit) * 10) / 10}${unit}`;

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        {data.workout.name}
      </Text>
      <Text variant="bodySmall" style={styles.muted}>
        {new Date(data.workout.completed_at ?? data.workout.started_at).toLocaleString()}
      </Text>
      {data.exercises.map((e) => (
        <Card key={e.workoutExercise.id} mode="contained" style={ui.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              {e.exercise?.name ?? 'Exercise'}
            </Text>
            {e.sets.map((s, i) => (
              <Text key={s.id} style={styles.setLine}>
                {i + 1}. {s.set_type} / {w(s.weight_kg)} x {s.reps}
                {s.completed ? ' / complete' : ''}
              </Text>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFound: { color: replogColors.text, margin: 16 },
  title: { color: replogColors.text, fontWeight: '700' },
  muted: { color: replogColors.textMuted },
  cardContent: { gap: 6, padding: 12 },
  cardTitle: { color: replogColors.text, fontWeight: '700' },
  setLine: { color: replogColors.textMuted, fontVariant: ['tabular-nums'] },
});
