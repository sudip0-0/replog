import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
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
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

interface Props {
  workoutId: string;
  detail: WorkoutExerciseDetail;
  unit: WeightUnit;
  onInputFocus?: () => void;
}

export function WorkoutExerciseCard({ workoutId, detail, unit, onInputFocus }: Props) {
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
    <Card mode="contained" style={[ui.card, styles.card]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text variant="titleMedium" style={styles.title}>
              {exercise?.name ?? 'Exercise'}
            </Text>
            <Text variant="bodySmall" numberOfLines={2} style={styles.previous}>
              {prevText}
            </Text>
          </View>
          <Text style={styles.setCount}>{sets.length}</Text>
        </View>
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
            onInputFocus={onInputFocus}
          />
        ))}
        <View style={styles.footer}>
          <Button
            icon="plus"
            mode="outlined"
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
          {sets.length === 0 ? (
            <Text variant="bodySmall" style={styles.muted}>
              Add your first set
            </Text>
          ) : null}
        </View>
        <RestTimer id={workoutExercise.id} />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12, overflow: 'hidden' },
  content: { gap: 8, paddingHorizontal: 10, paddingVertical: 10 },
  header: {
    alignItems: 'flex-start',
    borderBottomColor: replogColors.outline,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: -10,
    marginTop: -10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleBlock: { flex: 1 },
  title: { color: replogColors.text, fontWeight: '700' },
  previous: { color: replogColors.textDim, marginTop: 2 },
  setCount: {
    ...ui.dataText,
    color: replogColors.primary,
    minWidth: 32,
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muted: { color: replogColors.textDim },
});
