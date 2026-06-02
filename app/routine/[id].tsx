import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useRoutineDetail, useReorderRoutine } from '@/features/routines/useRoutines';
import { RoutineExerciseRow } from '@/features/routines/RoutineExerciseRow';
import { useStartFlow } from '@/features/workouts/useStartFlow';
import { replogColors } from '@/theme';

export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useRoutineDetail(id);
  const reorder = useReorderRoutine(id);
  const { start } = useStartFlow();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={styles.notFound}>Routine not found.</Text>;

  const ids = data.exercises.map((e) => e.routineExercise.id);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...ids];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target] as string, next[index] as string];
    reorder.mutate(next);
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>
        {data.routine.name}
      </Text>

      {data.exercises.length === 0 ? (
        <Text variant="bodyMedium" style={styles.muted}>
          No exercises yet. Add one below.
        </Text>
      ) : (
        data.exercises.map((e, i) => (
          <RoutineExerciseRow
            key={e.routineExercise.id}
            routineId={id}
            detail={e}
            canUp={i > 0}
            canDown={i < data.exercises.length - 1}
            onMove={(dir) => move(i, dir)}
          />
        ))
      )}

      <Button
        mode="outlined"
        icon="plus"
        onPress={() => router.push({ pathname: '/add-exercise', params: { routineId: id } })}
        accessibilityLabel="Add exercise to routine"
      >
        Add exercise
      </Button>
      <Button
        mode="contained"
        icon="play"
        onPress={() => void start({ kind: 'routine', routineId: id })}
        accessibilityLabel="Start workout from this routine"
      >
        Start workout
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFound: { color: replogColors.text, margin: 16 },
  title: { color: replogColors.text, fontWeight: '700' },
  muted: { color: replogColors.textMuted, marginVertical: 8 },
});
