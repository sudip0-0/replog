import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';
import { StartConflictDialog } from '@/features/workouts/StartConflictDialog';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exercises" options={{ headerShown: true, title: 'Exercises' }} />
        <Stack.Screen
          name="add-exercise"
          options={{ headerShown: true, title: 'Add Exercise', presentation: 'modal' }}
        />
        <Stack.Screen name="workout/[id]" options={{ headerShown: true, title: 'Workout' }} />
        <Stack.Screen name="history/[id]" options={{ headerShown: true, title: 'Summary' }} />
        <Stack.Screen name="exercise/[id]" options={{ headerShown: true, title: 'Exercise' }} />
        <Stack.Screen name="routine/[id]" options={{ headerShown: true, title: 'Routine' }} />
        <Stack.Screen name="body" options={{ headerShown: true, title: 'Body Metrics' }} />
        <Stack.Screen name="gyms" options={{ headerShown: true, title: 'Gym Profiles' }} />
      </Stack>
      <StartConflictDialog />
    </AppProviders>
  );
}
