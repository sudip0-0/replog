import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useWorkoutDetail, useFinishWorkout } from '@/features/workouts/useWorkout';
import { WorkoutExerciseCard } from '@/features/workouts/WorkoutExerciseCard';
import { useUIStore } from '@/store/uiStore';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useUIStore((s) => s.unit);
  const { data, isLoading } = useWorkoutDetail(id);
  const finish = useFinishWorkout(id);
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={{ margin: 16 }}>Workout not found.</Text>;

  const onFinish = () => {
    finish.mutate(undefined, { onSuccess: () => router.replace('/') });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 8 }}>
      <Text variant="headlineSmall">{data.workout.name}</Text>
      {data.exercises.length === 0 ? (
        <Text variant="bodyMedium" style={{ marginVertical: 12 }}>
          No exercises yet. Add one to start logging.
        </Text>
      ) : (
        data.exercises.map((d) => (
          <WorkoutExerciseCard key={d.workoutExercise.id} workoutId={id} detail={d} unit={unit} />
        ))
      )}

      <Button
        mode="outlined"
        icon="plus"
        onPress={() => router.push({ pathname: '/add-exercise', params: { workoutId: id } })}
        accessibilityLabel="Add exercise"
      >
        Add exercise
      </Button>
      <Button
        mode="contained"
        icon="flag-checkered"
        onPress={() => setConfirm(true)}
        accessibilityLabel="Finish workout"
        style={{ marginTop: 8 }}
      >
        Finish workout
      </Button>

      <Portal>
        <Dialog visible={confirm} onDismiss={() => setConfirm(false)}>
          <Dialog.Title>Finish workout?</Dialog.Title>
          <Dialog.Content>
            <Text>Completed workouts become part of your history and can’t be edited casually.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)}>Cancel</Button>
            <Button onPress={onFinish}>Finish</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
