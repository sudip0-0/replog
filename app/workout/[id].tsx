import { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useWorkoutDetail, useFinishWorkout } from '@/features/workouts/useWorkout';
import { WorkoutExerciseCard } from '@/features/workouts/WorkoutExerciseCard';
import { useUIStore } from '@/store/uiStore';
import { replogColors } from '@/theme';
import { ui } from '@/theme/styles';

export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useUIStore((s) => s.unit);
  const { data, isLoading } = useWorkoutDetail(id);
  const finish = useFinishWorkout(id);
  const [confirm, setConfirm] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;
  if (!data) return <Text style={styles.notFound}>Workout not found.</Text>;

  const onFinish = () => {
    finish.mutate(undefined, { onSuccess: () => router.replace('/') });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding" keyboardVerticalOffset={80}>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: keyboardHeight ? keyboardHeight + 160 : 72 }]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
      <View style={styles.workoutHeader}>
        <Text style={ui.label}>Active workout</Text>
        <Text variant="headlineSmall" style={styles.title}>
          {data.workout.name}
        </Text>
      </View>

      {data.exercises.length === 0 ? (
        <Text variant="bodyMedium" style={styles.emptyText}>
          No exercises yet. Add one to start logging.
        </Text>
      ) : (
        data.exercises.map((d) => (
          <WorkoutExerciseCard
            key={d.workoutExercise.id}
            workoutId={id}
            detail={d}
            unit={unit}
            onInputFocus={() => {
              if (keyboardHeight) {
                requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
              }
            }}
          />
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
        style={styles.finishButton}
      >
        Finish workout
      </Button>

      <Portal>
        <Dialog visible={confirm} onDismiss={() => setConfirm(false)} style={ui.sheet}>
          <View style={ui.grabber} />
          <Dialog.Title>Finish workout?</Dialog.Title>
          <Dialog.Content>
            <Text>Completed workouts become part of your history and cannot be edited casually.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirm(false)}>Cancel</Button>
            <Button mode="contained" onPress={onFinish}>
              Finish
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: replogColors.base },
  content: { gap: 8, padding: 16 },
  notFound: { color: replogColors.text, margin: 16 },
  workoutHeader: {
    backgroundColor: replogColors.surface,
    borderColor: replogColors.outline,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  title: { color: replogColors.text, fontWeight: '700' },
  emptyText: { color: replogColors.textMuted, marginVertical: 12 },
  finishButton: { marginTop: 8 },
});
