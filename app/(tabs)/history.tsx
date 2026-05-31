import { ScrollView, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { useCompletedWorkouts, useWeeklyMuscleVolume } from '@/features/progress/useProgress';

export default function HistoryScreen() {
  const { data: workouts, isLoading } = useCompletedWorkouts();
  const { data: weeks } = useWeeklyMuscleVolume();
  const latestWeek = weeks?.[weeks.length - 1];

  if (isLoading) return <ActivityIndicator style={{ marginTop: 32 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>
      <Text variant="headlineMedium">History</Text>

      {latestWeek ? (
        <Card mode="contained">
          <Card.Title title="This week's volume" subtitle={`Week of ${latestWeek.weekStart}`} />
          <Card.Content>
            {Object.entries(latestWeek.volumeByMuscle)
              .sort((a, b) => b[1] - a[1])
              .map(([muscle, vol]) => (
                <View
                  key={muscle}
                  style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  <Text>{muscle}</Text>
                  <Text>{Math.round(vol)} kg</Text>
                </View>
              ))}
          </Card.Content>
        </Card>
      ) : null}

      {!workouts || workouts.length === 0 ? (
        <Text variant="bodyMedium">No completed workouts yet. Finish a workout to see it here.</Text>
      ) : (
        workouts.map((wkt) => (
          <List.Item
            key={wkt.id}
            title={wkt.name}
            description={new Date(wkt.completed_at ?? wkt.started_at).toLocaleString()}
            left={(p) => <List.Icon {...p} icon="calendar-check" />}
            onPress={() => router.push({ pathname: '/history/[id]', params: { id: wkt.id } })}
            accessibilityLabel={`${wkt.name}, completed workout`}
          />
        ))
      )}
    </ScrollView>
  );
}
