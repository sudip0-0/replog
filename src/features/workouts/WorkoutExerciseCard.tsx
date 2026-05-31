import { Card, Button, Text } from 'react-native-paper';
import { View } from 'react-native';
import { SetRow } from './SetRow';
import { RestTimer } from './RestTimer';
import { ExerciseNoteSection } from '@/features/exercises/ExerciseNoteSection';
import {
  useAddSet,
  usePreviousPerformance,
  useRemoveSet,
  useUpdateSet,
} from './useWorkout';
import type { WorkoutExerciseDetail } from './workoutService';
import { fromKg, type WeightUnit } from '@/domain/units';

interface Props {
  workoutId: string;
  detail: WorkoutExerciseDetail;
  unit: WeightUnit;
}

export function WorkoutExerciseCard({ workoutId, detail, unit }: Props) {
  const { exercise, sets, workoutExercise } = detail;
  const addSet = useAddSet(workoutId);
  const updateSet = useUpdateSet(workoutId);
  const removeSet = useRemoveSet(workoutId);
  const { data: prev } = usePreviousPerformance(workoutExercise.exercise_id, workoutId);

  const prevText = prev?.sets.length
    ? `Previous: ${prev.sets
        .map((s) => `${Math.round(fromKg(s.weightKg, unit) * 10) / 10}${unit}×${s.reps}`)
        .join(', ')}`
    : 'No previous data yet';

  const lastSet = sets[sets.length - 1];

  return (
    <Card mode="contained" style={{ marginBottom: 12 }}>
      <Card.Title title={exercise?.name ?? 'Exercise'} subtitle={prevText} />
      <Card.Content style={{ gap: 6 }}>
        <ExerciseNoteSection exerciseId={workoutExercise.exercise_id} />
        {sets.map((s) => (
          <SetRow
            // Re-seed inputs when the persisted values change externally (e.g. sync pull).
            key={`${s.id}:${s.weight_kg}:${s.reps}:${s.rpe}:${s.note}:${unit}`}
            set={s}
            unit={unit}
            onCommit={(patch) => updateSet.mutate({ id: s.id, patch })}
            onToggleComplete={() => updateSet.mutate({ id: s.id, patch: { completed: !s.completed } })}
            onRemove={() => removeSet.mutate(s.id)}
          />
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            icon="plus"
            onPress={() =>
              addSet.mutate({
                workoutExerciseId: workoutExercise.id,
                input: lastSet
                  ? { weight_kg: lastSet.weight_kg, reps: lastSet.reps, set_type: 'normal' }
                  : {},
              })
            }
            accessibilityLabel="Add set"
          >
            Add set
          </Button>
          {sets.length === 0 ? <Text variant="bodySmall">Add your first set</Text> : null}
        </View>
        <RestTimer id={workoutExercise.id} />
      </Card.Content>
    </Card>
  );
}
