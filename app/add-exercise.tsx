import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { useAddExercise } from '@/features/workouts/useWorkout';
import { useAddExerciseToRoutine } from '@/features/routines/useRoutines';

export default function AddExerciseScreen() {
  const { workoutId, routineId } = useLocalSearchParams<{
    workoutId?: string;
    routineId?: string;
  }>();
  const addToWorkout = useAddExercise(workoutId ?? '');
  const addToRoutine = useAddExerciseToRoutine(routineId ?? '');

  return (
    <View style={{ flex: 1 }}>
      <ExercisePicker
        onSelect={(exercise) => {
          const mutation = routineId ? addToRoutine : addToWorkout;
          mutation.mutate(exercise.id, { onSuccess: () => router.back() });
        }}
      />
    </View>
  );
}
