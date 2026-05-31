import { ScrollView } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useRoutineDetail, useReorderRoutine } from '@/features/routines/useRoutines';
import { RoutineExerciseRow } from '@/features/routines/RoutineExerciseRow';
import { useStartFlow } from '@/features/workouts/useStartFlow';

export default function RoutineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useRoutineDetail(id);
  const reorder = useReorderRoutine(id);
  const { start } = useStartFlow();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={{ margin: 16 }}>Routine not found.</Text>;

  const ids = data.exercises.map((e) => e.routineExercise.id);
  const move = (index: number, dir: -1 | 1) => {
    const next = [...ids];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target] as string, next[index] as string];
    reorder.mutate(next);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 48 }}>
      <Text variant="headlineSmall">{data.routine.name}</Text>

      {data.exercises.length === 0 ? (
        <Text variant="bodyMedium" style={{ marginVertical: 8 }}>
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
    </ScrollView>
  );
}
