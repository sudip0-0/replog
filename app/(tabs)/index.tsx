import { View } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useActiveWorkout } from '@/features/workouts/useWorkout';
import { useStartFlow } from '@/features/workouts/useStartFlow';

export default function TodayScreen() {
  const { data: active, isLoading } = useActiveWorkout();
  const { start } = useStartFlow();

  return (
    <ScreenContainer>
      <View accessibilityRole="header">
        <Text variant="headlineMedium">Today</Text>
        <Text variant="bodyMedium">Fast, offline strength logging.</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator />
      ) : active ? (
        <Card mode="contained">
          <Card.Title title="Workout in progress" subtitle={active.name} />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => router.push({ pathname: '/workout/[id]', params: { id: active.id } })}
              accessibilityLabel="Resume workout"
            >
              Resume
            </Button>
          </Card.Actions>
        </Card>
      ) : (
        <Button
          mode="contained"
          icon="play"
          onPress={() => void start({ kind: 'empty' })}
          accessibilityLabel="Start an empty workout"
        >
          Start empty workout
        </Button>
      )}

      <Button
        mode="outlined"
        icon="magnify"
        onPress={() => router.push('/exercises')}
        accessibilityLabel="Browse exercise library"
      >
        Browse exercises
      </Button>
    </ScreenContainer>
  );
}
